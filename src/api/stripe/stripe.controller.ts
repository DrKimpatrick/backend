import { NextFunction, Request, Response } from 'express';
import Stripe from 'stripe';
import path from 'path';
import { environment } from '../../config/environment';
import {
  FEATURE_CHOICE,
  MODELS,
  PAYMENT_STATUS,
  PRODUCT_PLANS,
  STATUS_CODES,
  USER_ROLES,
} from '../../constants';
import { HttpError } from '../../helpers/error.helpers';
import IUser, { IUserCoupon } from '../../models/interfaces/user.interface';
import { ModelFactory } from '../../models/model.factory';
import { Subsidy } from '../../interfaces';
import { sendEmail } from '../../config/sendgrid';
import { getEmailTemplate } from '../../shared/email.templates';

const stripe = new Stripe(environment.stripeApiKey, {
  apiVersion: '2020-08-27',
});

export class StripeController {
  getOrCreateCustomer = async (
    customerInfo: Record<string, undefined>,
    paymentMethodId?: string
  ): Promise<Stripe.Customer> => {
    let customer: Stripe.Customer;

    const customers = await stripe.customers.list({
      email: customerInfo.email,
      expand: ['data.subscriptions', 'data.sources'],
    });
    if (customers?.data.length === 0) {
      // no customer found, create one
      customer = await stripe.customers.create({
        payment_method: paymentMethodId,
        email: customerInfo.email,
        name: customerInfo.name,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
        expand: ['subscriptions', 'sources'],
      });
    } else {
      [customer] = customers.data;
    }
    return customer;
  };

  handleSubscription = async (req: Request, res: Response, next: NextFunction) => {
    const userRoles = req.currentUser?.roles;
    if (
      userRoles &&
      (userRoles.includes(USER_ROLES.RECRUITMENT_ADMIN) || userRoles.includes(USER_ROLES.HR_ADMIN))
    ) {
      const { subsidy }: { subsidy: Subsidy } = req.body;
      if (!subsidy || !subsidy.tier || !subsidy.planId || !subsidy.quantity) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: 'valid subsidy detail is required',
        });
      }

      return this.handleAdminTierSubscription(req, res, next);
    }
    // not an admin, validate feature choice
    if (!Object.values(FEATURE_CHOICE).includes(req.body.featureChoice)) {
      return next(new HttpError(STATUS_CODES.BAD_REQUEST, 'valid featureChoice required'));
    }
    return this.handleTalentSubscription(req, res, next);
  };

  handleTalentSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentMethodId, customerInfo, featureChoice, coupon, profileProcess } = req.body;
      const userId = req.currentUser?._id;
      const customer = await this.getOrCreateCustomer(customerInfo, paymentMethodId);

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        coupon,
        items: [
          {
            plan: customerInfo.planId,
          },
        ],
        expand: ['latest_invoice.payment_intent'],
      });

      const userModel = ModelFactory.getModel<IUser>(MODELS.USER);
      await userModel
        .findByIdAndUpdate(userId, {
          featureChoice,
          stripeSubscriptionId: subscription.id,
          couponUsed: coupon,
          profileProcess,
          paymentStatus: PAYMENT_STATUS.CONFIRMED,
        })
        .exec();

      if (coupon) {
        const cpn = await stripe.coupons.retrieve(coupon);
        if (cpn) {
          const userCouponModel = ModelFactory.getModel<IUserCoupon>(MODELS.USER_COUPON);
          await userCouponModel
            .findOneAndUpdate(
              { issuer: cpn.metadata?.issuer, coupon: cpn.id },
              { $push: { usedBy: userId } }
            )
            .exec();
        }
      }

      return res.status(STATUS_CODES.CREATED).json({ subscription });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          `Unable to create subscription due to unexpected error: ${error.message}`,
          error
        )
      );
    }
  };

  handleAdminTierSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        paymentMethodId,
        customerInfo,
        featureChoice,
        subsidy,
        profileProcess,
      }: { [key: string]: any } & { subsidy: Subsidy } = req.body;

      const userId = req.currentUser?._id;
      const customer = await this.getOrCreateCustomer(customerInfo, paymentMethodId);

      const plan = await stripe.plans.retrieve(subsidy.planId, { expand: ['tiers'] });

      const coupon = await stripe.coupons.create({
        currency: plan.currency,
        amount_off: subsidy.tier.unit_amount as number,
        max_redemptions: subsidy.quantity,
        duration: 'forever',
        metadata: { plan: plan.id, email: customerInfo.email, issuer: userId.toString() },
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        coupon: coupon.id,
        items: [
          {
            quantity: subsidy.quantity,
            price_data: {
              product: plan.product as string,
              currency: plan.currency,
              recurring: {
                interval: plan.interval,
                interval_count: plan.interval_count,
              },
              unit_amount: subsidy.tier.unit_amount as number,
            },
          },
        ],
        expand: ['latest_invoice.payment_intent'],
      });

      const userModel = ModelFactory.getModel<IUser>(MODELS.USER);
      await userModel
        .findByIdAndUpdate(userId, {
          featureChoice,
          profileProcess,
          stripeSubscriptionId: subscription.id,
          paymentStatus: PAYMENT_STATUS.CONFIRMED,
        })
        .exec();

      const userCouponModel = ModelFactory.getModel<IUserCoupon>(MODELS.USER_COUPON);
      await userCouponModel.create({ issuer: userId, coupon: coupon.id });

      const ejsData = {
        user: req.currentUser,
        coupon,
        subscription,
        plan,
        numberOfSubsidies: subsidy.quantity,
        tier: subsidy.tier,
      };
      const pathToTemplate = path.join(__dirname, '../../', 'templates/subsidy-coupon.ejs');

      await sendEmail({
        subject: 'Subscription Coupon/Code for talent Users.',
        to: req.currentUser?.email as string,
        html: await getEmailTemplate(pathToTemplate, ejsData),
      });

      return res.status(STATUS_CODES.CREATED).json({ subscription, coupon });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to create subscription due to unexpected error',
          error
        )
      );
    }
  };

  getProductsAndPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ADMIN_PRODUCT_NAME = 'admin subsidies';

      const stripeProducts = await stripe.products.list({ active: true });
      let plans = await stripe.plans.list({ active: true, expand: ['data.tiers'] });

      plans = this.formatPlans(plans.data);
      let products = this.formatProducts(stripeProducts.data);
      products = this.attachPlansToProducts(plans, products);

      return res.status(STATUS_CODES.OK).json({
        products: products.filter((p: any) => p.name.toLowerCase() !== ADMIN_PRODUCT_NAME),
        adminProducts: products.filter((p: any) => p.name.toLowerCase() === ADMIN_PRODUCT_NAME),
      });
    } catch (error) {
      return next(
        new HttpError(500, 'Unable to fetch products due to internal server error', error)
      );
    }
  };

  coupons = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.currentUser?._id;

      const userCouponModel = ModelFactory.getModel<IUserCoupon>(MODELS.USER_COUPON);
      const coupons = await userCouponModel
        .find({ issuer: userId.toString() })
        .populate('issuer usedBy')
        .exec();

      return res.status(STATUS_CODES.OK).json({ coupons });
    } catch (error) {
      return next(
        new HttpError(500, 'Unable to complete the request due to internal server error', error)
      );
    }
  };

  formatUSD = (stripeAmount: number) => `$${(stripeAmount / 100).toFixed(2)}`;

  private formatProducts(products: any) {
    products.forEach((product: any) => {
      const [features] = PRODUCT_PLANS.filter((productPlan) => productPlan.name === product.name);
      product.productDetails = features;
    });

    return products;
  }

  private attachPlansToProducts(plans: any, products: any) {
    products.forEach((product: any) => {
      product.plans = plans.filter((plan: any) => product.id === plan.product);
    });

    return products;
    // We need to return all products available, not only ones with plans
    // return products.filter((product: any) => product.plans.length > 0);
  }

  private formatPlans(plans: any) {
    plans.forEach((plan: any) => {
      if (plan.amount) {
        plan.amount = this.formatUSD(plan.amount);
      }
    });
    return plans;
  }
}

export default new StripeController();

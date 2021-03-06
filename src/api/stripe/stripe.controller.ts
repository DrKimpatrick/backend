import { NextFunction, Request, Response } from 'express';
import Stripe from 'stripe';
import path from 'path';
import { addMonths, addYears, format } from 'date-fns';
import { environment } from '../../config/environment';
import {
  FEATURE_CHOICE,
  MODELS,
  PAYMENT_STATUS,
  PRODUCT_PLANS,
  AFFILIATE_PRODUCT_PREFIX,
  STATUS_CODES,
  USER_ROLES,
  COURSE_BILLING_OPTIONS,
} from '../../constants';
import { HttpError } from '../../helpers/error.helpers';
import IUser, { IUserCoupon } from '../../models/interfaces/user.interface';
import { ModelFactory } from '../../models/model.factory';
import { Subsidy } from '../../interfaces';
import { sendEmail } from '../../config/sendgrid';
import { getEmailTemplate } from '../../shared/email.templates';
import { ICourse } from '../../models/interfaces/course.interface';
import { IUserSubscription, Payment } from '../../models/interfaces/user-subscription.interface';

export class StripeController {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(environment.stripeApiKey, {
      apiVersion: '2020-08-27',
    });
  }

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
    if (Object.values(FEATURE_CHOICE).includes(req.body.featureChoice)) {
      return this.handleTalentSubscription(req, res, next);
    }

    if (req.body.course) {
      return this.handleAffiliateCourseSubscription(req, res, next);
    }

    return next(new HttpError(STATUS_CODES.BAD_REQUEST, 'valid featureChoice required'));
  };

  handleTalentSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentMethodId, customerInfo, featureChoice, coupon, profileProcess } = req.body;

      const userId = req.currentUser?._id;

      const customer = await this.getOrCreateCustomer(customerInfo, paymentMethodId);

      const userModel = ModelFactory.getModel<IUser>(MODELS.USER);

      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        coupon,
        items: [
          {
            plan: customerInfo.planId,
          },
        ],
        expand: ['latest_invoice.payment_intent'],
      });

      const getPlan = await this.stripe.plans.retrieve(customerInfo.planId);

      const { amount, interval, id } = getPlan;

      const paymentObj = {
        amount: amount ? amount / 100 : 0,
        featureChoice,
        paidOn: new Date(),
        subscriptionPriceId: id,
        interval,
      };

      await this.handleUserSubscription({ paymentObj, user: req.currentUser });

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
        const cpn = await this.stripe.coupons.retrieve(coupon);
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

      const plan = await this.stripe.plans.retrieve(subsidy.planId, { expand: ['tiers'] });

      const coupon = await this.stripe.coupons.create({
        currency: plan.currency,
        amount_off: subsidy.tier.unit_amount as number,
        max_redemptions: subsidy.quantity,
        duration: 'forever',
        metadata: { plan: plan.id, email: customerInfo.email, issuer: userId.toString() },
      });

      const { id, interval } = plan;

      const {
        tier: { unit_amount, up_to },
      } = subsidy;

      const paymentObj = {
        amount: unit_amount ? unit_amount / 100 : 0,
        featureChoice,
        paidOn: new Date(),
        subscriptionPriceId: id,
        interval,
        upTo: up_to || undefined,
      };

      await this.handleUserSubscription({ paymentObj, user: req.currentUser });

      const subscription = await this.stripe.subscriptions.create({
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

      const stripeProducts = await this.stripe.products.list({ active: true, limit: 100 });
      let plans = await this.stripe.plans.list({ active: true, expand: ['data.tiers'] });

      plans = this.formatPlans(plans.data);
      let products = this.formatProducts(stripeProducts.data);
      products = this.attachPlansToProducts(plans, products);

      return res.status(STATUS_CODES.OK).json({
        products: products.filter((p) => p.name.toLowerCase() !== ADMIN_PRODUCT_NAME),
        adminProducts: products.filter((p) => p.name.toLowerCase() === ADMIN_PRODUCT_NAME),
        affiliateProducts: products.filter((p) =>
          p.metadata?.name?.startsWith(AFFILIATE_PRODUCT_PREFIX)
        ),
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

  handleAffiliateCourseSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentMethodId, customerInfo, course: courseId } = req.body;

      // fetch course
      const courseModel = ModelFactory.getModel<ICourse>(MODELS.COURSE);
      const userModel = ModelFactory.getModel<IUser>(MODELS.USER);
      const course = await courseModel.findById(courseId);

      if (!course)
        return next(
          new HttpError(STATUS_CODES.BAD_REQUEST, 'courseId does not match any course in our DB')
        );

      // create customer
      const customer = await this.getOrCreateCustomer(customerInfo, paymentMethodId);
      let subscription: any;

      // if one-time, invoice
      if (course.billing === COURSE_BILLING_OPTIONS.ONE_TIME) {
        await this.stripe.invoiceItems.create({
          customer: customer.id,
          price: course.stripeInfo.priceId as string,
        });
        const invoice = await this.stripe.invoices.create({ customer: customer.id });
        subscription = { latest_invoice: invoice };
      } else {
        // else its a subscription
        subscription = await this.stripe.subscriptions.create({
          customer: customer.id,
          items: [
            {
              price: course.stripeInfo.priceId as string,
            },
          ],
          expand: ['latest_invoice.payment_intent'],
        });
      }

      // store customers' courses as comma separated string
      this.stripe.customers.update(customer.id, {
        metadata: {
          courses: customer.metadata.courses
            ? `${customer.metadata.courses},${course.id}`
            : `${course.id}`,
        },
      });

      // update user data to add course they just bought
      await userModel.findByIdAndUpdate(req.currentUser?._id, {
        $push: { paidCourses: course.id },
      });

      // update course to store user who bought
      await courseModel.findByIdAndUpdate(course.id, {
        $push: { customers: req.currentUser?._id },
      });

      const clientEjsData = {
        username: req.currentUser?.username,
        courseName: course.name,
        courseInstructor: course.instructor,
        courseLink: course.existingCourseLink,
      };
      const pathToTemplate = path.join(
        __dirname,
        '../../',
        'templates/course-notification-talent.ejs'
      );

      // email client with course details
      await sendEmail({
        subject: 'Subscription Coupon/Code for talent Users.',
        to: req.currentUser?.email as string,
        html: await getEmailTemplate(pathToTemplate, clientEjsData),
      });

      // TODO: email affiliate to notify about new customer

      return res.status(STATUS_CODES.CREATED).json({ subscription });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to create course subscription due to unexpected error',
          error
        )
      );
    }
  };

  async createAffiliateProduct(courseData: ICourse) {
    // Don't continue if product exists already
    if (courseData.stripeInfo.productId || courseData.stripeInfo.priceId) return;

    const course = await this.stripe.products.create({
      name: courseData.name,
      description: courseData.description,
      metadata: {
        name: `${AFFILIATE_PRODUCT_PREFIX}${courseData.name}`,
      },
    });

    const price = await this.stripe.prices.create({
      currency: 'usd',
      product: course.id,
      unit_amount: parseInt(courseData.price, 10) * 100,
      ...(courseData.billing !== 'one-time' ? { recurring: { interval: courseData.billing } } : {}),
    });

    return { course, price };
  }

  private formatUSD = (stripeAmount: number) => `$${(stripeAmount / 100).toFixed(2)}`;

  private formatProducts(products: any): Stripe.Product[] {
    products.forEach((product: any) => {
      const [features] = PRODUCT_PLANS.filter((productPlan) => productPlan.name === product.name);
      product.productDetails = features;
    });

    return products;
  }

  private attachPlansToProducts(plans: any, products: any): Stripe.Product[] {
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

  private getOrCreateCustomer = async (
    customerInfo: Record<string, undefined>,
    paymentMethodId?: string,
    metadata?: {}
  ): Promise<Stripe.Customer> => {
    let customer: Stripe.Customer;

    const customers = await this.stripe.customers.list({
      email: customerInfo.email,
      expand: ['data.subscriptions', 'data.sources'],
    });

    if (customers?.data.length === 0) {
      // no customer found, create one
      customer = await this.stripe.customers.create({
        payment_method: paymentMethodId,
        email: customerInfo.email,
        name: customerInfo.name,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
        expand: ['subscriptions', 'sources'],
        metadata,
      });
    } else {
      [customer] = customers.data;
    }

    return customer;
  };

  private handleUserSubscription = async ({
    paymentObj,
    user,
  }: {
    paymentObj: Payment;
    user?: IUser;
  }) => {
    const userSubscriptionModel = ModelFactory.getModel<IUserSubscription>(
      MODELS.USER_SUBSCRIPTION
    );

    const userModel = ModelFactory.getModel<IUser>(MODELS.USER);

    const currentYear = new Date().getFullYear();

    const userId = user?._id;

    const getSubscription = await userSubscriptionModel.findOne({
      $and: [{ userId }, { year: currentYear }],
    });

    if (getSubscription) {
      // update payment under year
      await userSubscriptionModel.updateOne(
        { _id: getSubscription._id },
        {
          $push: {
            payment: paymentObj,
          },
        }
      );
    } else {
      const paidOn = format(new Date(paymentObj.paidOn), 'MM/dd/yyyy');

      const nextPaymentDate =
        paymentObj.interval === 'month'
          ? addMonths(new Date(paidOn), 1)
          : addYears(new Date(paidOn), 1);
      // create new subscription
      const createSubscription = await userSubscriptionModel.create({
        userId,
        year: currentYear,
        payment: [paymentObj],
        nextPaymentDate,
      });

      if (createSubscription) {
        if (user && Array.isArray(user.userSubscription)) {
          await userModel.findByIdAndUpdate(userId, {
            $push: { userSubscription: createSubscription._id },
          });
        } else {
          await userModel.findByIdAndUpdate(userId, {
            $set: { userSubscription: [createSubscription._id] },
          });
        }
      }
    }

    return undefined;
  };
}

export default new StripeController();

import { NextFunction, Request, Response } from 'express';
import Stripe from 'stripe';
import { environment } from '../../config/environment';
import { MODELS, PRODUCT_PLANS, STATUS_CODES } from '../../constants';
import { HttpError } from '../../helpers/error.helpers';
import IUser from '../../models/interfaces/user.interface';
import { ModelFactory } from '../../models/model.factory';

const stripe = new Stripe(environment.stripeApiKey, {
  apiVersion: '2020-08-27',
});

export class StripeController {
  async handleSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentMethodId, customerInfo, featureChoice } = req.body;
      const userId = req.currentUser?._id;
      const customer = await stripe.customers.create({
        payment_method: paymentMethodId,
        email: customerInfo.email,
        name: customerInfo.name,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
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
        })
        .exec();

      return res.status(STATUS_CODES.CREATED).json({ subscription });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to create subcription due to unexpected error',
          error
        )
      );
    }
  }

  getProductsAndPlans = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Add filters to fetch talent and hr/admin products separately
    try {
      let products = await stripe.products.list({});
      let plans = await stripe.plans.list({});

      plans = this.formatPlans(plans.data);
      products = this.formatProducts(products.data);
      products = this.attachPlansToProducts(plans, products);

      return res.status(STATUS_CODES.OK).json({ products });
    } catch (error) {
      return next(
        new HttpError(500, 'Unable to fetch products due to internal server error', error)
      );
    }
  };

  private attachPlansToProducts(plans: any, products: any) {
    products.forEach((product: any) => {
      const filteredPlans = plans.filter((plan: any) => {
        return product.id === plan.product;
      });

      product.plans = filteredPlans;
    });

    return products.filter((product: any) => product.plans.length > 0);
  }

  private formatProducts(products: any) {
    products.forEach((product: any) => {
      const [features] = PRODUCT_PLANS.filter((productPlan) => productPlan.name === product.name);
      product.productDetails = features;
    });

    return products;
  }

  private formatPlans(plans: any) {
    plans.forEach((plan: any) => {
      plan.amount = this.formatUSD(plan.amount);
      // plan.formatted = JSON.stringify(plan);
    });

    return plans;
  }

  private formatUSD(stripeAmount: number) {
    return `$${(stripeAmount / 100).toFixed(2)}`;
  }
}

export default new StripeController();

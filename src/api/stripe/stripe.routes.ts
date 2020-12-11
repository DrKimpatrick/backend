import { Router } from 'express';
import { stripeSubscriptionRules } from '../../helpers/stripe-validation.helper';
import { validate } from '../../middleware/request-validation.middleware';
import stripeController from './stripe.controller';

const stripeRouter = Router();

/**
 * @swagger
 * /api/v1/stripe/products:
 *   get:
 *     summary: Retrieve available products
 *     tags: [Stripe]
 *     description: Get a list of formatted products and plans
 *
 *     responses:
 *       200:
 *         description: Successfully fetch products and plans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products: array
 */
stripeRouter.get('/products', stripeController.getProductsAndPlans);

/**
 * @swagger
 * /api/v1/stripe/subscription:
 *   post:
 *     summary: Create a new stripe subscription
 *     tags: [Stripe]
 *     description: Takes in customer info and return a new stripe subscription object
 *     parameters:
 *       - name: paymentMethodId
 *         description: Stripe payment method id
 *         in: body
 *         required: true
 *         type: string
 *       - name: featureChoice
 *         description: Customer feature choice
 *         in: body
 *         required: true
 *         type: string
 *       - name: customerInfo
 *         description: Customer feature choice
 *         in: body
 *         required: true
 *         type: object
 *         properties:
 *           email:
 *             type: string
 *             description: user email
 *           name:
 *             type: string
 *             description: user name
 *           planId:
 *             type: string
 *             description: stripe plan id
 *
 *     responses:
 *       201:
 *         description: Successfully created new subscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subsciption: array
 */
stripeRouter.post(
  '/subscription',
  validate(stripeSubscriptionRules()),
  stripeController.handleSubscription
);

export { stripeRouter };

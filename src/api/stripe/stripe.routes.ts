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
 *         required: false
 *         type: string
 *       - name: profileProcess
 *         in: body
 *         description: Status of the signup process
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
 *       - name: coupon
 *         in: body
 *         required: false
 *         type: string
 *         description: Discount or Promo code shared by the recruiter
 *       - name: subsidy
 *         in: body
 *         required: false
 *         type: object
 *         description: Subsidisation details for students
 *         properties:
 *           planId:
 *             type: string
 *             required: true
 *             description: stripe plan id
 *           quantity:
 *             type: number
 *             required: true
 *             description: Number of students to subsidise
 *           tier:
 *             type: object
 *             require: true
 *             description: Selected student tier
 *             properties:
 *               unit_amount:
 *                 type: number
 *                 required: true
 *
 *     responses:
 *       201:
 *         description: Successfully created new subscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscription:
 *                   type: object
 *                 coupon:
 *                   type: object
 */
stripeRouter.post(
  '/subscription',
  validate(stripeSubscriptionRules()),
  stripeController.handleSubscription
);

/**
 * @swagger
 * /api/v1/stripe/coupons/issued:
 *   get:
 *     summary: Retrieve available coupons for recruiter
 *     tags: [Stripe]
 *     description: Get a list of all coupons ever created by a recruiter
 *
 *     responses:
 *       200:
 *         description: Successfully fetch coupons and talent users who used them
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 coupons:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       coupon:
 *                         type: string
 *                       issuer:
 *                         $ref: '#/definitions/UserProfile'
 *                       usedBy:
 *                         type: array
 *                         items:
 *                           $ref: '#/definitions/UserProfile'
 *                       createdAt:
 *                         type: string
 *                       modifiedAt:
 *                         type: string
 *
 */
stripeRouter.get('/coupons/issued', stripeController.coupons);

export { stripeRouter };

import supertest from 'supertest';
import faker from 'faker';
import { Stripe } from 'stripe';
import { app } from '../../index';
import {
  AdminsProcess,
  FEATURE_CHOICE,
  MODELS,
  SIGNUP_MODE,
  STATUS_CODES,
  TalentProcess,
  USER_ROLES,
} from '../../constants';
import { ModelFactory } from '../../models/model.factory';

describe('Stripe /stripe', () => {
  const userM = ModelFactory.getModel(MODELS.USER);
  const userCouponM = ModelFactory.getModel(MODELS.USER_COUPON);
  let token: string;
  let user: any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return products to all users', (done) => {
    const productsMock = jest.fn().mockResolvedValue({ data: [] });
    const plansMock = jest.fn().mockResolvedValue({ data: [] });
    Stripe.prototype.products = {
      list: productsMock,
    } as any;
    Stripe.prototype.plans = {
      list: plansMock,
    } as any;

    supertest(app)
      .get('/api/v1/stripe/products')
      .end((err, res) => {
        expect(res.status).toBe(STATUS_CODES.OK);
        expect(res.body).toHaveProperty('products');
        expect(productsMock).toHaveBeenCalledTimes(1);
        expect(plansMock).toHaveBeenCalledTimes(1);
        done();
      });
  });

  it('should fail if stripe is not available', (done) => {
    const productsMock = jest.fn().mockRejectedValue('Error fetching products');
    const plansMock = jest.fn().mockRejectedValue('Error fetching plans');
    Stripe.prototype.products = {
      list: productsMock,
    } as any;
    Stripe.prototype.plans = {
      list: plansMock,
    } as any;

    supertest(app)
      .get('/api/v1/stripe/products')
      .end((err, res) => {
        expect(res.status).toBe(STATUS_CODES.SERVER_ERROR);
        expect(productsMock).toHaveBeenCalledTimes(1);
        done();
      });
  });

  it('should not create subscription for unauthenticated users', (done) => {
    supertest(app)
      .post('/api/v1/stripe/subscription')
      .send({})
      .end((err, res) => {
        expect(res.status).toBe(STATUS_CODES.UNAUTHORIZED);
        done();
      });
  });

  it('should create a stripe subscription for Talent', async (done) => {
    const customersMock = jest.fn().mockResolvedValue({ id: faker.random.uuid() });
    const subscriptionsMock = jest.fn().mockResolvedValue({ id: faker.random.uuid() });
    const customersListMock = jest.fn().mockResolvedValue({ data: [] });
    const retrieveMock = jest.fn().mockResolvedValue({ amount: 100, interval: 'year', id: 'id' });

    Stripe.prototype.customers = {
      create: customersMock,
      list: customersListMock,
    } as any;
    Stripe.prototype.subscriptions = {
      create: subscriptionsMock,
    } as any;

    Stripe.prototype.plans = {
      retrieve: retrieveMock,
    } as any;

    user = await userM.create({
      signupMode: SIGNUP_MODE.LOCAL,
      firstName: faker.name.firstName(),
      email: faker.internet.email(),
      username: faker.internet.userName(),
      verified: true,
      password: faker.internet.password(),
      roles: [USER_ROLES.TALENT],
    });

    token = user.toAuthJSON().token;
    const subscription = {
      paymentMethodId: faker.random.uuid(),
      customerInfo: {
        email: faker.internet.email(),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        planId: faker.random.uuid(),
      },
      featureChoice: FEATURE_CHOICE.STANDARD,
      profileProcess: TalentProcess.Completed,
    };

    supertest(app)
      .post('/api/v1/stripe/subscription')
      .set('Authorization', `Bearer ${token}`)
      .send(subscription)
      .end((err, res) => {
        expect(res.status).toBe(STATUS_CODES.CREATED);
        expect(customersMock).toHaveBeenCalledTimes(1);
        expect(subscriptionsMock).toHaveBeenCalledTimes(1);
        done();
      });
  });

  it('should create a stripe subscription for Admin', async (done) => {
    const customersMock = jest.fn().mockResolvedValue({ id: faker.random.uuid() });
    const subscriptionsMock = jest.fn().mockResolvedValue({ id: faker.random.uuid() });
    const customersListMock = jest.fn().mockResolvedValue({ data: [{ id: faker.random.uuid() }] });

    const planId = faker.random.uuid();

    const productMock = jest.fn().mockResolvedValue({ id: faker.random.uuid() });
    const planMock = jest.fn().mockResolvedValue({
      id: planId,
      currency: 'usd',
      product: faker.random.uuid(),
      interval: 'month',
    });
    const couponMock = jest.fn().mockResolvedValue({ id: faker.random.uuid() });

    Stripe.prototype.products = { list: productMock } as any;
    Stripe.prototype.plans = { retrieve: planMock } as any;
    Stripe.prototype.coupons = { create: couponMock } as any;
    Stripe.prototype.customers = { create: customersMock, list: customersListMock } as any;
    Stripe.prototype.subscriptions = { create: subscriptionsMock } as any;

    user = await userM.create({
      signupMode: SIGNUP_MODE.LOCAL,
      firstName: faker.name.firstName(),
      email: faker.internet.email(),
      username: faker.internet.userName(),
      verified: true,
      password: faker.internet.password(),
      roles: [USER_ROLES.HR_ADMIN],
    });

    token = user.toAuthJSON().token;
    const subscription = {
      paymentMethodId: faker.random.uuid(),
      customerInfo: {
        email: faker.internet.email(),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        planId,
      },
      subsidy: {
        quantity: 40,
        planId,
        tier: {
          unit_amount: 5000,
          up_to: 100,
        },
      },
      profileProcess: AdminsProcess.Completed,
      featureChoice: FEATURE_CHOICE.STANDARD,
    };

    supertest(app)
      .post('/api/v1/stripe/subscription')
      .set('Authorization', `Bearer ${token}`)
      .send(subscription)
      .end(async (err, res) => {
        expect(res.status).toBe(STATUS_CODES.CREATED);
        expect(res.body).toHaveProperty('coupon');

        expect(customersMock).toHaveBeenCalledTimes(0);
        expect(customersListMock).toHaveBeenCalledTimes(1);
        expect(subscriptionsMock).toHaveBeenCalledTimes(1);
        expect(couponMock).toHaveBeenCalledTimes(1);
        expect(planMock).toHaveBeenCalledTimes(1);

        const userCoupon = await userCouponM
          .find({
            coupon: res.body.coupon.id,
            issuer: user.id,
          })
          .exec();

        expect(userCoupon).not.toBeNull();
        expect(Array.isArray(userCoupon)).toBeTruthy();
        expect(userCoupon).toHaveLength(1);

        done();
      });
  });

  it('should return coupons created by the admin', async (done) => {
    user = await userM.create({
      signupMode: SIGNUP_MODE.LOCAL,
      firstName: faker.name.firstName(),
      email: faker.internet.email(),
      username: faker.internet.userName(),
      verified: true,
      password: faker.internet.password(),
      roles: [USER_ROLES.HR_ADMIN],
    });
    user = user.toAuthJSON();
    token = user.token;

    const couponMock = {
      coupon: faker.random.alphaNumeric(8),
      issuer: user.profile._id,
    };
    const useCoupon = await userCouponM.create(couponMock);

    supertest(app)
      .get('/api/v1/stripe/coupons/issued')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res.status).toBe(STATUS_CODES.OK);
        expect(res.body).toHaveProperty('coupons');
        expect(Array.isArray(res.body.coupons)).toBeTruthy();
        expect(res.body.coupons).toHaveLength(1);
        expect(res.body.coupons[0]._id).toBe(useCoupon._id.toString());
        expect(res.body.coupons[0].issuer._id).toBe(user.profile._id.toString());
        expect(Array.isArray(res.body.coupons[0].usedBy)).toBeTruthy();
        expect(res.body.coupons[0].usedBy).toHaveLength(0);

        done();
      });
  });

  it('should not create a stripe subscription with an invalid payload', async (done) => {
    user = await userM.create({
      signupMode: SIGNUP_MODE.LOCAL,
      firstName: faker.name.firstName(),
      email: faker.internet.email(),
      username: faker.internet.userName(),
      verified: true,
      password: faker.internet.password(),
      roles: [USER_ROLES.TALENT],
    });

    token = user.toAuthJSON().token;
    const subscription = {
      paymentMethodId: faker.random.uuid(),
      // planId and email missing
      customerInfo: {
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      },
      featureChoice: FEATURE_CHOICE.STANDARD,
    };

    supertest(app)
      .post('/api/v1/stripe/subscription')
      .set('Authorization', `Bearer ${token}`)
      .send(subscription)
      .end((err, res) => {
        expect(res.status).toBe(STATUS_CODES.BAD_REQUEST);
        done();
      });
  });
});

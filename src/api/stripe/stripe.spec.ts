import supertest from 'supertest';
import faker from 'faker';
import { Stripe } from 'stripe';
import { app } from '../../index';
import { STATUS_CODES, SIGNUP_MODE, MODELS, FEATURE_CHOICE, USER_ROLES } from '../../constants';
import { ModelFactory } from '../../models/model.factory';

describe('Stripe /stripe', () => {
  const userM = ModelFactory.getModel(MODELS.USER);
  let token: string;
  let user: any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await userM.deleteMany({});
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

  it('should create a stripe subscription', async (done) => {
    const customersMock = jest.fn().mockResolvedValue({ id: faker.random.uuid() });
    const subscriptionsMock = jest.fn().mockResolvedValue({ id: faker.random.uuid() });
    Stripe.prototype.customers = {
      create: customersMock,
    } as any;
    Stripe.prototype.subscriptions = {
      create: subscriptionsMock,
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

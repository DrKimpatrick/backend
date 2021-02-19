import mongoose from 'mongoose';

const userSubscription = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    year: {
      type: Number,
      required: true,
    },
    payment: [
      {
        paidOn: {
          type: Date,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        featureChoice: {
          type: String,
          required: true,
        },
        subscriptionPriceId: {
          type: String,
          required: true,
        },
        interval: {
          type: String,
          required: true,
        },
        upTo: {
          type: Number,
          required: false,
        },
      },
    ],
    nextPaymentDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: { createdAt: 'dateRegistered' } }
);

export default mongoose.model('UserSubscription', userSubscription);

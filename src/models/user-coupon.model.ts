import mongoose from 'mongoose';

const { Schema } = mongoose;

const userCouponSchema = new Schema(
  {
    coupon: {
      type: mongoose.Schema.Types.String,
      required: true,
      unique: false,
    },
    issuer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: false,
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        default: null,
      },
    ],
  },
  { timestamps: true }
);

// unique together
userCouponSchema.index({ coupon: 1, issuer: 1 }, { unique: true });

export = mongoose.model('UserCoupon', userCouponSchema);

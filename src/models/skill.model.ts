import mongoose from 'mongoose';

const { Schema } = mongoose;

const skillSchema = new Schema(
  {
    skill: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
    },
  },
  { timestamps: true }
);

export = mongoose.model('Skill', skillSchema);

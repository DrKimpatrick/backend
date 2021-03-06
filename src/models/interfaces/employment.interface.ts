import { Document, Schema } from 'mongoose';
import { SKILL_VERIFICATION_STATUS } from '../../constants';

export interface EmploymentHistory extends Document {
  companyName: string;
  startDate: string;
  endDate?: string;
  supervisor?: {
    name: string;
    detail: {
      name: string;
      phoneNumber: string;
      email: string;
    };
  };
  title: string;
  skillsUsed?: string[];
  responsibilities?: string[];
  accomplishments?: string[];
  favoriteProject?: string;
  verificationStatus?: SKILL_VERIFICATION_STATUS;
  userId?: Schema.Types.ObjectId;
  reference?: {
    name: string;
    detail: {
      name: string;
      phoneNumber: string;
      email: string;
    };
  };
  employmentType: string;
}

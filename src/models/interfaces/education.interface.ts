import { Document } from 'mongoose';
import { SKILL_VERIFICATION_STATUS } from '../../constants';

export interface EducationHistory extends Document {
  schoolName: string;
  level: string;
  degreeOrCertification: string;
  specializations: string[];
  startDate: Date;
  endDate: Date;
  isCurrentEducation: boolean;
  accomplishments: string[];
  verificationStatus: SKILL_VERIFICATION_STATUS;
}

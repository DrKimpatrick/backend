import {
  SIGNUP_MODE,
  Supervisor,
  EmploymentType,
  SKILL_LEVEL,
  CourseTimeFormat,
} from '../../../constants';

const updateWrongEducationProfileData = {
  educationHistory: ['5f86b1a4c9233d2444064617'],
};

const updateWrongSkillsData = {
  skills: [{ skill: 'some name' }],
};

const correctUserProfileData = {
  roles: ['talent'],
  featureChoice: 'premium',
  paymentStatus: 'unpaid',
  profileStatus: 'draft|pusblished',
  verified: true,
  firstName: 'John',
  lastName: 'Smith',
  email: 'jsmith@email.com',
  skills: [{ skill: '5f86b1a4c9233d2444064617' }],
  employmentHistory: [
    {
      action: 'create',
      companyName: 'Twitter, Inc',
      supervisor: 'Jack Dorsey',
      title: 'Chief Technical Officer',
      startDate: '2018-12-13',
      endDate: '2020-12-20',
      skillsUsed: [],
      responsibilities: [],
      accomplishments: ['head Boy'],
      favoriteProject: 'Some Project',
      verificationStatus: 'verified',
    },
  ],
  educationHistory: [
    {
      action: 'create',
      schoolName: 'Hack Reactor',
      level: 'Technical Bootcamp',
      degreeOrCertification: 'Fullstack Developer',
      specializations: ['Backend Infrastructure'],
      startDate: '2018-12-13',
      endDate: '2020-12-20',
      accomplishments: ['Graduated top of class'],
      verificationStatus: 'verified',
    },
  ],
};

const addCourse = {
  name: 'aaron',
  currentLangSpecsUpdated: false,
  instructor: 'snow',
  languageTaught: 'English',
  existingCourseLink: 'https://youtube.com',
  coverImageLink: 'https://images.com/image.png',
  level: SKILL_LEVEL.BEGINNER,
  duration: 5,
  format: CourseTimeFormat.Hour,
  price: 5,
  billing: 'one-time',
};

const addUser = (role: string) => {
  return {
    signupMode: SIGNUP_MODE.LOCAL,
    firstName: 'Some Name',
    email: `pl${Math.random()}@gmail.com`,
    username: `pl${Math.random()}@gmail.com`,
    verified: true,
    password: 'really',
    roles: [role],
  };
};

const addNewEmployment = (userId: string) => {
  return {
    companyName: 'Twitter, Inc',
    supervisor: {
      name: Supervisor.Employee,
      detail: {
        name: 'john',
        email: 'john@gmail.com',
        phoneNumber: '+250786601256',
      },
    },
    title: 'Chief Technical Officer',
    startDate: '2018-12-13',
    endDate: '2020-12-20',
    responsibilities: ['responsibilities'],
    accomplishments: ['head Boy'],
    favoriteProject: 'Some Project',
    verificationStatus: 'verified',
    isCurrentPosition: false,
    employmentType: EmploymentType.FullTime,
    userId,
  };
};

const addNewCompanyOrSchool = () => {
  return {
    name: 'sky-tech',
    address: 'Jack Dorsey',
    website: 'sky-tech.com',
    accountManagerName: 'name or title',
    email: `new.company${Math.random()}@company.com`,
    phone: '+250 788 903 119',
  };
};

export {
  updateWrongEducationProfileData,
  updateWrongSkillsData,
  correctUserProfileData,
  addCourse,
  addUser,
  addNewEmployment,
  addNewCompanyOrSchool,
};

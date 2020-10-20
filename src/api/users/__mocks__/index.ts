const updateWrongEducationProfileData = {
  educationHistory: ['5f86b1a4c9233d2444064617'],
};

const updateWrongSkillsData = {
  skills: [{ name: 'some name' }],
};

const correctUserProfileData = {
  role: 'talent',
  featureChoice: 'premium',
  paymentStatus: 'unpaid',
  profileStatus: 'draft|pusblished',
  verified: true,
  firstName: 'John',
  lastName: 'Smith',
  email: 'jsmith@email.com',
  skills: ['5f86b1a4c9233d2444064617'],
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

export { updateWrongEducationProfileData, updateWrongSkillsData, correctUserProfileData };

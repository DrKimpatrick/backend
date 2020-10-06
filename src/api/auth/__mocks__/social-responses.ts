const socialAuthResponse = {
  displayName: 'some Name',
  id: 23456,
  toAuthJSON: jest.fn(() => ({ token: 'Some Token' })),
};

export { socialAuthResponse };

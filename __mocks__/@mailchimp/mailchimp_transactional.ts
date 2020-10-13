export default (apiKey = '') => {
  return {
    messages: {
      send: jest.fn().mockResolvedValue('Test Email Sent'),
    },
  };
};

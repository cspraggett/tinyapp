const {assert} = require('chai');

const {getUsersByEmail} = require('../helpers');

const testUsers = {
  userRandomID: {
    id: 'userRandomID',
    email: 'cspraggett@gmail.com',
    password: '$2b$10$XvPyZkhoSyzAk.Tbmfh/d.P/wnpGZ82lJ.4xeCxWejpdfvKhHW/6i',
  },
  user2RandomID: {
    id: 'user1',
    email: 'user@example.com',
    password: '$2b$10$S/YVIkf6SNHTmZi12eoDVO3Ie5zH8nGt7AVJdVBTKg2BaWxM/bmm2',
  }
};

describe('getUsersByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUsersByEmail('cspraggett@gmail.com', testUsers)
    const expectedOutput = 'userRandomID';
    assert.equal(user, expectedOutput);
  })
});
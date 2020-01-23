const { assert } = require('chai');

const { getUsersByEmail, getUrlsForUser } = require('../helpers');

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
  },
};

const testURLs = {
  b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'userRandomID' },
};

describe('getUsersByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUsersByEmail('cspraggett@gmail.com', testUsers);
    const expectedOutput = 'userRandomID';
    assert.equal(user, expectedOutput);
  });

  it('should return a user with valid email', () => {
    const user = getUsersByEmail('user@example.com', testUsers);
    const expectedOutput = 'user2RandomID';
    assert.equal(user, expectedOutput);
  });
  it('should return undefined with an invalid email', () => {
    assert.isUndefined(getUsersByEmail('notARealEmail@example.com', testUsers));
  });
  it('should return { Object (b2xVn2, 9sm5xK) } with user: userRandomID', () => {
    const actual = getUrlsForUser('userRandomID', testURLs);
    const expectedOutput = {
      b2xVn2: 'http://www.lighthouselabs.ca',
      '9sm5xK': 'http://www.google.com',
    };
    assert.deepEqual(actual, expectedOutput);
  });
  it('should return {} when passed in user2RandomID', () => {
    assert.deepEqual(getUrlsForUser('user2RandomID', testURLs), {});
  });
});

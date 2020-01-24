// Checks if email is in the users object. Returns the userID if true and the empty string if false.
const getUsersByEmail = (email, user) => {
  let ret = Object.keys(user).filter((v) => email === user[v].email).join('');
  if (!ret) {
    ret = undefined;
  }
  return ret;
};

// Checks database and returns an object with the urls asscoiated with the user.
const getUrlsForUser = (id, urlDB) => {
  const ret = {};
  Object.keys(urlDB).forEach((value) => {
    if (urlDB[value].userID === id) {
      ret[value] = urlDB[value].longURL;
    }
  });
  return ret;
};

const generateRandomString = () => Math.random()
  .toString(36)
  .slice(2, 8);

// Inserts or updates urlDatabase with longURL value.
const updateUrlDatabase = (short, longURL, userID, urlDB) => {
  const lURL = longURL.includes('http://') ? longURL : `http://${longURL}`;
  urlDB[short] = { longURL: lURL, userID };
};

module.exports = {
  getUsersByEmail, getUrlsForUser, generateRandomString, updateUrlDatabase,
};

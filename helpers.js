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

module.exports = { getUsersByEmail, getUrlsForUser };

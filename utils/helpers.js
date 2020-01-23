// Checks if email is in the users object. Returns the userID if true and the undefined if false.
const getUsersByEmail = (email, user) => {
  const ret = Object.keys(user).filter((v) => email === user[v].email).join('');
  return ret ? ret : undefined;
}

module.exports = {getUsersByEmail};
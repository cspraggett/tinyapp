// Checks if email is in the users object. Returns the userID if true and the empty string if false.
const getUsersByEmail = (email, user) => Object.keys(user).filter((v) => email === user[v].email).join('');

module.exports = {getUsersByEmail};
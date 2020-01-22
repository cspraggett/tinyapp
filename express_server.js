const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "cspraggett@gmail.com",
    password: "123"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const generateRandomString = () =>
  Math.random()
    .toString(36)
    .slice(2, 8);

const updateUrlDatabase = (short, long) => {
  urlDatabase[short] = long;
};

const checkUsersEmailExists = email => {
  for (const key in users) {
    if (users[key].email === email) {
      return key;
    }
  }
  return false;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>");
});

app.get("/urls", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortName = generateRandomString();
  updateUrlDatabase(shortName, `http://${req.body.longURL}`);
  res.redirect(`/urls/${shortName}`);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  console.log("tpv", templateVars);
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(urlDatabase);
  let short = req.params.shortURL;
  delete urlDatabase[short];
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const ID = checkUsersEmailExists(email);
  console.log("id:", ID);
  if (!ID) {
    res.status(403).send("e-mail not found!");
  }
  if (users[ID].password !== password) {
    res.status(403).send("Password incorrect!");
  }
  console.log("before:", req.cookies["user_id"]);
  res.cookie("user_id", ID);
  console.log("after:", req.cookies["user_id"]);
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Please fill out email and password");
  }
  if (checkUsersEmailExists(email)) {
    res.status(400).send("Email already in use!");
  }
  users[id] = {
    id,
    email,
    password
  };
  console.log(users);
  console.log(checkUsersEmailExists(email));
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

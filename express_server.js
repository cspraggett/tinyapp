const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const PORT = 8080;

const password = "123";
const hashedPassword = bcrypt.hashSync(password, 10);
console.log(hashedPassword);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "cspraggett@gmail.com",
    password: "$2b$10$XvPyZkhoSyzAk.Tbmfh/d.P/wnpGZ82lJ.4xeCxWejpdfvKhHW/6i"
  },
  user2RandomID: {
    id: "user1",
    email: "user@example.com",
    password: "$2b$10$S/YVIkf6SNHTmZi12eoDVO3Ie5zH8nGt7AVJdVBTKg2BaWxM/bmm2"
  }
};

const hashPassword = password => bcrypt.hashSync(password, 10);

const generateRandomString = () =>
  Math.random()
    .toString(36)
    .slice(2, 8);

const updateUrlDatabase = (short, longURL, userID) => {
  urlDatabase[short] = { longURL, userID };
  console.log(urlDatabase);
};

const checkUsersEmailExists = email => {
  for (const key in users) {
    if (users[key].email === email) {
      return key;
    }
  }
  return false;
};

const urlsForUser = id => {
  const ret = {};
  for (const keys in urlDatabase) {
    if (urlDatabase[keys].userID === id) {
      ret[keys] = urlDatabase[keys].longURL;
    }
  }
  return ret;
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
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlsForUser(req.cookies["user_id"])
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  if (!templateVars.user) {
    res.statusCode = 401;
    res.redirect("/urls");
    return;
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortName = generateRandomString();
  updateUrlDatabase(
    shortName,
    `http://${req.body.longURL}`,
    req.cookies["user_id"]
  );
  res.redirect(`/urls/${shortName}`);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
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
  if (urlDatabase[req.params.shortURL].userID !== req.cookies["user_id"]) {
    res
      .status(401)
      .send(
        "Urls can only be edited by the user who created them, please register or login"
      );
    return;
  }
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let short = req.params.shortURL;
  if (urlDatabase[short].userID === req.cookies["user_id"]) {
    delete urlDatabase[short];
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  let short = req.params.shortURL;
  if (urlDatabase[short].userID === req.cookies["user_id"]) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  }
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const ID = checkUsersEmailExists(email);
  if (!ID) {
    res.status(403).send("e-mail not found!");
  }
  if (!bcrypt.compareSync(password, users[ID].password)) {
    res.status(403).send("Password incorrect!");
    return;
  }
  res.cookie("user_id", ID);
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
    password: hashPassword(password)
  };
  console.log(users[id].password);
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

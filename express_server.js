const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const cookiesession = require('cookie-session');
const bcrypt = require('bcrypt');
const { getUsersByEmail, getUrlsForUser } = require('./helpers');

const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookiesession({
    name: 'session',
    secret: 'test',
    maxAge: 24 * 60 * 60 * 1000,
  }),
);
app.set('view engine', 'ejs');

const urlDatabase = {
  b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'userRandomID' },
};

const users = {
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

const hashPassword = (password) => bcrypt.hashSync(password, 10);

const generateRandomString = () => Math.random()
  .toString(36)
  .slice(2, 8);

const updateUrlDatabase = (short, longURL, userID) => {
  urlDatabase[short] = { longURL, userID };
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: getUrlsForUser(req.session.user_id, urlDatabase),
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (!templateVars.user) {
    res.statusCode = 401;
    res.redirect('/urls');
    return;
  }
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  const shortName = generateRandomString();
  updateUrlDatabase(
    shortName,
    `http://${req.body.longURL}`,
    req.session.user_id,
  );
  res.redirect(`/urls/${shortName}`);
});

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  console.log(templateVars);
  res.render('login', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const long = urlDatabase[req.params.shortURL].longURL;
  res.redirect(long);
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('register', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res
      .status(401)
      .send(
        'Urls can only be edited by the user who created them, please register or login',
      );
    return;
  }
  const templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };
  console.log('url/:short-', templateVars);
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const short = req.params.shortURL;
  if (urlDatabase[short].userID === req.session.user_id) {
    delete urlDatabase[short];
  }
  res.redirect('/urls');
});

app.post('/urls/:shortURL/update', (req, res) => {
  const short = req.params.shortURL;
  if (urlDatabase[short].userID === req.session.user_id) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  }
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const ID = getUsersByEmail(email, users);
  console.log('in /login:', ID);
  if (!ID) {
    res.status(403).send('e-mail not found!');
    return;
  }
  if (!bcrypt.compareSync(password, users[ID].password)) {
    res.status(403).send('Password incorrect!');
    return;
  }
  req.session.user_id = ID;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send('Please fill out email and password');
    return;
  }
  if (getUsersByEmail(email, users)) {
    res.status(400).send('Email already in use!');
    return;
  }
  users[id] = {
    id,
    email,
    password: hashPassword(password),
  };

  req.session.user_id = id;
  // (req.session.user_id || 0) + 1;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

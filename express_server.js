const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const cookiesession = require('cookie-session');
const bcrypt = require('bcrypt');
const {
  getUsersByEmail, getUrlsForUser, generateRandomString, updateUrlDatabase,
} = require('./helpers');

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

app.get('/', (req, res) => {
  res.redirect(req.session.user_id ? '/urls' : '/login');
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
    res.redirect('/login');
    return;
  }
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    const templateVars = {
      user: users[req.session.user_id],
      urls: getUrlsForUser(req.session.user_id, urlDatabase),
      message: 'You must be logged in to create URLs',
    };
    res.render('error', templateVars);
    return;
  }
  const shortName = generateRandomString();
  updateUrlDatabase(
    shortName,
    `http://${req.body.longURL}`,
    req.session.user_id, urlDatabase,
  );
  res.redirect(`/urls/${shortName}`);
});

app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('urls');
    return;
  }
  // console.log(req.session.user_id);
  const templateVars = { user: users[req.session.user_id] };
  res.render('login', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('urls');
    return;
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render('register', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: getUrlsForUser(req.session.user_id, urlDatabase),
  };
  if (!req.session.user_id) {
    templateVars.message = 'You must be logged in to see this page';
    res.render('error', templateVars);
    return;
  }
  if (!urlDatabase[req.params.shortURL]) {
    console.log('not here!');
    templateVars.message = 'That URL does not exist';
    res.render('error', templateVars);
    return;
  }
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    templateVars.message = 'You can only edit URLs that you have created';
    res.render('error', templateVars);
    return;
  }
  templateVars.shortURL = req.params.shortURL;
  templateVars.longURL = urlDatabase[req.params.shortURL].longURL;
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const short = req.params.shortURL;
  if (urlDatabase[short].userID === req.session.user_id) {
    delete urlDatabase[short];
    res.redirect('/urls');
  } else if (urlDatabase[short].userID !== req.session.user_id) {
    const templateVars = {
      user: users[req.session.user_id],
      urls: getUrlsForUser(req.session.user_id, urlDatabase),
      message: 'You can\'t delete URLs that you didn\'t create ',
    };
    res.render('error', templateVars);
  } else {
    const templateVars = {
      user: users[req.session.user_id],
      urls: getUrlsForUser(req.session.user_id, urlDatabase),
      message: 'You need to be logged in to delete URLs ',
    };
    res.render('error', templateVars);
  }
});

app.post('/urls/:shortURL/update', (req, res) => {
  const short = req.params.shortURL;
  if (urlDatabase[short].userID === req.session.user_id) {
    updateUrlDatabase(short, req.body.longURL, urlDatabase[short].userID, urlDatabase);
    res.redirect('/urls');
  } else if (urlDatabase[short].userID !== req.session.user_id) {
    const templateVars = {
      user: users[req.session.user_id],
      urls: getUrlsForUser(req.session.user_id, urlDatabase),
      message: 'You can\'t edit URLs that you didn\'t create ',
    };
    res.render('error', templateVars);
  } else {
    const templateVars = {
      user: users[req.session.user_id],
      urls: getUrlsForUser(req.session.user_id, urlDatabase),
      message: 'You need to be logged in to edit URLs',
    };
    res.render('error', templateVars);
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const ID = getUsersByEmail(email, users);
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

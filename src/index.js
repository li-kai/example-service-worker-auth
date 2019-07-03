const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// Example secret used here.
// Do not follow in production environment!
const secret = process.env.SECRET || 'REMOVE_IN_PROD';

// Prepare an express server
const app = express();

// Serve files in /public folder
const publicFolder = path.resolve(__dirname, '../public');
app.use(express.static(publicFolder));
// Parse json in body
app.use(bodyParser.json());

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username !== 'admin' || password !== 'password') {
    res.status(401).json({
      success: false,
      message: 'Incorrect username or password',
    });
    return;
  }

  // If we reach here, we are authenticated,
  // create the JWT token and sent it to the user
  const token = jwt.sign({ username: username }, secret, {
    expiresIn: '24h',
  });
  res.json({
    success: true,
    message: 'Authentication successful',
    token: token,
  });
});

// Example resource that requires authentication
app.get('/protected', (req, res, next) => {
  let token = req.headers['authorization'];
  if (token && token.indexOf('Bearer ') === 0) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'No auth token found',
    });
    return;
  }

  jwt.verify(token, secret, err => {
    if (err) {
      res.status(401).json({
        success: false,
        message: 'Invalid auth token',
      });
      return;
    }
    res.json({
      success: true,
      message: "If you see this, you've obtained protected data!",
    });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}!`));

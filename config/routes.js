const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { authenticate, generateToken } = require('../auth/authenticate');

const Jokes = require('../jokes/jokes-model.js')

module.exports = server => {
 server.post('/api/register', register);
 server.post('/api/login', login);
 server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
 let user = req.body;
 const hash = bcrypt.hashSync(user.password, 4);
 user.password = hash;

 Jokes
   .add(user)
   .then(saved => {
     res.status(201).json(saved)
   })
   .catch(error => {
     res.status(500).json({error: 'Registration Failed'});
   });
}

function login(req, res) {
 let { username, password } = req.body;

 Jokes
   .findBy({ username })
   .first()
   .then(user => {
     if (user && bcrypt.compareSync(password, user.password)) {
     const token = generateToken(user);

       res.status(200).json({
         message: `Welcome ${user.username}!`,
         token,
       });
     } else {
       res.status(401).json({ message: 'Invalid Credentials' });
     }
   })
   .catch(error => {
     res.status(500).json({error: 'Log In Failed'});
   });

}

function getJokes(req, res) {
 const requestOptions = {
   headers: { accept: 'application/json' },
 };

 axios
   .get('https://icanhazdadjoke.com/search', requestOptions)
   .then(response => {
     res.status(200).json(response.data.results);
   })
   .catch(err => {
     res.status(500).json({ message: 'Error Fetching Jokes', error: err });
   });

}



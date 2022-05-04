const express = require('express');
const { check, body } = require('express-validator/check');

const myauthController = require('../controllers/myauth');
const User = require('../models/user');

const router = express.Router();

router.get('/mylogin', myauthController.getMyLogin);

router.post('/mylogin', myauthController.postMyLogin);

router.get('/mysignup', myauthController.getMySignup);

router.post('/mysignup', myauthController.postMySignup);

router.post('/mylogout', myauthController.postMyLogout);


module.exports = router;
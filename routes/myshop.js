const path = require('path');

const express = require('express');

const myshopController = require('../controllers/myshop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', myshopController.getIndex);

router.get('/about-us', myshopController.getAboutUs);

router.get('/my-cart', isAuth, myshopController.getMyCart);

router.post('/my-cart', isAuth, myshopController.postMyCart);

router.post('/my-cart-delete-item', isAuth, myshopController.postMyCartDeleteProduct);

router.get('/contact-us', myshopController.getContactUs);

router.get('/my-orders', isAuth, myshopController.getMyOrders);

router.get('/single-product-view/:productId', myshopController.getSingleProduct);

router.get('/mycheckout', isAuth, myshopController.getMyCheckout);

router.get('/checkout/success', myshopController.getCheckoutSuccess);

router.get('/checkout/cancel', myshopController.getMyCheckout);


// router.get('/address', isAuth, myshopController.getAddress);

// router.get('/address', isAuth, myshopController.getAddress);


router.get('/my-address', isAuth, myshopController.getMyAddress);

router.post('/my-address', isAuth, myshopController.postMyAddress);

router.post('/delete-address', isAuth, myshopController.postDeleteMyAddress);

router.get('/add-address', isAuth, myshopController.getAddAddress);

router.post('/add-address', isAuth, myshopController.postAddAddress);














router.get('/vegetables', myshopController.getVegetables);

router.get('/fruits', myshopController.getFruits);

router.get('/rice', myshopController.getRiceProducts);

router.get('/masalas-spices', myshopController.getMasalaSpices);

router.get('/salt-sugar-jaggery', myshopController.getSaltSugarJaggery);

router.get('/tea', myshopController.getTea);

router.get('/coffee', myshopController.getCoffee);


module.exports = router;

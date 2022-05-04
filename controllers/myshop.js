const fs = require('fs');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const Product = require('../models/product');
const Order = require('../models/order');
const Address = require('../models/address');

exports.getIndex = (req, res, next) => {
  let username = (req.user) ? req.user.name : 'username';
  Product.find()
  .then(products => {
    res.render('myshop/index', {
      pageTitle: 'Cartgrow',
      path: '/products',
      products: products,
      username: username
     });
  })
  .catch(err => {
    console.log(err);
  })
 
};

exports.getMyCheckout = (req, res, next) => {
  let products;
  let total = 0;
  let username = (req.user) ? req.user.name : 'username';
  const userId = req.user._id;
  Address.find({ userId: userId })
  .then(addresses => {
    req.user
      .populate('cart.items.productId')
      .execPopulate()
      .then(user => {
        products = user.cart.items;
        total = 0;
        products.forEach(p => {
          total += p.quantity* p.productId.price;
        });
        return stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: products.map(p => {
            return {
              name: p.productId.title,
              description: p.productId.description,
              amount: p.productId.price*100,
              currency: 'inr',
              quantity: p.quantity,
            }
          }),
          success_url: req.protocol + '://' + req.get('host') + '/checkout/success', 
          cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
        });
        
      })
      .then(session => {
        res.render('myshop/mcheckout', {
          path: '/',
          pageTitle: 'checkout',
          products: products,
          adds: addresses,
          editing: false,
          username: username,
          totalsum: total,
          sessionId: session.id
        });
      })
      .catch(err => console.log(err));
      })
};


// exports.getCheckoutSuccess = (req, res, next) => {
//   const fullAddress = req.body.fullAddress;
//   req.user
//     .populate('cart.items.productId')
//     .execPopulate()
//     .then(user => {
//       const products = user.cart.items.map(i => {
//         return { quantity: i.quantity, product: { ...i.productId._doc } };
//       });
//       const order = new Order({
//         user: {
//           email: req.user.email,
//           userId: req.user
//         },
//         products: products,
//         addres: {
//           fullAddress: fullAddress,
//           userId: req.user
//         }
//       });
//       return order.save();
//     })
//     .then(result => {
//       return req.user.clearCart();
//     })
//     .then(() => {
//       res.redirect('/my-orders');
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

exports.getCheckoutSuccess = (req, res, next) => {
  const fullAddress = req.body.fullAddress;
  const userId = req.user._id;
  Address.find({ userId: userId })
  .then(addresses => {
      req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
          const products = user.cart.items.map(i => {
            return { quantity: i.quantity, product: { ...i.productId._doc } };
          });
          const order = new Order({
            user: {
              email: req.user.email,
              userId: req.user
            },
            products: products,
            addres: {
              fullAddress: addresses[0].add,
              userId: req.user
            }
          });
          return order.save();
        })
        .then(result => {
          return req.user.clearCart();
        })
        .then(() => {
          res.redirect('/my-orders');
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch(err => {
      console.log(err);
    })
};


exports.getAboutUs = (req, res, next) => {
  let username = (req.user) ? req.user.name : 'username';
 res.render('myshop/about-us', {
  pageTitle: 'About-us',
  path: '/products',
  username: username
 }) 
};

exports.getSingleProduct = (req, res, next) => {
  let username = (req.user) ? req.user.name : 'username';
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
        res.render('myshop/product-detail', {
        pageTitle: 'Cartgrow/product',
        path: '/products',
        product: product,
        username: username
      }) 
    })
    .catch(err => {
      console.log(err);
    })
 
};

exports.getMyCart = (req, res, next) => {
  let username = (req.user) ? req.user.name : 'username';
      req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
          const products = user.cart.items;
          res.render('myshop/yourcart', {
            path: '/cart',
            pageTitle: 'Cart',
            products: products,
            username: username,
            email: req.user.email
          });
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });    
};

exports.postMyCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      // console.log(result);
      res.redirect('/my-cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.postMyCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/my-cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getContactUs = (req, res, next) => {
  let username = (req.user) ? req.user.name : 'username';
 res.render('myshop/contact-us', {
  pageTitle: 'Contact-us',
  path: '/products',
  username: username
 }) 
};


exports.postMyOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/my-orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getMyOrders = (req, res, next) => {
  let username = (req.user) ? req.user.name : 'username';
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('myshop/my-orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        email: req.user.email,
        username: username
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.getMyAddress = (req, res, next) => {
  let username = (req.user) ? req.user.name : 'username';
  const userId = req.user._id;
  Address.find({userId: userId})
    .then(addresses => {
      res.render('myshop/address', {
        adds: addresses,
        pageTitle: 'Address',
        path: '/',
        editing: false,
        username: username
      });
      // console.log(addresses);
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getAddAddress = (req, res, next) => {
  let username = (req.user) ? req.user.name : 'username';
  Address.find()
    .then(addresses => {
      res.render('shop/add-address', {
        adds: addresses,
        pageTitle: 'Address',
        path: '/',
        editing: false,
        username: username
      });
      // console.log(addresses);
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postAddAddress = (req, res, next) => {
  const name = req.body.name;
  const locality = req.body.locality;
  const pincode = req.body.pincode;
  const add = req.body.add;
  const phoneNo = req.body.phoneNo;
  const address = new Address({
    name: name,
    locality: locality,
    pincode: pincode,
    add: add,
    userId: req.user,
    phoneNo: phoneNo,
    email: req.user.email
  });
  address
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created address');
      res.redirect('/mycheckout');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postMyAddress = (req, res, next) => {
  const name = req.body.name;
  const locality = req.body.locality;
  const pincode = req.body.pincode;
  const add = req.body.add;
  const phoneNo = req.body.phoneNo;
  const address = new Address({
    name: name,
    locality: locality,
    pincode: pincode,
    add: add,
    phoneNo: phoneNo,
    userId: req.user,
    email: req.user.email
  });
  address
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created address');
      res.redirect('/my-address');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postDeleteMyAddress = (req, res, next) => {
  const addId = req.body.addressId;
  Address.deleteOne({ _id: addId, userId: req.user._id })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/mycheckout');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// PRODUCT CATEGORIES

exports.getVegetables = (req, res, next) => {
  let username = (req.user) ? req.user.name : 'username';
  Product.find({category: 'vegetables'})
  .then(products => {
    res.render('myshop/product-temp', {
      prods: products,
      pageTitle: 'Vegetables',
      prodHead: 'Vegetables',
      path: '/products',
      username: username
     });
  })
  .catch(err => {
    console.log(err);
  });
};

exports.getFruits = (req, res, next) => {
  let username = (req.user) ? req.user.name : 'username';
  Product.find({category: 'fruits'})
    .then(products => {
      res.render('myshop/product-temp', {
        prods: products,
        pageTitle: 'Fruits',
        prodHead: 'Fruits',
        path: '/products',
        username: username
       });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getRiceProducts = (req, res, next) => {
  let username = (req.user) ? req.user.name : 'username';
  Product.find({category: 'rice'})
    .then(products => {
      res.render('myshop/product-temp', {
        prods: products,
        pageTitle: 'Rice & Rice-Products',
        prodHead: 'Rice & Rice-Products',
        path: '/products',
        username: username
       });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getMasalaSpices = (req, res, next) => {
  let username = (req.user) ? req.user.name : 'username';
  Product.find({category: 'masalas-spices'})
    .then(products => {
      res.render('myshop/product-temp', {
        prods: products,
        pageTitle: 'Masala & Spices',
        prodHead: 'Masala & Spices',
        path: '/products',
        username: username
       });
    })
    .catch(err => {
      console.log(err);
    });
 
};

exports.getSaltSugarJaggery = (req, res, next) => {
  let username = (req.user) ? req.user.name : 'username';
  Product.find({category: 'salt-sugar-jaggery'})
    .then(products => {
      res.render('myshop/product-temp', {
        prods: products,
        pageTitle: 'Salt, Sugar & Jaggery',
        path: '/products',
        prodHead: 'Salt, Sugar & Jaggery',
        username: username
       });
    })
    .catch(err => {
      console.log(err);
    });
  
};

exports.getTea = (req, res, next) => {
  let username = (req.user) ? req.user.name : 'username';
  Product.find({category: 'tea'})
    .then(products => {
      res.render('myshop/product-temp', {
        prods: products,
        pageTitle: 'Beverages',
        prodHead: 'Beverages',
        path: '/products',
        username: username
       });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCoffee = (req, res, next) => {
  let username = (req.user) ? req.user.name : 'username';
  Product.find({category: 'coffee'})
    .then(products => {
      res.render('myshop/product-temp', {
        prods: products,
        pageTitle: 'Coffee',
        prodHead: 'Coffee',
        path: '/products',
        username: username
       });
    })
    .catch(err => {
      console.log(err);
    });
};

// address


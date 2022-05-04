exports.get404 = (req, res, next) => {
  let username = (req.user) ? req.user.name : 'username';
  res.status(404).render('my-404', {
    pageTitle: 'Page Not Found',
    path: '/404',
    isAuthenticated: req.session.isLoggedIn,
    username: username
  });
};

exports.get500 = (req, res, next) => {
  let username = (req.user) ? req.user.name : 'username';
  res.status(500).render('my-500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn,
    username: username
  });
};

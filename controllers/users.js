const { model } = require('mongoose');
const User = require('../models/user');


module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}


module.exports.register = async (req, res) => {
    try {

        const { username, password, email } = req.body;
        const user = await new User({ username: username, email: email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);

            req.flash('success', 'Welcome to Yelp Camp !')
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register')
    }
    // console.log(registeredUser);



}



module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds'; // update this line to use res.locals.returnTo now
    res.redirect(redirectUrl);
}


module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye !');
        res.redirect('/campgrounds');
    });
}
const express = require('express')
const router = express.Router()
const passport = require('passport')
const nodemailer = require('nodemailer')
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
// add local file auth first page 
const User = require('../app/models/User')
const infoPerson = require('../app/models/infoPerson')
const { forwardAuthenticated } = require('../config/db/auth');
const { ensureAuthenticated } = require('../config/db/auth');

// add router -> page
const bcrypt = require('bcryptjs');
const siteController = require('../app/controllers/SiteController')
const servicesController  = require('../app/controllers/ServicesController')
const informationController  = require('../app/controllers/InformationController')
const doctorsController  = require('../app/controllers/DoctorsController')
const ObjectId = require('mongodb').ObjectId;
// Login Page
router.get('/Login', forwardAuthenticated, (req, res) => res.render('Login',{layout: 'Login_Reg.hbs'}));

// Register Page
router.get('/Register', forwardAuthenticated, (req, res) => res.render('Register',{layout: 'Login_Reg.hbs'}));
// Reset page
router.get(`/Resetpwd/:id`, forwardAuthenticated, (req, res) => {
   // console.log(id)
     res.render('Resetpwd', {layout: 'Login_Reg.hbs'})
   });

// Forgot page
router.get('/ForgotPwd', forwardAuthenticated, (req, res) => res.render('Forgotpwd', {layout: 'Login_Reg.hbs'}));
// infoUser
// router.get(`/InfoPerson/Update`, (req, res) =>
//   res.render('Profile', {layout: 'Login_Reg.hbs',})
// );
// cnange ava
router.get(`/ChangeAvatar`, (req, res) =>
  res.render('Userimg', {layout: 'Login_Reg.hbs',})
);

// Save page , login -> view 
router.get('/Homepage', ensureAuthenticated, (req, res) =>
  res.render('home', {
    user: req.user
  })
);
router.get('/Contact', ensureAuthenticated, (req, res) =>
  res.render('Contact_us', {
    user: req.user
  })
);
router.get('/Services', ensureAuthenticated, (req, res) =>
  res.render('home', {
    user: req.user
  })
);
router.get('/Doctors', ensureAuthenticated, (req, res) =>
  res.render('home', {
    user: req.user
  })
);
router.get('/Information', ensureAuthenticated, (req, res) =>
  res.render('Information', {
    user: req.user
  })
);


// Configure user account profile edit
// --------------------------------------------------
router.get('/ChangeAvatar', function(req, res, next) {
    if (!req.isAuthenticated()) { 
      res.redirect('/users/login');
    }
    const user = req.app.locals.user;
    const _id = ObjectId(req.session.passport.user);
  
    User.findOne({ _id }, (err, results) => {
      if (err) {
        throw err;
      }
  
      res.render('Userimg', { ...results });
    });
  });
  // --------------------------------------------------
  router.get('/infoPerson/Update', function(req, res, next) {
    if (!req.isAuthenticated()) { 
      res.redirect('/users/login');
    }
    const user = req.app.locals.user;
    const _id = ObjectId(req.session.passport.user);
  
    User.find({_id}).then(user =>{
        res.render('Profile', {
            user: user.map(user => user.toJSON()),
            layout: 'Login_Reg.hbs'
        });
    })
  });
  // --------------------------------------------------
  
  // Handle updating user profile data
  // --------------------------------------------------
  router.post('/infoPerson/Update', (req, res, next) => {
    if (!req.isAuthenticated()) {
      res.redirect('/users/login');
    }
  
    const user = req.app.locals.user;
    const {yyyy, dd, mm, phone, gender,address, inputBackgroundisease, inputHPC } = req.body;
    const _id = ObjectId(req.session.passport.user);
  
    User.updateOne({ _id }, { $set: {yyyy, dd, mm, phone, gender,address, inputBackgroundisease, inputHPC} }, (err) => {
      if (err) {
        throw err;
      }
      
      res.redirect('/users/infoPerson/Update');
    });
  });


  // --------------------------------------------------
  router.post('/ChangeAvatar', (req, res, next) => {
    if (!req.isAuthenticated()) {
      res.redirect('/users/login');
    }
  
    const user = req.app.locals.user;
    // const {yyyy, dd, mm, phone, gender,address, inputBackgroundisease, inputHPC } = req.body;
    const {avatarUser } = req.body;
    const _id = ObjectId(req.session.passport.user);
  
    User.updateOne({ _id }, { $set: {avatarUser} }, (err) => {
      if (err) {
        throw err;
      }
      
      res.redirect('/users/ChangeAvatar');
    });
  });


  // --------------------------------------------------

router.get('/infoPerson/list', (req, res,next) =>{
    
    const _id = ObjectId(req.session.passport.user);
    User.find({_id}).then(user =>{
        res.render('Person', {
            user: user.map(user => user.toJSON())
        });
    })
});



// /Users/.....
router.use('/Contact', siteController.contact)
router.use('/Appointment_with_a_doctor', siteController.Utilities1)
router.use('/Immediately_pills_sent', siteController.Utilities2)
router.use('/Multi-function pharmacy', siteController.Utilities3)
router.use('/Online_Health_Diagnosis', siteController.Utilities4)
router.use('/Online_medical_records', siteController.Utilities5)
router.use('/Personal_business_healthcare', siteController.Utilities6)
router.use('/Person', siteController.person)
// /Users/Services/.....
router.use('/Services/Booking', servicesController.booking)
router.use('/Services/Diagnose', servicesController.diagnose)
router.use('/Services/Nutrition', servicesController.nutri)
router.use('/Services',servicesController.home)
// /Users/Information/....
router.use('/Information/About_us', informationController.about)
router.use('/Information/FAQ', informationController.faq)
router.use('/Information',informationController.info)
// /doctors
router.use('/Doctors/ItenralMedicines', doctorsController.internal)
router.use('/Doctors/Pediatrics', doctorsController.pediatrics)
router.use('/Doctors/Otorhinolaryngology', doctorsController.otorhinolaryngology)
router.use('/Doctors',doctorsController.home)
// /Person

// / in first page -> in layout : 'Login_Reg.hbs'
router.get('/', forwardAuthenticated, (req, res) => res.render('Login', {layout: 'Login_Reg.hbs'}));


//------------ Register POST Handle ------------//
router.post('/Register', (req, res) => {
  const { _id, name, email, password, password2 } = req.body;
  let errors = [];

  // Checking required fields 
  if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please enter all fields' });
  }

  // Checking password mismatch 
  if (password != password2) {
      errors.push({ msg: 'Passwords do not match' });
  }

  // Checking password length
  if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
      res.render('register', {
          layout: 'Login_Reg.hbs',
          errors,
          name,
          email,
          password,
          password2
      });
  } else {
      // Validation passed 
      User.findOne({ email: email }).then(user => {
          if (user) {
              // User already exists 
              errors.push({ msg: 'Email ID already registered' });
              res.render('register', {
                  layout: 'Login_Reg.hbs',
                  errors,
                  name,
                  email,
                  password,
                  password2
              });
          } else {

              const oauth2Client = new OAuth2(
                  process.env.CLIENT_ID, // ClientID
                  process.env.CLIENT_SECRET, // Client Secret
                  process.env.REDIRECT_URI // Redirect URL
              );

              oauth2Client.setCredentials({
                  refresh_token: process.env.REFRESH_TOKEN
              });
              const accessToken = oauth2Client.getAccessToken()

              const token = jwt.sign({ _id,name, email, password }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
              const CLIENT_URL = 'http://' + req.headers.host;

              const output = `
              <h2>Please click on below link to activate your account</h2>
              <p>${CLIENT_URL}/users/active/${token}</p>
              <p><b>NOTE: </b> The above activation link expires in 30 minutes.</p>
              `;

              const transporter = nodemailer.createTransport({
                  service: process.env.SERVICE,
                  auth: {
                      type: "OAuth2",
                      user: process.env.USER,
                      clientId: process.env.CLIENT_ID,
                      clientSecret: process.env.CLIENT_SECRET,
                      refreshToken: process.env.REFRESH_TOKEN,
                      accessToken: accessToken
                  },
              });

              // send mail with defined transport object
              const mailOptions = {
                  from: '"AI Doctor" <aidoctor.se@gmail.com>', // sender address
                  to: email, // list of receivers
                  subject: "Account Verification: AI Doctor ✔", // Subject line
                  generateTextFromHTML: true,
                  html: output, // html body
              };

              transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                      console.log(error);
                      req.flash(
                          'error_msg',
                          'Something went wrong on our end. Please register again.'
                      );
                      res.redirect('/users/login');
                  }
                  else {
                      console.log('Mail sent : %s', info.response);
                      req.flash(
                          'success_msg',
                          'Activation link sent to email ID. Please activate to log in.'
                      );
                      res.redirect('/users/login');
                  }
              })

          }
      });
  }
});

//------------ Activate Account Handle ------------//
router.get('/active/:token', (req, res) => {
    const token = req.params.token;
    let errors = [];
    const id = req.params.id;
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
            if (err) {
                req.flash(
                    'error_msg',
                    'Incorrect or expired link! Please register again.'
                );
                res.redirect('/users/register');
            }
            else {
                const {_id} = decodedToken;
                const { name, email, password } = decodedToken;
                User.findOne({ email: email }).then(user => {
                    if (user) {
                        //------------ User already exists ------------//
                        req.flash(
                            'error_msg',
                            'Email ID already registered! Please log in.'
                        );
                        res.redirect('/users/login');
                    } else {
                        const newUser = new User({
                            name,
                            email,
                            password
                        });

                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newUser.password, salt, (err, hash) => {
                                if (err) throw err;
                                newUser.password = hash;
                                newUser
                                    .save()
                                    .then(user => {
                                        req.flash(
                                            'success_msg',
                                            'Account activated. You can now log in.'
                                        );
                                        res.redirect(`/users/Login`);
                                    })
                                    .catch(err => console.log(err));
                            });
                        });
                    }
                });
            }

        })
    }
    else {
        console.log("Account activation error!")
    }
});

//------------ Forgot Password Handle ------------//
router.post('/Forgotpwd', (req, res) => {
    const { email } = req.body;
  
    let errors = [];
  
    // Checking required fields 
    if (!email) {
        errors.push({ msg: 'Please enter an email ID' });
    }
  
    if (errors.length > 0) {
        res.render('Forgotpwd', {
            errors,
            email
        });
    } else {
        User.findOne({ email: email }).then(user => {
            if (!user) {
                // User already exists 
                errors.push({ msg: 'User with Email ID does not exist!' });
                res.render('Forgotpwd', {
                    layout: 'Login_Reg.hbs',
                    errors,
                    email
                });
            } else {
  
                const oauth2Client = new OAuth2(
                    process.env.CLIENT_ID, // ClientID
                    process.env.CLIENT_SECRET, // Client Secret
                    process.env.REDIRECT_URI // Redirect URL
                );
  
                oauth2Client.setCredentials({
                    refresh_token: process.env.REFRESH_TOKEN
                });
                const accessToken = oauth2Client.getAccessToken()
  
                const token = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SEREST, { expiresIn: '5m' });
                const CLIENT_URL = 'http://' + req.headers.host;
                const output = `
                <h2>Please click on below link to reset your account password</h2>
                <p>${CLIENT_URL}/users/verify/${token}</p>
                <p><b>NOTE: </b> The activation link expires in 5 minutes.</p>
                `;
  
                User.updateOne({ resetLink: token }, (err, success) => {
                    if (err) {
                        errors.push({ msg: 'Error resetting password!' });
                        res.render('Forgotpwd', {
                            errors,
                            email
                        });
                    }
                    else {
                        const transporter = nodemailer.createTransport({
                            service: process.env.SERVICE,
                            auth: {
                                type: "OAuth2",
                                user: process.env.USER,
                                clientId: process.env.CLIENT_ID,
                                clientSecret: process.env.CLIENT_SECRET,
                                refreshToken: process.env.REFRESH_TOKEN,
                                accessToken: accessToken
                            },
                        });
  
                        // send mail with defined transport object
                        const mailOptions = {
                            from: '"AI Doctor" <aidoctor.se@gmail.com>', // sender address
                            to: email, // list of receivers
                            subject: "Account Password Reset: AI Doctor ✔", // Subject line
                            html: output, // html body
                        };
  
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log(error);
                                req.flash(
                                    'error_msg',
                                    'Something went wrong on our end. Please try again later.'
                                );
                                res.redirect('/users/Forgotpwd');
                            }
                            else {
                                console.log('Mail sent : %s', info.response);
                                req.flash(
                                    'success_msg',
                                    'Password reset link sent to email ID. Please follow the instructions.'
                                );
                                res.redirect('/users/login');
                            }
                        })
                    }
                })
  
            }
        });
    }
  });
  
  //------------ Redirect to Reset Handle ------------//
  router.get('/verify/:token', (req, res) => {
    const  token  = req.params.token;
    const id = req.params.id;
    if (token) {
        jwt.verify(token, process.env.REFRESH_TOKEN_SEREST, (err, decodedToken) => {
            if (err) {
                req.flash(
                    'error_msg',
                    'Incorrect or expired link! Please try again.'
                );
                res.redirect('/users/login');
            }
            else {
                const { _id } = decodedToken;
                res.redirect(`/users/Resetpwd/${_id}`)
            }
        })
    }
    else {
        console.log("Password reset error!")
    }
  });
  
 // ------------ Reset Password Handle ------------//
  router.post('/resetpwd/:id', (req, res) => {
    var { password, password2 } = req.body;
    const  token = req.params.token;
    const id = req.params.id;
    let errors = [];
  
    // Checking required fields 
    if (!password || !password2) {
    
        req.flash(
            'error_msg',
            'Please enter all fields.'
        );
        res.redirect(`/users/Resetpwd/${id}`);
    }
  
    // Checking password length 
    else if (password.length < 6) {
        req.flash(
            'error_msg',
            'Password must be at least 6 characters.'
        );
        res.redirect(`/users/Resetpwd/${id}`);
    }
  
    // Checking password mismatch 
    else if (password != password2) {
        req.flash(
            'error_msg',
            'Passwords do not match.'
        );
       res.redirect(`/users/Resetpwd/${id}`);
    }
  
    else {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) throw err;
                password = hash;
  
                User.findByIdAndUpdate(
                    { _id:id },
                    { password },
                    function (err, result) {
                        if (err) {
                            req.flash(
                                'error_msg',
                                'Error resetting password!'
                            );
                            res.redirect(`/users/Resetpwd/${id}`);
                        } else {
                            req.flash(
                                'success_msg',
                                'Password reset successfully!'
                            );
                            res.redirect('/users/login');
                        }
                    }
                );
  
            });
        });
    }
  });

//------------ Login POST Handle ------------//
router.post('/login',  (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/Users/Homepage',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});


//------------ Logout GET Handle ------------//
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login')
})

module.exports = router

class UserController {
    // [GET] site
    home(req, res) {
      res.render('Person');
    }
    diagnose(req, res) {
      res.render('Diagnose');
    }
    booking(req, res) {
      res.render('Booking');
    }
  }
  
  module.exports = new UserController();
                                   
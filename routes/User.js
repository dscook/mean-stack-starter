var mongoose = require('mongoose'),
    User     = mongoose.model('User');

/**
 * User RESTful routes.
 * @param app - the express web server instance.
 */
module.exports = function (app) {

    // Get all users
    app.get('/api/users', function (req, res) {
        User.find().exec(function (err, users) {
            if (err) {
                res.sendStatus(500)
            } else {
                res.send(users);
            }
        });
    });

    // Create a new user
    app.post('/api/users', function (req, res) {
        User.create(req.body, function (err, user) {
            if (err) {
                res.sendStatus(500)
            } else {
                res.send(user);
            }
        });
    });

};

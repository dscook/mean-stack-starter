var config        = require('./config'),
    clargs        = require('optimist').argv,
    express       = require('express'),
    app           = express(),
    http          = require('http').Server(app),
    path          = require('path'),
    mongoose      = require('mongoose'),
    bodyParser    = require('body-parser'),
    cookieParser  = require('cookie-parser');

// Start the server
var port = process.env.PORT || clargs.port || 8080;
http.listen(port);

// Connect to database dependent on environment
var environment = app.get('env');
mongoose.connect(config.mongodb[environment].url);

// Middleware
app.use(cookieParser());
app.use(bodyParser.json({
    limit: '50mb'
}));

// Ensure browsers do not cache responses from API calls as GET requests are dependent on the database
app.use('/api', function (req, res, next) {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', -1);
    next();
});

// Serve static files
var publicPath = 'build';
app.use(express.static(path.join(__dirname, publicPath)));

// Initialise mongoose models
// TODO

// Initialise RESTful routes
// TODO

// Serve layout, all requests are serve the main layout page since we are a single page application
app.get('/*', function(req, res) {
    res.sendFile(path.resolve(__dirname, publicPath, './index.html'));
});

// Output a log to indicate the server has started
console.log('Server started');

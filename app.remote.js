/**
 * Module dependencies.
 */

var express = require('express'),
	http = require('http'),
	routes = require('./routes'),
	passport = require('passport'),
	BrowserIdStrategy = require('passport-browserid').Strategy;
	
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the BrowserID verified email address
//   is serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user.email);
});

passport.deserializeUser(function(email, done) {
  done(null, { email: email });
});


// Use the BrowserIDStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, a BrowserID verified email address), and invoke
//   a callback with a user object.
passport.use(new BrowserIdStrategy({
    audience: 'http://battleship.gotdibbs.net' // CHANGE THIS PER SERVER
  },
  function(email, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's email address is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the email address with a user record in your database, and
      // return that user instead.
      return done(null, { email: email })
    });
  }
));

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

/*-----
  ----- BEGIN NODE.JS SERVER SETUP -----
                                   -----*/

var app = express();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'apple-p1e' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.getIndex);
app.get('/fast', ensureAuthenticated, routes.getFast);
app.get('/visual', routes.getVisual);
app.get('/upload', ensureAuthenticated, routes.getUpload);
app.post('/upload', ensureAuthenticated, routes.postUpload);
app.get('/api/ais', routes.api.getAIs);
app.get('/api/games/:player1/:player2/:gameCount', routes.api.getGames);

app.get('/login', function(req, res){
  res.render('login', { user: req.user, title: 'Battleship: Login', id: 'login' });
});

// POST /auth/browserid
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  BrowserID authentication will verify the assertion obtained from
//   the browser via the JavaScript API.
app.post('/auth/browserid', 
  passport.authenticate('browserid', { failureRedirect: '/login' }),
  function(req, res) {
	if (req.user && /@sonomapartners.com$/.test(req.user.email)) {
	  res.redirect('/');
	}
	else {
	  req.logout();
	  res.redirect('/login');
	}
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

http.createServer(app).listen(process.env.PORT, function(){
  console.log('Express server listening on port %d in %s mode', process.env.PORT, app.settings.env);
}).on('connection', function (socket) {
	socket.setTimeout(5 * 60 * 1000); // 5 minute timeout
});

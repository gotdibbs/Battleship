/**
 * Module dependencies.
 */

var express = require('express'),
	http = require('http'),
	routes = require('./routes');

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
app.get('/fast', routes.getFast);
app.get('/visual', routes.getVisual);
app.get('/upload', routes.getUpload);
app.post('/upload', routes.postUpload);
app.get('/api/ais', routes.api.getAIs);
app.get('/api/games/:player1/:player2/:gameCount', routes.api.getGames);
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/img', express.static(__dirname + '/public/img'));
app.use('/js', express.static(__dirname + '/public/js'));

app.get('/login', function(req, res){
  res.render('login', { user: req.user, title: 'Battleship: Login', id: 'login' });
});

http.createServer(app).listen(process.env.PORT || 8080, function(){
  console.log('Express server listening on port %d in %s mode', process.env.PORT || 8080, app.settings.env);
}).on('connection', function (socket) {
  socket.setTimeout(5 * 60 * 1000); // 5 minute timeout
});
// REQUIRES
var yaml = require('yamljs');
var settings = yaml.load('settings.yaml');
var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app)
var nunjucks = require('nunjucks');
var helmet = require('helmet');

app.use(helmet());

// HTTP authentication
if (settings.require_password) {
  var auth = require('http-auth');
  var basic = auth.basic({
    realm: "secure",
    file: path.join(__dirname, 'htpasswd')
  });

  app.use(auth.connect(basic));
}

// CONFIG
app.set('port', process.env.PORT || 3000);
app.use('/public', express.static(path.join(__dirname, 'public')));
nunjucks.configure('views', {
  autoescape: true,
  express: app
});


// ROUTES
var indexRouter = require('./controllers/home');
var organisationRouter = require('./controllers/organisation');


app.use('/', indexRouter);
app.use('/organisation', organisationRouter);


// START SERVER
http.listen(app.get('port'), function() {
  console.log(settings.title)
  console.log("Available at http://localhost:" + app.get('port'));
  console.log("-------")
});

// REQUIRES
require('dotenv').config();
const yaml = require('yamljs');
const settings = yaml.load('settings.yaml');
const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const nunjucks = require('nunjucks');
const helmet = require('helmet');
const Constants = require('./libs/constants');

// LOCAL IMPORTS
const Utils = require('./libs/utils.js');

// STARTUP CHECKS
if (Utils.checkForMissingEnvVars([
  'DATABASE_URL', 'WEBHOOK_KEY', 'GITHUB_TOKEN',
])) {
  process.exit();
}

// SERVER CONFIGURATION
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;
app.use(redirectToHTTPS([/localhost:(\d{4})/, /[a-zA-Z0-9]+\.eu\.ngrok\.io/],
  [], 301));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));
app.set('port', process.env.PORT || 3000);
app.use('/public', express.static(path.join(__dirname, 'public')));

// NUNJUCKS
nunjucks.configure('views', {
  autoescape: true,
  express: app,
});

let nunjucksEnv = new nunjucks.Environment();

nunjucksEnv.addFilter('highlightSpecialCategory', function(category) {
  let lookup = Constants.getSpecialCategories().indexOf(category);

  if (lookup !== -1) {
    return 'true';
  } else {
    return 'false';
  }
});

nunjucksEnv.addGlobal('env', process.env.NODE_ENV);

nunjucksEnv.express(app);

// ROUTES
let indexRouter = require('./controllers/home');
let aboutRouter = require('./controllers/about');
let contributeRouter = require('./controllers/contribute');
let developersRouter = require('./controllers/developers');
let searchRouter = require('./controllers/search');
let organisationRouter = require('./controllers/organisation');
let webhookRouter = require('./controllers/webhook');
let changesRouter = require('./controllers/changes');

// API endpoints
app.use('/', indexRouter);
app.use('/', searchRouter);
app.use('/', organisationRouter);
app.use('/', changesRouter);

// Non-API endpoints
app.use('/about', aboutRouter);
app.use('/contribute', contributeRouter);
app.use('/developers', developersRouter);
app.use('/webhook', webhookRouter.router);

// START SERVER
http.listen(app.get('port'), function() {
  console.log(settings.title);
  console.log('Available at http://localhost:' + app.get('port'));
  console.log('-------');
});

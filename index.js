// REQUIRES
const _ = require('lodash');
const yaml = require('yamljs');
const settings = yaml.load('settings.yaml');
const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app)
const nunjucks = require('nunjucks');
const helmet = require('helmet');
const async = require('async');
const Sequelize = require('sequelize');
const request = require('request');
const Constants = require("./libs/constants");

require('dotenv').config()

// LOCAL IMPORTS
const Utils = require('./libs/utils.js');

// STARTUP CHECKS
if (Utils.checkForMissingEnvVars(["DATABASE_URL"])) {
  process.exit();
}

// CONSTANTS
const URL_GITHUB_REPO = "https://raw.githubusercontent.com/projectsbyif/org-gdpr-tool-data/master/";

// SERVER CONFIGURATION
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.set('port', process.env.PORT || 3000);
app.use('/public', express.static(path.join(__dirname, 'public')));

// NUNJUCKS
nunjucks.configure('views', {
  autoescape: true,
  express: app
});

var nunjucksEnv = new nunjucks.Environment();

nunjucksEnv.addFilter("highlightSpecialCategory", function(category) {
  var lookup = Constants.getSpecialCategories().indexOf(category);

  if (lookup !== -1) {
    return "true";
  } else {
    return "false";
  }
});

nunjucksEnv.express(app);

// SEQUELIZE
const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: "postgres" });
const Organisation = sequelize.import(__dirname + "/models/organisation.js");


// ROUTES
var indexRouter = require('./controllers/home');
var searchRouter = require('./controllers/search');
var organisationRouter = require('./controllers/organisation');
var webhookRouter = require('./controllers/webhook');
var generatorRouter = require('./controllers/generator');

app.use('/', indexRouter);
app.use('/search', searchRouter);
app.use('/organisation', organisationRouter);
app.use('/webhook', webhookRouter);
app.use('/generator', generatorRouter);


// START SERVER
http.listen(app.get('port'), function() {
  console.log(settings.title)
  console.log("Available at http://localhost:" + app.get('port'));
  console.log("-------")
});

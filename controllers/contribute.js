const express = require('express');
const router = express.Router();
const yaml = require('yamljs');

let settings = yaml.load('settings.yaml');

/* GET /contribute */
router.get('/', function(req, res, next) {
  res.render('contribute/index.html', {settings: settings});
});

module.exports = router;

const express = require('express');
const router = express.Router();
const async = require('async');
const sync = require('../libs/sync');

// SERVER ROUTES
router.get('/incoming', function(req, res) {
  // GitHub webhooks may require a valid GET path?
  res.status(200).send('200 OK');
});

router.post('/incoming', function(req, res) {
  async.waterfall([
    function(callback) {
      handleIncoming(webhookJson, callback);
    },
  ], function() {
    res.status(200).send('200 OK');
  });
});

function handleIncoming(webhookJson, parentCallback) {
  console.log('-> Starting to process incoming payload');

  let diffs;

  async.waterfall([
    function(callback) {
      // Process diffs
      diffs = sync.processDiffs(webhookJson);

      // Handle added/modified files
      if (diffs.modified.length !== 0) {
        sync.handleModified(diffs.modified, callback);
      } else {
        callback(null);
      }
    },
    function(callback) {
      // Handle deleted files
      if (diffs.removed.length !== 0) {
        sync.handleDeleted(diffs.removed, callback);
      } else {
        callback(null);
      }
    },
  ], function(err) {
    if (err) {
      console.log(err);
    }

    console.log('-> Completed');

    parentCallback();
  });
}

module.exports = {
  router,
  handleIncoming,
};

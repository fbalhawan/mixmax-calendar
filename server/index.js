const express = require('express');
const path = require('path');
const cron = require('node-cron');
const db = require("../mock/db");
const app = express();
const port = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, '../dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');

app.use(express.static(DIST_DIR));

app.use(require('./api/calendar'));

app.get('/', (req, res) => {
  res.sendFile(HTML_FILE);
});

// cron to run every day at 12:00 AM
db.dates.updateDailyHours();
cron.schedule('0 0 * * *', () => {
  console.log(`Updating dates.json on ${new Date()}`);
  db.dates.updateDailyHours();
  
});

app.listen(port, function () {
  console.log('App listening on port: ' + port);
});

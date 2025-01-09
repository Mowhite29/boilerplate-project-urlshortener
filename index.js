require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
mongoose.connect(process.env.MONGO_URI);

const shortUrlSchema = new mongoose.Schema({
  original_url: {type: String, required: true},
  short_url: Number
});

const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

app.use("/", bodyParser.urlencoded({extended: false}))

app.use("/api/shorturl/:url", (req, res) => {
  var url = req.params.url;
  ShortUrl.findOne({short_url: url}, {original_url: 1}).then(data => {
    console.log("short url" + url + data.original_url)
    res.redirect(data.original_url)
  });
});

app.post("/api/shorturl/", (req, res) => {
  var url = req.body.url;
  console.log("POST url" + " " + url)
  ShortUrl.findOne().sort({short_url: -1}).limit(1).then(data => {
    const number = data.short_url + 1;
    console.log(number)
    let regex = /https:\/\//i;
    if (regex.test(url)){
        var newEntry = new ShortUrl({
          original_url: url,
          short_url: number
        })
        res.json({
          original_url: url,
          short_url: number
        })
        console.log("original_url:" + " " + url + " " + "short_url:" + " " + number)
        newEntry.save()
      }else {
        res.json({
          error: 'invalid url'
        });
      console.log("invalid url")
      }
    });
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

const express = require('express');
const app = express();
var server = require('http').createServer(app);
const io = require("socket.io")(server);
const port = 3002;
const fs = require("fs");
require("dotenv").config();


const kafkaCuns = require('./controller/KafkaCunsumer');
const mongodb = require('./models/ConnectMongoDB');
const bigmlm  = require('./models/BigML');

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//--------------ejs---------------------
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.get('/', (req, res) => res.render('Dashboard'));


app.get("/buildModel",async (req,res) => {
      await bigmlm.buildModel();
      res.redirect('/');
  })
  .get("/csv", mongodb.mongoToCsv)
  .get('/predictStatus/:day_type/:month/:day/:company/:leaving_country/:landing_country/:leaving_weather/:landing_weather/:flight_type', async (req, res) => {
      var arr = [  req.params.day_type,
                req.params.month,
                req.params.day,
                req.params.company,
                req.params.leaving_country,
                req.params.landing_country,
                req.params.leaving_weather,
                req.params.landing_weather,
                req.params.flight_type];

    console.log(await bigmlm.predict(arr))
    const value = await bigmlm.predict(arr);

    // alert(value);
    // res.redirect('/');
    // req.session['predictValue'] = value;
    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="/app.js" type="text/javascript"></script>
        <title>Results</title>
    </head>
    <body>
        <h1 display="flex" text-align="center" style="color:rgb(16, 10, 118)">Result of Prediction : ${value}</h1>
        <body style="background-color:rgb(174, 235, 225);">
        <button type="button" onclick="location.href='http:/'+'/'+'localhost:3002'" >Go Back</button>
    </body>
    </html>`;

    res.send(html);
    // res.sendFile('public/predict.html', {root: __dirname })
    // res.send("Prediction result : " + value);
    

});



server.listen(port, () => console.log(`System C app listening at http://localhost:${port}`));
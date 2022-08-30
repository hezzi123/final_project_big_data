const uuid = require("uuid");
const Kafka = require("node-rdkafka");
const bigml = require("bigml");
const mongo = require("../models/ConnectMongoDB");
const bigmlcon  = require("../models/BigML");

const kafkaConf = {
  "group.id": "cloudkarafka",
  "metadata.broker.list": process.env.CLOUDKARAFKA_BROKERS.split(","),
  "socket.keepalive.enable": true,
  "security.protocol": "SASL_SSL",
  "sasl.mechanisms": "SCRAM-SHA-256",
  "sasl.username": "v28ch85d",
  "sasl.password": "zl73AU5E_qmCbqmEZl-HSQWmdBqTyjp_",
  debug: "generic,broker,security",
};

const prefix = "v28ch85d-default";
const delay_status = `${prefix}`;
const producer = new Kafka.Producer(kafkaConf);

const genMessage = m => new Buffer.alloc(m.length,m);

const consumer = new Kafka.KafkaConsumer(kafkaConf);

consumer.connect();

consumer.on("ready", function(arg) {
  console.log(`MongoDB consumer is ready`);
  consumer.subscribe([delay_status]);
  consumer.consume();
});

consumer.on("data", function(m) {
  
  // console.log(m.value.toString());

  var temp = JSON.parse(m.value.toString());// parse from string to object
  fs.writeFileSync('234.json', data);
  // console.log(temp[0].day_type )
  for (var i = 0; i < temp.length; i++)
  {
    // console.log(temp[i])
    if (temp[i].day_type != undefined && temp[i].month != undefined && temp[i].day != undefined
      && temp[i].company != undefined && temp[i].leaving_country != undefined && temp[i].landing_country != undefined
      && temp[i].flight_type != undefined
      && temp[i].leaving_weather != undefined && temp[i].landing_weather != undefined && temp[i].delay_status != undefined) 
    {
      console.log("got data!!")
      var toMongo = {};
      toMongo.day_type = temp[i].day_type;
      toMongo.month = temp[i].month;
      toMongo.day = temp[i].day;
      toMongo.company = temp[i].company;
      toMongo.leaving_country = temp[i].leaving_country;
      toMongo.landing_country = temp[i].landing_country;
      toMongo.flight_type = temp[i].flight_type;
      toMongo.leaving_weather = temp[i].leaving_weather;
      toMongo.landing_weather = temp[i].landing_weather.weather[0].main; 
      toMongo.delay_status = temp[i].delay_status;
      
      mongo.insertToMongo(toMongo);//add to mongo
    }
}

  
 
});


module.exports.consumer = consumer;
// module.exports.myBuild = myBuild;
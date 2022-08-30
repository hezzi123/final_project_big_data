const Redis = require("redis");

// Creating a clinet using redis.config file
const redis = Redis.createClient(require("../config/redis.config"));

redis
    // What happens when we connecting to redis db
    .on("connect", function () {
        console.log("Reciever connected to Redis at: " + process.env.REDIS_URL);
    })
    // // What error occurad
    .on("error", function (err) {
        console.log("Error " + err);
    });

(async () => {
    await redis.connect();
    // check if All_flights is exists in our redis db
    const exist1 = await redis.exists("All_flights");
    if (exist1) {
        console.log("exist1:", await redis.json.GET("All_flights")); // not sure if we needed it
    } else {
        redis.json.SET("All_flights", "$", []);
    }
})();

module.exports.redis = redis;

require("dotenv").config();

module.exports = {
    password: process.env.REDIS_PASSWORD,
    url: process.env.REDIS_URL,
}
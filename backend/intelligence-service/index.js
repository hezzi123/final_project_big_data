const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
require("dotenv").config();

const kafkaConsumer = require("./model/kafka");
const db = require("./database/redisdb");

const fs = require('fs');

/* Middlewares */
app.use(express.json());
app.use(require("cors")());

/* Routes */
// app.get("/api/calls", controller.getAllCalls)
//     .get("/api/calls/:key", controller.getCall)
//     .post("/api/calls", controller.insertCall);

/*
    When the client is connected, then the StreamLayer service
    emits the current stored calls to the client. 
*/

io.on("connection", async (client) => {
    console.log("Client connected to socket");
    // try {
    //     fs.readFile('./model/for_intelligence.json', 'utf8', (err, data) => {
    //         const flights = JSON.parse(data);
    //         io.emit("flights", flights);
    //         db.redis.json.ARRINSERT("All_flights", "$", 0, flights);
    // });
    // } catch (error) {
    //     console.log(error);
    // }
});

/* 
    Whenever this service is getting new phone calls from kafka,
    Then it process all the phone calls data required for the dashboard
    in the frontend tier, and emits it via web socket.
*/
kafkaConsumer.on("data", async (message) => {
    try {
        console.log("data from kafka!!")
        const flights = message.value.toString()
        console.log(flights)
        // let calls_data = await db.redis.json.GET("calls_data");
        // await db.redis.json.SET("calls_data", "$", calls_data);
        await db.redis.json.ARRINSERT("All_flights", "$", 0, flights);
        io.emit("flights", flights);
    } catch (error) {
        console.log(error);
    }
});

/* Start server */
const PORT = process.env.PORT || 3004;
server.listen(PORT, () =>
    console.log(`Stream Service listening at http://localhost:${PORT}`)
);

const kafka = require("../model/kafka");
const api = require("../model/api");
const axios = require('axios').default;

let intervalId = -1;
let simulatorRate = 0;
const DEFAULT_RATE = 1;

// Toggle auto mode
const startSimulator = (req, res) => {
    reportLog();
    clearInterval(intervalId);
    if (simulatorRate < 1) {
        simulatorRate = DEFAULT_RATE;
    }
    intervalId = setInterval(() => {
        api.generateFLights(kafka.publishMessage);
    }, simulatorRate * 10000);
    console.log("************ Auto mode started ************");
    res.send("************ Auto mode started ************");
};

const stopSimulator = (req, res) => {
    reportLog();
    clearInterval(intervalId);
    simulatorRate = 0;
    console.log("************ Auto mode stopped ************");
    res.send("************ Auto mode stopped ************");
};

const getSimulatorStatus = (req, res) => {
    reportLog();
    res.status(200).json({ simulatorRate: simulatorRate });
};

const setSimulatorRate = (req, res) => {
    simulatorRate = req.query.rate;
    startSimulator(req, res);
};

function reportLog() {
    axios.post('http://localhost:3001/api/customers?service=message-borker-service').then(resp => {
        // console.log(resp.data);
    });
}

module.exports = {
    startSimulator,
    stopSimulator,
    getSimulatorStatus,
    setSimulatorRate,
};

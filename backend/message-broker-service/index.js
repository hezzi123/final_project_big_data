const express = require("express");
const cors = require("cors");
require("dotenv").config();

const controller = require("./controller/api.controller");
const customersController = require("./controller/customers.controller");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());


// Routes
app
    .get("/api/call", controller.startSimulator)
    .delete("/api/call", controller.stopSimulator)
    .get("/api/status", controller.getSimulatorStatus)
    .post("/api/rate", controller.setSimulatorRate);

// TODO FOR INTEGRATION: call this every client call.
app.post("/api/customers", customersController.logCustomers)
    .get("/api/customer/:id", customersController.getCustomer);


// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Message Broker started at http://localhost:${port}`);
});

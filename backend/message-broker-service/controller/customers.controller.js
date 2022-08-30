const Customer = require("../model/customer");

module.exports = {
    logCustomers: (req, res) => {
        const service = req.query.service || "Not available";
      
        const query = {
            service: service,
        };
        Customer.create(query)
            .then((customer) => {
                res.status(201).json(customer);
            })
            .catch((err) => {
                res.status(500).json({
                    message: err.message,
                });
            });
    },
    getCustomer: (req, res) => {
        Customer.findOne({
            where: {
                id: req.params.id,
            },
        })
            .then((customer) => {
                res.status(200).json(customer);
            })
            .catch((err) => {
                res.status(500).json({
                    message: err.message,
                });
            });
    },
};

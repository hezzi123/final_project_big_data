const uuid = require("uuid");
const Kafka = require("node-rdkafka");
const kafkaConf = require("../config/kafka.config");
// const Customer = require("./customer");
require("dotenv").config();


const topic = process.env.CLOUDKARAFKA_TOPIC_PREFIX;
const producer = new Kafka.Producer(kafkaConf);

const main = async () => {
    await producer.connect()
    producer.on("ready", (arg) =>
        console.log(`producer ${arg.name} ready. topic: ${topic}`)
    )
    .on("event", (err) => console.log(err))
    .on("event.error", (err) => {console.error("samuel" + err); producer.close();});
}

main()

const publishMessage = async (flight) => {
    const m = Buffer.from(JSON.stringify(flight));
    producer.produce(topic, null, m, uuid.v4());
};

module.exports = {
    publishMessage,
};

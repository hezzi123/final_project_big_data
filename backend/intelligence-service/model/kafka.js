const { KafkaConsumer } = require("node-rdkafka");

const topic = process.env.CLOUDKARAFKA_TOPIC_PREFIX;
const kafkaConsumer = new KafkaConsumer(require("../config/kafka.config"));

kafkaConsumer
    // When e ready to consume
    .on("ready", (arg) => {
        kafkaConsumer.subscribe([topic]).consume();
        console.log(`Consumer ${arg.name} ready. topics: ${topic}`);
    })
    // disconnected from kafka
    .on("disconnected", (arg) =>
        console.log(`Consumer ${arg.name} disconnected.`)
    )
    // When error accourd
    .on("event.error", (err) => console.error("samuel" + err));

kafkaConsumer.connect();

console.log(kafkaConsumer)

module.exports = kafkaConsumer;

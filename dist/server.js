"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const connect_1 = require("./mqtt/connect");
const subscribers_1 = require("./mqtt/subscribers");
const connection_holder_1 = require("./mqtt/connection_holder");
async function bootstrap() {
    const mqttConnection = await (0, connect_1.connectMQTT)();
    // ✅ THIS LINE IS CRITICAL
    (0, connection_holder_1.setMqttConnection)(mqttConnection);
    (0, subscribers_1.subscribeTopics)(mqttConnection);
    app_1.default.listen(env_1.ENV.PORT, () => {
        console.log(`🚀 Server running on ${env_1.ENV.PORT}`);
    });
}
bootstrap();

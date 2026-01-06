"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishToDevice = publishToDevice;
const aws_iot_device_sdk_v2_1 = require("aws-iot-device-sdk-v2");
const connection_holder_1 = require("./connection_holder");
async function publishToDevice(thingId, subTopic, payload) {
    const connection = (0, connection_holder_1.getMqttConnection)();
    const topic = `mqtt/device/${thingId}/${subTopic}`;
    await connection.publish(topic, JSON.stringify(payload), aws_iot_device_sdk_v2_1.mqtt.QoS.AtLeastOnce);
    console.log('📤 MQTT Published:', topic);
}

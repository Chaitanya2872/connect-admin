"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDeviceControl = sendDeviceControl;
const aws_iot_device_sdk_v2_1 = require("aws-iot-device-sdk-v2");
const connection_holder_1 = require("../mqtt/connection_holder");
async function sendDeviceControl(thingId, status) {
    const topic = `mqtt/device/${thingId}/control`;
    const payload = {
        deviceid: thingId,
        status
    };
    const connection = (0, connection_holder_1.getMqttConnection)();
    await connection.publish(topic, JSON.stringify(payload), aws_iot_device_sdk_v2_1.mqtt.QoS.AtLeastOnce);
    console.log('🎛️ Control sent:', thingId, status);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeTopics = subscribeTopics;
const aws_iot_device_sdk_v2_1 = require("aws-iot-device-sdk-v2");
const device_service_1 = require("../services/device.service");
const health_service_1 = require("../services/health.service");
const update_service_1 = require("../services/update.service");
function subscribeTopics(connection) {
    const handler = (topic, payload) => {
        try {
            const message = Buffer.from(payload).toString('utf-8');
            const data = JSON.parse(message);
            console.log(`📩 MQTT [${topic}] →`, data);
            routeMessage(topic, data);
        }
        catch (err) {
            console.error('❌ MQTT parse error:', err);
        }
    };
    connection.subscribe('$aws/things/+/alive_reply', aws_iot_device_sdk_v2_1.mqtt.QoS.AtLeastOnce, handler);
    connection.subscribe('$aws/things/+/health_reply', aws_iot_device_sdk_v2_1.mqtt.QoS.AtLeastOnce, handler);
    connection.subscribe('$aws/things/+/update', aws_iot_device_sdk_v2_1.mqtt.QoS.AtLeastOnce, handler);
    console.log('📡 All CCMS topics subscribed');
}
/**
 * PURE ROUTER — NO MQTT OBJECT HERE
 */
function routeMessage(topic, data) {
    if (topic.includes('alive_reply')) {
        (0, device_service_1.handleAlive)(data);
        return;
    }
    if (topic.includes('health_reply')) {
        (0, health_service_1.handleHealth)(data);
        return;
    }
    if (topic.includes('/update')) {
        (0, update_service_1.handleUpdate)(data);
        return;
    }
    console.warn('⚠️ Unhandled topic:', topic);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMqttConnection = setMqttConnection;
exports.getMqttConnection = getMqttConnection;
var connection = null;
function setMqttConnection(conn) {
    connection = conn;
}
function getMqttConnection() {
    if (!connection) {
        throw new Error('MQTT connection not initialized');
    }
    return connection;
}

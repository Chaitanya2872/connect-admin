"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMQTT = connectMQTT;
const aws_iot_device_sdk_v2_1 = require("aws-iot-device-sdk-v2");
const path = __importStar(require("path"));
const env_1 = require("../config/env");
async function connectMQTT() {
    const certPath = path.resolve('certs/device.pem.crt');
    const keyPath = path.resolve('certs/private.pem.key');
    const caPath = path.resolve('certs/AmazonRootCA1.pem');
    const config = aws_iot_device_sdk_v2_1.iot.AwsIotMqttConnectionConfigBuilder
        .new_mtls_builder_from_path(certPath, keyPath)
        .with_certificate_authority_from_path(undefined, caPath)
        .with_client_id('ccms-backend')
        .with_endpoint(env_1.ENV.IOT_ENDPOINT)
        .build();
    const client = new aws_iot_device_sdk_v2_1.mqtt.MqttClient();
    const connection = client.new_connection(config);
    await connection.connect();
    console.log('✅ MQTT Connected');
    return connection;
}

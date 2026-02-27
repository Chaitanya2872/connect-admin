"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
var dotenv = require("dotenv");
dotenv.config();
var IOT_ENDPOINTS = (function () {
    var _a;
    var list = (_a = process.env.AWS_IOT_ENDPOINTS) === null || _a === void 0 ? void 0 : _a.split(',').map(function (endpoint) { return endpoint.trim(); }).filter(function (endpoint) { return endpoint.length > 0; });
    if (list && list.length > 0) {
        return list;
    }
    var legacy = [
        process.env.AWS_IOT_ENDPOINT,
        process.env.AWS_IOT_ENDPOINT_V2,
        process.env.AWS_IOT_ENDPOINT_2
    ].filter(function (endpoint) { return Boolean(endpoint); });
    if (legacy.length === 0) {
        throw new Error('AWS_IOT_ENDPOINT or AWS_IOT_ENDPOINTS must be set');
    }
    return legacy;
})();
var AWS_PROVISIONING = {
    region: process.env.AWS_IOT_RG_ONE_REGION_NAME || process.env.AWS_REGION,
    accessKeyId: process.env.AWS_IOT_RG_ONE_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_IOT_RG_ONE_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
    certBucketName: process.env.AWS_IOT_RG_ONE_BUCKET_NAME,
    defaultPolicyName: process.env.AWS_IOT_POLICY_NAME
};
exports.ENV = {
    PORT: process.env.PORT || 4000,
    DB: process.env.DATABASE_URL,
    IOT_ENDPOINTS: IOT_ENDPOINTS,
    IOT_ENDPOINT: IOT_ENDPOINTS[0],
    AWS_PROVISIONING: AWS_PROVISIONING
};

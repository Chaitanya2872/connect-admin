"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOtaValidate = handleOtaValidate;
async function handleOtaValidate(_, payload) {
    console.log(`🧩 OTA Validate: ${payload.deviceid}`);
    console.log(payload);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAlive = handleAlive;
const prisma_1 = require("../db/prisma");
async function handleAlive(topic, payload) {
    const thingId = topic.split('/')[2];
    await prisma_1.prisma.device.upsert({
        where: { deviceId: payload.deviceid },
        update: {
            thingId,
            ipAddress: payload.ipaddress,
            macAddress: payload.macaddress,
            firmwareVersion: payload.firmware_version
        },
        create: {
            deviceId: payload.deviceid,
            thingId,
            ipAddress: payload.ipaddress,
            macAddress: payload.macaddress,
            firmwareVersion: payload.firmware_version
        }
    });
    console.log(`🟢 Alive: ${payload.deviceid}`);
}

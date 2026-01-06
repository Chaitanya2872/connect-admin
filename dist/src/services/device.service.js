"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAlive = handleAlive;
const prisma_1 = require("../db/prisma");
async function handleAlive(payload) {
    const { deviceid, ipaddress, macaddress, firmware_version } = payload;
    const deviceType = deviceid.startsWith('IOTIQ4SC_')
        ? 'SWITCH_4CH'
        : 'SINGLE';
    await prisma_1.prisma.device.upsert({
        where: { deviceId: deviceid },
        update: {
            ipAddress: ipaddress,
            macAddress: macaddress,
            firmwareVersion: firmware_version,
            deviceType
        },
        create: {
            deviceId: deviceid,
            deviceType,
            ipAddress: ipaddress,
            macAddress: macaddress,
            firmwareVersion: firmware_version
        }
    });
    console.log('✅ Device alive saved:', deviceid);
}

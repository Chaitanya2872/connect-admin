"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSwitchStatus = saveSwitchStatus;
const prisma_1 = require("../db/prisma");
async function saveSwitchStatus(deviceId, switchNo, status) {
    await prisma_1.prisma.deviceSwitch.upsert({
        where: {
            deviceId_switchNo: {
                deviceId,
                switchNo
            }
        },
        update: {
            status
        },
        create: {
            deviceId,
            switchNo,
            status
        }
    });
    console.log(`🔌 Switch state saved: ${deviceId} S${switchNo} → ${status}`);
}

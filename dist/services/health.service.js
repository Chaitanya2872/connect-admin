"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleHealth = handleHealth;
const prisma_1 = require("../db/prisma");
async function handleHealth(payload) {
    const { deviceid, heap, rssi, carrier, fault } = payload;
    await prisma_1.prisma.deviceHealth.create({
        data: {
            deviceId: deviceid,
            heap: heap ? Number(heap) : null,
            rssi: rssi ? Number(rssi) : null,
            carrier,
            fault
        }
    });
    console.log('📊 Health saved:', deviceid);
}

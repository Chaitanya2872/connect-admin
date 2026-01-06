"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publishers_1 = require("../mqtt/publishers");
const prisma_1 = require("../db/prisma");
const router = (0, express_1.Router)();
/**
 * POST /api/device/:thingId/control
 *
 * Body:
 * SINGLE:
 * {
 *   "deviceId": "ABC123",
 *   "status": "on"
 * }
 *
 * SWITCH_4CH:
 * {
 *   "deviceId": "IOTIQ4SC_A1024001",
 *   "switchNo": 1,
 *   "status": "on"
 * }
 */
router.post('/:thingId/control', async (req, res) => {
    const { thingId } = req.params;
    const { deviceId, status, switchNo } = req.body;
    if (!deviceId || !status) {
        return res
            .status(400)
            .json({ error: 'deviceId and status are required' });
    }
    const device = await prisma_1.prisma.device.findUnique({
        where: { deviceId },
        select: {
            deviceId: true,
            deviceType: true,
            thingId: true,
            id: true,
            firmwareVersion: true,
            macAddress: true,
            ipAddress: true,
            createdAt: true
        }
    });
    if (!device) {
        return res.status(404).json({ error: 'Device not found' });
    }
    const payload = {
        deviceid: deviceId,
        status
    };
    if (device.deviceType === 'SWITCH_4CH') {
        if (!switchNo) {
            return res
                .status(400)
                .json({ error: 'switchNo required for 4CH device' });
        }
        payload.switch_no = `S${switchNo}`;
    }
    await (0, publishers_1.publishToDevice)(thingId, 'control', payload);
    res.json({ success: true });
});
exports.default = router;

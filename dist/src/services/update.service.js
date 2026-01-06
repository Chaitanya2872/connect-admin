"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdate = handleUpdate;
const prisma_1 = require("../db/prisma");
const switch_service_1 = require("./switch.service");
async function handleUpdate(payload) {
    const { deviceid, climate, energy, switch_no, status } = payload;
    /* ---------------- Climate Data ---------------- */
    if (climate) {
        const [temperature, humidity, sunlight] = climate.split('/');
        await prisma_1.prisma.deviceClimate.create({
            data: {
                deviceId: deviceid,
                temperature: Number(temperature),
                humidity: Number(humidity),
                sunlight: Number(sunlight)
            }
        });
    }
    /* ---------------- Energy Data ---------------- */
    if (energy) {
        const [voltage, current, power, unit] = energy.split('/');
        await prisma_1.prisma.deviceEnergy.create({
            data: {
                deviceId: deviceid,
                voltage: Number(voltage),
                current: Number(current),
                power: Number(power),
                unit: Number(unit)
            }
        });
    }
    /* ---------------- Switch Update (4CH Device) ---------------- */
    if (switch_no && status) {
        const switchNo = Number(String(switch_no).replace('S', ''));
        await (0, switch_service_1.saveSwitchStatus)(deviceid, switchNo, status);
    }
    console.log('🔄 Update saved:', deviceid);
}

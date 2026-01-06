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
    /* ---------------- Switch Update (S1–S100 ONLY) ---------------- */
    if (typeof switch_no === 'string' && status) {
        // Accept ONLY S1 to S100
        const match = switch_no.match(/^S(\d{1,3})$/);
        if (!match) {
            console.log(`⚠️ Ignored unsupported switch: ${switch_no}`);
            return;
        }
        const switchNo = Number(match[1]);
        if (switchNo < 1 || switchNo > 100) {
            console.log(`⚠️ Switch out of range: S${switchNo}`);
            return;
        }
        await (0, switch_service_1.saveSwitchStatus)(deviceid, switchNo, status);
    }
    console.log('🔄 Update saved:', deviceid);
}

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdate = handleUpdate;
var prisma_1 = require("../db/prisma");
var switch_service_1 = require("./switch.service");
var smartmeter_service_1 = require("./smartmeter.service");
function handleUpdate(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var deviceid, climate, energy, switch_no, status, channels, temp, fault, device, deviceType, _a, temperature, humidity, sunlight, _b, voltage, current, power, unit, switchNo, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    deviceid = payload.deviceid, climate = payload.climate, energy = payload.energy, switch_no = payload.switch_no, status = payload.status, channels = payload.channels, temp = payload.temp, fault = payload.fault;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 15, , 16]);
                    if (typeof deviceid !== 'string' || !deviceid.trim()) {
                        console.warn('⚠️ Ignoring update payload without valid deviceid:', payload);
                        return [2 /*return*/];
                    }
                    if (!(0, smartmeter_service_1.isSmartMeter)(deviceid)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, smartmeter_service_1.handleSmartMeterUpdate)(payload)];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
                case 3: return [4 /*yield*/, prisma_1.prisma.device.findUnique({
                        where: { deviceId: deviceid }
                    })];
                case 4:
                    device = _c.sent();
                    if (!!device) return [3 /*break*/, 6];
                    console.warn("\u26A0\uFE0F Device not found: ".concat(deviceid, ". Auto-creating..."));
                    deviceType = 'SINGLE';
                    if (deviceid.startsWith('IOTIQ4SC_')) {
                        deviceType = 'SWITCH_4CH';
                    }
                    else if (deviceid.startsWith('IOTIQDC2_')) {
                        deviceType = 'DONGLE_2CH';
                    }
                    return [4 /*yield*/, prisma_1.prisma.device.create({
                            data: {
                                deviceId: deviceid,
                                deviceType: deviceType
                            }
                        })];
                case 5:
                    // Create device
                    device = _c.sent();
                    console.log("\u2705 Device auto-created: ".concat(deviceid));
                    _c.label = 6;
                case 6:
                    if (!channels) return [3 /*break*/, 8];
                    return [4 /*yield*/, prisma_1.prisma.device.update({
                            where: { deviceId: deviceid },
                            data: { channels: channels }
                        })];
                case 7:
                    _c.sent();
                    console.log("\uD83D\uDD27 Channels configured: ".concat(deviceid, " \u2192 ").concat(channels));
                    _c.label = 8;
                case 8:
                    if (!climate) return [3 /*break*/, 10];
                    _a = climate.split('/'), temperature = _a[0], humidity = _a[1], sunlight = _a[2];
                    return [4 /*yield*/, prisma_1.prisma.deviceClimate.create({
                            data: {
                                deviceId: deviceid,
                                temperature: Number(temperature),
                                humidity: Number(humidity),
                                sunlight: Number(sunlight)
                            }
                        })];
                case 9:
                    _c.sent();
                    _c.label = 10;
                case 10:
                    if (!energy) return [3 /*break*/, 12];
                    _b = energy.split('/'), voltage = _b[0], current = _b[1], power = _b[2], unit = _b[3];
                    return [4 /*yield*/, prisma_1.prisma.deviceEnergy.create({
                            data: {
                                deviceId: deviceid,
                                voltage: Number(voltage),
                                current: Number(current),
                                power: Number(power),
                                unit: Number(unit)
                            }
                        })];
                case 11:
                    _c.sent();
                    _c.label = 12;
                case 12:
                    if (!(switch_no && status)) return [3 /*break*/, 14];
                    switchNo = Number(String(switch_no).replace(/[^\d]/g, ''));
                    return [4 /*yield*/, (0, switch_service_1.saveSwitchStatus)(deviceid, switchNo, status)];
                case 13:
                    _c.sent();
                    _c.label = 14;
                case 14:
                    console.log('🔄 Update saved:', deviceid);
                    return [3 /*break*/, 16];
                case 15:
                    error_1 = _c.sent();
                    console.error('❌ Error handling update:', error_1);
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/];
            }
        });
    });
}

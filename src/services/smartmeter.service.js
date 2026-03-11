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
exports.getSmartMeterLiveSnapshot = getSmartMeterLiveSnapshot;
exports.getSmartMeterLiveSnapshotStored = getSmartMeterLiveSnapshotStored;
exports.handleSmartMeterUpdate = handleSmartMeterUpdate;
exports.handleSmartMeterHealth = handleSmartMeterHealth;
exports.handleSmartMeterAlive = handleSmartMeterAlive;
exports.isSmartMeter = isSmartMeter;
var prisma_1 = require("../db/prisma");
var fs_1 = require("fs");
var path = require("path");
var smartMeterLiveSnapshotCache = new Map();
var SMART_METER_LIVE_CACHE_DIR = path.join(process.cwd(), '.runtime', 'smartmeter-live');
function getSmartMeterLiveSnapshot(deviceId) {
    var _a;
    return (_a = smartMeterLiveSnapshotCache.get(deviceId)) !== null && _a !== void 0 ? _a : null;
}
var toFiniteArray = function (value) {
    if (!Array.isArray(value))
        return [];
    return value.map(function (item) { return Number(item); }).filter(function (n) { return Number.isFinite(n); });
};
var toFiniteOrNull = function (value) {
    if (value === null || value === undefined)
        return null;
    var n = Number(value);
    return Number.isFinite(n) ? n : null;
};
var normalizeSnapshot = function (deviceId, value) {
    if (!value || typeof value !== 'object')
        return null;
    var source = value;
    return {
        deviceId: deviceId,
        meter: source.meter === null || source.meter === undefined || String(source.meter).trim() === ''
            ? null
            : String(source.meter),
        updatedAt: typeof source.updatedAt === 'string' ? source.updatedAt : new Date().toISOString(),
        status: source.status === null || source.status === undefined || String(source.status).trim() === ''
            ? null
            : String(source.status),
        temperature: toFiniteOrNull(source.temperature),
        fault: source.fault === null || source.fault === undefined || String(source.fault).trim() === ''
            ? null
            : String(source.fault),
        frequency: toFiniteOrNull(source.frequency),
        machine: typeof source.machine === 'boolean'
            ? source.machine
            : typeof source.machine === 'number'
                ? source.machine === 1
                : null,
        voltagePhases: toFiniteArray(source.voltagePhases),
        currentPhases: toFiniteArray(source.currentPhases),
        powerPhases: toFiniteArray(source.powerPhases),
        powerFactorPhases: toFiniteArray(source.powerFactorPhases)
    };
};
var snapshotFilePath = function (deviceId) {
    return path.join(SMART_METER_LIVE_CACHE_DIR, "".concat(deviceId, ".json"));
};
var snapshotRichness = function (snapshot) {
    return snapshot.voltagePhases.length +
        snapshot.currentPhases.length +
        snapshot.powerPhases.length +
        snapshot.powerFactorPhases.length;
};
var persistSmartMeterLiveSnapshot = function (snapshot) { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, fs_1.promises.mkdir(SMART_METER_LIVE_CACHE_DIR, { recursive: true })];
            case 1:
                _a.sent();
                return [4 /*yield*/, fs_1.promises.writeFile(snapshotFilePath(snapshot.deviceId), JSON.stringify(snapshot), 'utf8')];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error('❌ Error persisting smart meter live snapshot:', error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
function getSmartMeterLiveSnapshotStored(deviceId) {
    return __awaiter(this, void 0, void 0, function () {
        var cached, best, raw, parsed, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    cached = (_b = smartMeterLiveSnapshotCache.get(deviceId)) !== null && _b !== void 0 ? _b : null;
                    best = cached;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs_1.promises.readFile(snapshotFilePath(deviceId), 'utf8')];
                case 2:
                    raw = _c.sent();
                    parsed = normalizeSnapshot(deviceId, JSON.parse(raw));
                    if (parsed) {
                        if (!best ||
                            snapshotRichness(parsed) > snapshotRichness(best) ||
                            new Date(parsed.updatedAt).getTime() > new Date(best.updatedAt).getTime()) {
                            best = parsed;
                        }
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 4:
                    if (best) {
                        smartMeterLiveSnapshotCache.set(deviceId, best);
                        return [2 /*return*/, best];
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Handle smart meter update messages
 * Topic: $aws/things/(thingId)/update
 *
 * Payload example:
 * {
 *   "deviceid": "IOTIQSM_A1125004",
 *   "status": "off",
 *   "temp": "30.0C",
 *   "voltage": "235.58#236.10#240.55#235.58#408.02",
 *   "current": "1.68#0.73#1.32#3.73",
 *   "power": "-32.40#-32.67#0.02#-130.72",
 *   "Powerfactor": "-1.00#-1.00#0.13#-1.00",
 *   "frequency": "50.0"
 * }
 */
function handleSmartMeterUpdate(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var deviceid, device, asNumber_1, asBoolean, parseSeriesNumbers, roundTo, voltageSeries, currentSeries, powerSeries, powerFactorSeries, voltagePhase1, voltagePhase2, voltagePhase3, voltageTotal, currentPhase1, currentPhase2, currentPhase3, currentTotal, powerPhase1, powerPhase2, powerPhase3, powerTotalActive, powerFactorPhase1, powerFactorPhase2, powerFactorPhase3, powerFactorTotal, frequencyHz, machineValue, temperatureC, rawStatus, statusValue, energyPhaseR, energyPhaseY, energyPhaseB, energyTotal3Phase, apparentPhase1, apparentPhase2, apparentPhase3, apparentFromPhases, apparentFromTotals, apparentPower, reactiveFrom, reactivePhase1, reactivePhase2, reactivePhase3, reactiveFromPhases, reactivePower, snapshot, error_2;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    deviceid = payload.deviceid;
                    console.log("\uD83D\uDCE5 Raw payload keys for ".concat(deviceid, ":"), Object.keys(payload));
                    console.log("\uD83D\uDCE5 voltage=".concat(payload.voltage, " current=").concat(payload.current, " power=").concat(payload.power));
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, prisma_1.prisma.device.findUnique({
                            where: { deviceId: deviceid }
                        })];
                case 2:
                    device = _f.sent();
                    if (!!device) return [3 /*break*/, 4];
                    console.warn("\u26A0\uFE0F Smart Meter not found: ".concat(deviceid, ". Auto-creating..."));
                    return [4 /*yield*/, prisma_1.prisma.device.create({
                            data: {
                                deviceId: deviceid,
                                deviceType: 'SMART_METER'
                            }
                        })];
                case 3:
                    device = _f.sent();
                    console.log("\u2705 Smart Meter auto-created: ".concat(deviceid));
                    _f.label = 4;
                case 4:
                    asNumber_1 = function (value) {
                        if (value === null || value === undefined)
                            return null;
                        if (typeof value === 'number')
                            return Number.isFinite(value) ? value : null;
                        if (typeof value === 'string') {
                            var trimmed = value.trim();
                            if (!trimmed)
                                return null;
                            var direct = Number(trimmed);
                            if (Number.isFinite(direct))
                                return direct;
                            var match = trimmed.match(/-?\d+(\.\d+)?/);
                            if (match) {
                                var parsed = Number(match[0]);
                                return Number.isFinite(parsed) ? parsed : null;
                            }
                            return null;
                        }
                        var n = Number(value);
                        return Number.isFinite(n) ? n : null;
                    };
                    asBoolean = function (value) {
                        if (value === true || value === false)
                            return value;
                        if (typeof value === 'string') {
                            var normalized = value.trim().toLowerCase();
                            if (normalized === 'true' || normalized === '1' || normalized === 'on' || normalized === 'yes')
                                return true;
                            if (normalized === 'false' || normalized === '0' || normalized === 'off' || normalized === 'no')
                                return false;
                        }
                        if (typeof value === 'number') {
                            if (value === 1)
                                return true;
                            if (value === 0)
                                return false;
                        }
                        return null;
                    };
                    parseSeriesNumbers = function (value) {
                        if (value === null || value === undefined)
                            return [];
                        if (Array.isArray(value)) {
                            return value.map(function (item) { return asNumber_1(item); }).filter(function (n) { return n !== null; });
                        }
                        if (typeof value === 'number')
                            return Number.isFinite(value) ? [value] : [];
                        if (typeof value !== 'string')
                            return [];
                        return value
                            .replace(/#/g, '/')
                            .split(/[\/,|;]/)
                            .map(function (part) { return asNumber_1(part); })
                            .filter(function (n) { return n !== null; });
                    };
                    roundTo = function (value, decimals) {
                        if (value === null || !Number.isFinite(value))
                            return null;
                        var scale = Math.pow(10, decimals);
                        return Math.round(value * scale) / scale;
                    };
                    voltageSeries = parseSeriesNumbers(payload.voltage);
                    currentSeries = parseSeriesNumbers(payload.current);
                    powerSeries = parseSeriesNumbers(payload.power);
                    powerFactorSeries = parseSeriesNumbers((_c = (_b = (_a = payload.Powerfactor) !== null && _a !== void 0 ? _a : payload.powerFactor) !== null && _b !== void 0 ? _b : payload.power_factor) !== null && _c !== void 0 ? _c : payload.powerfactor);
                    // ✅ Guard: skip saving if core electrical series are missing
                    if (voltageSeries.length === 0 || currentSeries.length === 0 || powerSeries.length === 0) {
                        console.warn("\u26A0\uFE0F Skipping partial payload for ".concat(deviceid, " \u2014 missing electrical series. Keys: ").concat(Object.keys(payload).join(', ')));
                        return [2 /*return*/];
                    }
                    voltagePhase1 = asNumber_1(voltageSeries[0]);
                    voltagePhase2 = asNumber_1(voltageSeries[1]);
                    voltagePhase3 = asNumber_1(voltageSeries[2]);
                    voltageTotal = asNumber_1(voltageSeries.length >= 5 ? voltageSeries[4] : (_d = voltageSeries[3]) !== null && _d !== void 0 ? _d : voltageSeries[0]);
                    currentPhase1 = asNumber_1(currentSeries[0]);
                    currentPhase2 = asNumber_1(currentSeries[1]);
                    currentPhase3 = asNumber_1(currentSeries[2]);
                    currentTotal = asNumber_1(currentSeries[currentSeries.length - 1]);
                    powerPhase1 = asNumber_1(powerSeries[0]);
                    powerPhase2 = asNumber_1(powerSeries[1]);
                    powerPhase3 = asNumber_1(powerSeries[2]);
                    powerTotalActive = asNumber_1(powerSeries[powerSeries.length - 1]);
                    powerFactorPhase1 = asNumber_1(powerFactorSeries[0]);
                    powerFactorPhase2 = asNumber_1(powerFactorSeries[1]);
                    powerFactorPhase3 = asNumber_1(powerFactorSeries[2]);
                    powerFactorTotal = asNumber_1(powerFactorSeries[powerFactorSeries.length - 1]);
                    frequencyHz = asNumber_1(payload.frequency);
                    machineValue = asBoolean((_e = payload.machine) !== null && _e !== void 0 ? _e : payload.status);
                    temperatureC = asNumber_1(payload.temp);
                    rawStatus = payload.status;
                    statusValue = rawStatus === null || rawStatus === undefined || String(rawStatus).trim() === ''
                        ? null
                        : String(rawStatus).trim().toLowerCase();
                    energyPhaseR = powerPhase1 !== null ? roundTo(Math.abs(powerPhase1) / 1000, 3) : null;
                    energyPhaseY = powerPhase2 !== null ? roundTo(Math.abs(powerPhase2) / 1000, 3) : null;
                    energyPhaseB = powerPhase3 !== null ? roundTo(Math.abs(powerPhase3) / 1000, 3) : null;
                    energyTotal3Phase = powerTotalActive !== null ? roundTo(Math.abs(powerTotalActive) / 1000, 3) : null;
                    apparentPhase1 = voltagePhase1 !== null && currentPhase1 !== null ? Math.abs(voltagePhase1 * currentPhase1) : null;
                    apparentPhase2 = voltagePhase2 !== null && currentPhase2 !== null ? Math.abs(voltagePhase2 * currentPhase2) : null;
                    apparentPhase3 = voltagePhase3 !== null && currentPhase3 !== null ? Math.abs(voltagePhase3 * currentPhase3) : null;
                    apparentFromPhases = [apparentPhase1, apparentPhase2, apparentPhase3]
                        .filter(function (v) { return v !== null; })
                        .reduce(function (sum, v) { return sum + v; }, 0);
                    apparentFromTotals = voltageTotal !== null && currentTotal !== null
                        ? Math.abs(voltageTotal * currentTotal)
                        : null;
                    apparentPower = roundTo(apparentFromPhases > 0 ? apparentFromPhases : apparentFromTotals, 2);
                    reactiveFrom = function (apparent, active) {
                        if (apparent === null || active === null)
                            return null;
                        var qSquared = apparent * apparent - active * active;
                        if (!Number.isFinite(qSquared))
                            return null;
                        return Math.sqrt(Math.max(qSquared, 0));
                    };
                    reactivePhase1 = reactiveFrom(apparentPhase1, powerPhase1);
                    reactivePhase2 = reactiveFrom(apparentPhase2, powerPhase2);
                    reactivePhase3 = reactiveFrom(apparentPhase3, powerPhase3);
                    reactiveFromPhases = [reactivePhase1, reactivePhase2, reactivePhase3]
                        .filter(function (v) { return v !== null; })
                        .reduce(function (sum, v) { return sum + v; }, 0);
                    reactivePower = roundTo(reactiveFromPhases > 0
                        ? reactiveFromPhases
                        : reactiveFrom(apparentPower, powerTotalActive), 2);
                    snapshot = {
                        deviceId: deviceid,
                        meter: null,
                        updatedAt: new Date().toISOString(),
                        status: statusValue,
                        temperature: temperatureC,
                        fault: null,
                        frequency: frequencyHz,
                        machine: machineValue,
                        voltagePhases: voltageSeries,
                        currentPhases: currentSeries,
                        powerPhases: powerSeries,
                        powerFactorPhases: powerFactorSeries
                    };
                    smartMeterLiveSnapshotCache.set(deviceid, snapshot);
                    void persistSmartMeterLiveSnapshot(snapshot);
                    // Save to database
                    return [4 /*yield*/, prisma_1.prisma.smartMeterData.create({
                            data: {
                                deviceId: deviceid,
                                meter: null,
                                status: statusValue,
                                machine: machineValue,
                                fault: null,
                                temperatureC: temperatureC,
                                frequencyHz: frequencyHz,
                                voltagePhase1: voltagePhase1,
                                voltagePhase2: voltagePhase2,
                                voltagePhase3: voltagePhase3,
                                voltageTotal: voltageTotal,
                                currentPhase1: currentPhase1,
                                currentPhase2: currentPhase2,
                                currentPhase3: currentPhase3,
                                currentTotal: currentTotal,
                                powerPhase1: powerPhase1,
                                powerPhase2: powerPhase2,
                                powerPhase3: powerPhase3,
                                powerTotalActive: powerTotalActive,
                                powerFactorPhase1: powerFactorPhase1,
                                powerFactorPhase2: powerFactorPhase2,
                                powerFactorPhase3: powerFactorPhase3,
                                powerFactorTotal: powerFactorTotal,
                                energyPhaseR: energyPhaseR,
                                energyPhaseY: energyPhaseY,
                                energyPhaseB: energyPhaseB,
                                energyTotal3Phase: energyTotal3Phase,
                                apparentPower: apparentPower,
                                reactivePower: reactivePower
                            }
                        })];
                case 5:
                    // Save to database
                    _f.sent();
                    console.log("\uD83D\uDCCA Smart Meter update saved: ".concat(deviceid));
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _f.sent();
                    console.error('❌ Error handling smart meter update:', error_2);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle smart meter health messages
 * Topic: $aws/things/(thingId)/health_reply
 */
function handleSmartMeterHealth(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var deviceid, heap, rssi, internet_speed, fault, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    deviceid = payload.deviceid, heap = payload.heap, rssi = payload.rssi, internet_speed = payload.internet_speed, fault = payload.fault;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, prisma_1.prisma.deviceHealth.create({
                            data: {
                                deviceId: deviceid,
                                heap: heap ? parseInt(heap) : null,
                                rssi: rssi ? parseInt(rssi) : null,
                                carrier: internet_speed || null,
                                fault: fault || null
                            }
                        })];
                case 2:
                    _a.sent();
                    console.log("\uD83C\uDFE5 Smart Meter health saved: ".concat(deviceid));
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('❌ Error handling smart meter health:', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle smart meter alive messages
 * Topic: $aws/things/(thingId)/alive_reply
 */
function handleSmartMeterAlive(topic, payload) {
    return __awaiter(this, void 0, void 0, function () {
        var thingId, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    thingId = topic.split('/')[2];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, prisma_1.prisma.device.upsert({
                            where: { deviceId: payload.deviceid },
                            update: {
                                thingId: thingId,
                                ipAddress: payload.ipaddress,
                                macAddress: payload.macaddress,
                                firmwareVersion: payload.firmware_version,
                                deviceType: 'SMART_METER'
                            },
                            create: {
                                deviceId: payload.deviceid,
                                thingId: thingId,
                                deviceType: 'SMART_METER',
                                ipAddress: payload.ipaddress,
                                macAddress: payload.macaddress,
                                firmwareVersion: payload.firmware_version
                            }
                        })];
                case 2:
                    _a.sent();
                    console.log("\uD83D\uDFE2 Smart Meter alive: ".concat(payload.deviceid));
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error('❌ Error handling smart meter alive:', error_4);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if a device is a smart meter based on deviceId prefix
 */
function isSmartMeter(deviceId) {
    if (typeof deviceId !== 'string' || !deviceId.trim())
        return false;
    return deviceId.startsWith('IOTIQSM_') || deviceId.startsWith('IOTIQSM1_');
}

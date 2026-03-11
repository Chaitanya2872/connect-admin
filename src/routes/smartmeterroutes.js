"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var express_1 = require("express");
var client_1 = require("@prisma/client");
var publishers_1 = require("../mqtt/publishers");
var prisma_1 = require("../db/prisma");
var smartmeter_service_1 = require("../services/smartmeter.service");
var router = (0, express_1.Router)();
var SMART_METER_STALE_MS = 3 * 60 * 1000;
var SMART_METER_STALE_SECONDS = SMART_METER_STALE_MS / 1000;
var getQueryString = function (value) {
    if (Array.isArray(value)) {
        var first = value[0];
        return typeof first === 'string' ? first : first !== undefined ? String(first) : undefined;
    }
    if (typeof value === 'string')
        return value;
    if (typeof value === 'number' || typeof value === 'boolean')
        return String(value);
    return undefined;
};
var parseDateParam = function (value) {
    if (!value)
        return null;
    var trimmed = value.trim();
    if (!trimmed)
        return null;
    var parsed = function (input) {
        var date = new Date(input);
        return Number.isNaN(date.getTime()) ? null : date;
    };
    var direct = parsed(trimmed);
    if (direct)
        return direct;
    if (/^\d+$/.test(trimmed)) {
        var date = parsed(Number(trimmed));
        if (date)
            return date;
    }
    if (trimmed.includes(' ') && !trimmed.includes('+')) {
        var plusFixed = parsed(trimmed.replace(' ', '+'));
        if (plusFixed)
            return plusFixed;
    }
    return null;
};
var parseBucket = function (value) {
    if (!value)
        return 'hour';
    var bucket = value.toLowerCase();
    var allowed = ['minute', 'hour', 'day', 'week', 'month'];
    return allowed.includes(bucket) ? bucket : null;
};
var parsePositiveInt = function (value, defaultValue, maxValue) {
    if (!value)
        return defaultValue !== null && defaultValue !== void 0 ? defaultValue : null;
    var parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0)
        return null;
    if (maxValue && parsed > maxValue)
        return maxValue;
    return parsed;
};
var toNumber = function (value) {
    if (value === null || value === undefined)
        return null;
    var n = Number(value);
    return Number.isFinite(n) ? n : null;
};
var isSmartMeterDataStale = function (createdAt) {
    if (!createdAt)
        return true;
    return Date.now() - createdAt.getTime() > SMART_METER_STALE_MS;
};
var connectivityStatusFromFreshness = function (createdAt) {
    return isSmartMeterDataStale(createdAt) ? 'off' : 'on';
};
var SMART_METER_PREFIX_SUFFIXES = [
    'timestamp',
    'status',
    'machine',
    'fault',
    'temperatureC',
    'frequencyHz',
    'voltage_phase1',
    'voltage_phase2',
    'voltage_phase3',
    'voltage_total',
    'current_phase1',
    'current_phase2',
    'current_phase3',
    'current_total',
    'power_phase1',
    'power_phase2',
    'power_phase3',
    'power_totalActive',
    'powerFactor_phase1',
    'powerFactor_phase2',
    'powerFactor_phase3',
    'powerFactor_total',
    'energy_phaseR_kWh',
    'energy_phaseY_kWh',
    'energy_phaseB_kWh',
    'energy_total3Phase_kWh',
    'reactivePower_var',
    'apparentPower_VA'
];
var buildNullPrefixedParameters = function (parameterPrefix) {
    var result = {};
    for (var _i = 0, SMART_METER_PREFIX_SUFFIXES_1 = SMART_METER_PREFIX_SUFFIXES; _i < SMART_METER_PREFIX_SUFFIXES_1.length; _i++) {
        var suffix = SMART_METER_PREFIX_SUFFIXES_1[_i];
        result["".concat(parameterPrefix, "_").concat(suffix)] = null;
    }
    return result;
};
var SMART_METER_DATA_FIELDS = [
    'id',
    'deviceId',
    'meter',
    'status',
    'machine',
    'fault',
    'temperatureC',
    'frequencyHz',
    'voltagePhase1',
    'voltagePhase2',
    'voltagePhase3',
    'voltageTotal',
    'currentPhase1',
    'currentPhase2',
    'currentPhase3',
    'currentTotal',
    'powerPhase1',
    'powerPhase2',
    'powerPhase3',
    'powerTotalActive',
    'powerFactorPhase1',
    'powerFactorPhase2',
    'powerFactorPhase3',
    'powerFactorTotal',
    'energyPhaseR',
    'energyPhaseY',
    'energyPhaseB',
    'energyTotal3Phase',
    'reactivePower',
    'apparentPower',
    'createdAt'
];
var buildNullSmartMeterData = function () {
    var result = {};
    for (var _i = 0, SMART_METER_DATA_FIELDS_1 = SMART_METER_DATA_FIELDS; _i < SMART_METER_DATA_FIELDS_1.length; _i++) {
        var field = SMART_METER_DATA_FIELDS_1[_i];
        result[field] = null;
    }
    return result;
};
var buildNullSummaryMetrics = function () { return ({
    averages: {
        voltagePhase1: null,
        voltagePhase2: null,
        voltagePhase3: null,
        voltageTotal: null,
        currentTotal: null,
        powerFactorTotal: null,
        powerTotalActive: null,
        frequencyHz: null
    },
    minimums: {
        voltagePhase1: null,
        voltageTotal: null,
        currentTotal: null,
        powerFactorTotal: null,
        powerTotalActive: null,
        frequencyHz: null
    },
    maximums: {
        voltagePhase1: null,
        voltageTotal: null,
        currentTotal: null,
        powerFactorTotal: null,
        powerTotalActive: null,
        frequencyHz: null
    },
    machine: {
        on: null,
        off: null,
        unknown: null,
        onRatio: null
    }
}); };
/**
 * POST /api/smartmeter/:thingId/config
 */
router.post('/:thingId/config', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var thingId, _a, deviceid, ssid, password, access_token, secret, mode, payload, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                thingId = req.params.thingId;
                _a = req.body, deviceid = _a.deviceid, ssid = _a.ssid, password = _a.password, access_token = _a.access_token, secret = _a.secret, mode = _a.mode;
                if (!deviceid || !ssid || !password) {
                    return [2 /*return*/, res.status(400).json({ error: 'deviceid, ssid and password are required' })];
                }
                payload = {
                    deviceid: deviceid,
                    ssid: ssid,
                    password: password,
                    access_token: access_token || '',
                    secret: secret || '',
                    mode: mode || '1'
                };
                return [4 /*yield*/, (0, publishers_1.publishToDevice)(thingId, 'config', payload)];
            case 1:
                _b.sent();
                console.log("\uD83D\uDCE1 Smart Meter config sent: ".concat(deviceid));
                res.json({ success: true });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error('❌ Smart meter config error:', error_1);
                res.status(500).json({ error: 'Configuration failed' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/smartmeter/:thingId/setting
 */
router.post('/:thingId/setting', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var thingId, _a, deviceid, status_1, parameter, range, thres, trig_time, stop_time, repeat, payload, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                thingId = req.params.thingId;
                _a = req.body, deviceid = _a.deviceid, status_1 = _a.status, parameter = _a.parameter, range = _a.range, thres = _a.thres, trig_time = _a.trig_time, stop_time = _a.stop_time, repeat = _a.repeat;
                if (!deviceid) {
                    return [2 /*return*/, res.status(400).json({ error: 'deviceid is required' })];
                }
                payload = {
                    deviceid: deviceid,
                    status: status_1 || '',
                    parameter: parameter || '',
                    range: range || '',
                    thres: thres || '',
                    trig_time: trig_time || '',
                    stop_time: stop_time || '',
                    repeat: repeat || ''
                };
                return [4 /*yield*/, (0, publishers_1.publishToDevice)(thingId, 'setting', payload)];
            case 1:
                _b.sent();
                if (!(parameter || range || thres || trig_time || stop_time || repeat)) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma_1.prisma.smartMeterSettings.upsert({
                        where: { deviceId: deviceid },
                        update: {
                            parameter: parameter || undefined,
                            range: range || undefined,
                            threshold: thres || undefined,
                            triggerTime: trig_time || undefined,
                            stopTime: stop_time || undefined,
                            repeatPattern: repeat || undefined
                        },
                        create: {
                            deviceId: deviceid,
                            parameter: parameter || null,
                            range: range || null,
                            threshold: thres || null,
                            triggerTime: trig_time || null,
                            stopTime: stop_time || null,
                            repeatPattern: repeat || null
                        }
                    })];
            case 2:
                _b.sent();
                _b.label = 3;
            case 3:
                console.log("\u2699\uFE0F Smart Meter settings sent: ".concat(deviceid));
                res.json({ success: true });
                return [3 /*break*/, 5];
            case 4:
                error_2 = _b.sent();
                console.error('❌ Smart meter setting error:', error_2);
                res.status(500).json({ error: 'Setting configuration failed' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/smartmeter/:thingId/control
 */
router.post('/:thingId/control', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var thingId, _a, deviceid, status_2, payload, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                thingId = req.params.thingId;
                _a = req.body, deviceid = _a.deviceid, status_2 = _a.status;
                if (!deviceid || !status_2) {
                    return [2 /*return*/, res.status(400).json({ error: 'deviceid and status are required' })];
                }
                if (!['on', 'off'].includes(status_2.toLowerCase())) {
                    return [2 /*return*/, res.status(400).json({ error: 'status must be "on" or "off"' })];
                }
                payload = { deviceid: deviceid, status: status_2.toLowerCase() };
                return [4 /*yield*/, (0, publishers_1.publishToDevice)(thingId, 'control', payload)];
            case 1:
                _b.sent();
                console.log("\uD83C\uDF9B\uFE0F Smart Meter control sent: ".concat(deviceid, " \u2192 ").concat(status_2));
                res.json({ success: true });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _b.sent();
                console.error('❌ Smart meter control error:', error_3);
                res.status(500).json({ error: 'Control command failed' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/smartmeter/:thingId/reset
 */
router.post('/:thingId/reset', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var thingId, _a, deviceid, mode, secret, payload, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                thingId = req.params.thingId;
                _a = req.body, deviceid = _a.deviceid, mode = _a.mode, secret = _a.secret;
                if (!deviceid) {
                    return [2 /*return*/, res.status(400).json({ error: 'deviceid is required' })];
                }
                payload = { deviceid: deviceid, mode: mode || '1', secret: secret || '' };
                return [4 /*yield*/, (0, publishers_1.publishToDevice)(thingId, 'reset', payload)];
            case 1:
                _b.sent();
                console.log("\uD83D\uDD04 Smart Meter reset sent: ".concat(deviceid));
                res.json({ success: true });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _b.sent();
                console.error('❌ Smart meter reset error:', error_4);
                res.status(500).json({ error: 'Reset command failed' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/smartmeter/:thingId/alive
 */
router.post('/:thingId/alive', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var thingId, deviceid, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                thingId = req.params.thingId;
                deviceid = req.body.deviceid;
                if (!deviceid) {
                    return [2 /*return*/, res.status(400).json({ error: 'deviceid is required' })];
                }
                return [4 /*yield*/, (0, publishers_1.publishToDevice)(thingId, 'alive', { deviceid: deviceid })];
            case 1:
                _a.sent();
                console.log("\uD83D\uDC9A Smart Meter alive request sent: ".concat(deviceid));
                res.json({ success: true });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('❌ Smart meter alive error:', error_5);
                res.status(500).json({ error: 'Alive request failed' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/smartmeter/:deviceId/analytics/summary
 */
router.get('/:deviceId/analytics/summary', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceId, fromValue, toValue, meterValue, fromDate, toDate, device, where, conditions, whereSql, latestForStaleness, nullMetrics, _a, summaryRows, latest, first, machineCounts, summary, samples, machineTotals, machineOn, machineOff, machineUnknown, machineOnRatio, error_6;
    var _b, _c, _d, _e, _f, _g, _h, _j;
    return __generator(this, function (_k) {
        switch (_k.label) {
            case 0:
                _k.trys.push([0, 4, , 5]);
                deviceId = req.params.deviceId;
                fromValue = getQueryString(req.query.from);
                toValue = getQueryString(req.query.to);
                meterValue = getQueryString(req.query.meter);
                fromDate = parseDateParam(fromValue);
                if (fromValue && !fromDate)
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid from date' })];
                toDate = parseDateParam(toValue);
                if (toValue && !toDate)
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid to date' })];
                return [4 /*yield*/, prisma_1.prisma.device.findUnique({
                        where: { deviceId: deviceId },
                        select: { deviceId: true, deviceType: true }
                    })];
            case 1:
                device = _k.sent();
                if (!device)
                    return [2 /*return*/, res.status(404).json({ error: 'Device not found' })];
                if (device.deviceType !== 'SMART_METER')
                    return [2 /*return*/, res.status(400).json({ error: 'Not a smart meter device' })];
                where = { deviceId: deviceId };
                if (meterValue)
                    where.meter = meterValue;
                if (fromDate || toDate) {
                    where.createdAt = {};
                    if (fromDate)
                        where.createdAt.gte = fromDate;
                    if (toDate)
                        where.createdAt.lte = toDate;
                }
                conditions = [client_1.Prisma.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\"deviceId\" = ", ""], ["\"deviceId\" = ", ""])), deviceId)];
                if (meterValue)
                    conditions.push(client_1.Prisma.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\"meter\" = ", ""], ["\"meter\" = ", ""])), meterValue));
                if (fromDate)
                    conditions.push(client_1.Prisma.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\"createdAt\" >= ", ""], ["\"createdAt\" >= ", ""])), fromDate));
                if (toDate)
                    conditions.push(client_1.Prisma.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\"createdAt\" <= ", ""], ["\"createdAt\" <= ", ""])), toDate));
                whereSql = client_1.Prisma.join(conditions, ' AND ');
                return [4 /*yield*/, prisma_1.prisma.smartMeterData.findFirst({
                        where: __assign({ deviceId: deviceId }, (meterValue ? { meter: meterValue } : {})),
                        orderBy: { createdAt: 'desc' },
                        select: { createdAt: true }
                    })];
            case 2:
                latestForStaleness = _k.sent();
                if (isSmartMeterDataStale(latestForStaleness === null || latestForStaleness === void 0 ? void 0 : latestForStaleness.createdAt)) {
                    nullMetrics = buildNullSummaryMetrics();
                    return [2 /*return*/, res.json({
                            deviceId: deviceId,
                            meter: meterValue || null,
                            range: {
                                from: fromDate ? fromDate.toISOString() : null,
                                to: toDate ? toDate.toISOString() : null
                            },
                            staleAfterSeconds: SMART_METER_STALE_SECONDS,
                            dataStale: true,
                            lastSavedAt: ((_b = latestForStaleness === null || latestForStaleness === void 0 ? void 0 : latestForStaleness.createdAt) === null || _b === void 0 ? void 0 : _b.toISOString()) || null,
                            samples: null,
                            averages: nullMetrics.averages,
                            minimums: nullMetrics.minimums,
                            maximums: nullMetrics.maximums,
                            machine: nullMetrics.machine,
                            first: null,
                            latest: null
                        })];
                }
                return [4 /*yield*/, Promise.all([
                        prisma_1.prisma.$queryRaw(client_1.Prisma.sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n        SELECT\n          COUNT(*)::int AS \"samples\",\n          AVG(\"voltagePhase1\")    AS \"voltagePhase1Avg\",\n          AVG(\"voltagePhase2\")    AS \"voltagePhase2Avg\",\n          AVG(\"voltagePhase3\")    AS \"voltagePhase3Avg\",\n          AVG(\"voltageTotal\")     AS \"voltageTotalAvg\",\n          AVG(\"currentTotal\")     AS \"currentTotalAvg\",\n          AVG(\"powerFactorTotal\") AS \"powerFactorTotalAvg\",\n          AVG(\"powerTotalActive\") AS \"powerTotalActiveAvg\",\n          AVG(\"frequencyHz\")      AS \"frequencyHzAvg\",\n          MIN(\"voltagePhase1\")    AS \"voltagePhase1Min\",\n          MIN(\"voltageTotal\")     AS \"voltageTotalMin\",\n          MIN(\"currentTotal\")     AS \"currentTotalMin\",\n          MIN(\"powerFactorTotal\") AS \"powerFactorTotalMin\",\n          MIN(\"powerTotalActive\") AS \"powerTotalActiveMin\",\n          MIN(\"frequencyHz\")      AS \"frequencyHzMin\",\n          MAX(\"voltagePhase1\")    AS \"voltagePhase1Max\",\n          MAX(\"voltageTotal\")     AS \"voltageTotalMax\",\n          MAX(\"currentTotal\")     AS \"currentTotalMax\",\n          MAX(\"powerFactorTotal\") AS \"powerFactorTotalMax\",\n          MAX(\"powerTotalActive\") AS \"powerTotalActiveMax\",\n          MAX(\"frequencyHz\")      AS \"frequencyHzMax\"\n        FROM \"SmartMeterData\"\n        WHERE ", "\n      "], ["\n        SELECT\n          COUNT(*)::int AS \"samples\",\n          AVG(\"voltagePhase1\")    AS \"voltagePhase1Avg\",\n          AVG(\"voltagePhase2\")    AS \"voltagePhase2Avg\",\n          AVG(\"voltagePhase3\")    AS \"voltagePhase3Avg\",\n          AVG(\"voltageTotal\")     AS \"voltageTotalAvg\",\n          AVG(\"currentTotal\")     AS \"currentTotalAvg\",\n          AVG(\"powerFactorTotal\") AS \"powerFactorTotalAvg\",\n          AVG(\"powerTotalActive\") AS \"powerTotalActiveAvg\",\n          AVG(\"frequencyHz\")      AS \"frequencyHzAvg\",\n          MIN(\"voltagePhase1\")    AS \"voltagePhase1Min\",\n          MIN(\"voltageTotal\")     AS \"voltageTotalMin\",\n          MIN(\"currentTotal\")     AS \"currentTotalMin\",\n          MIN(\"powerFactorTotal\") AS \"powerFactorTotalMin\",\n          MIN(\"powerTotalActive\") AS \"powerTotalActiveMin\",\n          MIN(\"frequencyHz\")      AS \"frequencyHzMin\",\n          MAX(\"voltagePhase1\")    AS \"voltagePhase1Max\",\n          MAX(\"voltageTotal\")     AS \"voltageTotalMax\",\n          MAX(\"currentTotal\")     AS \"currentTotalMax\",\n          MAX(\"powerFactorTotal\") AS \"powerFactorTotalMax\",\n          MAX(\"powerTotalActive\") AS \"powerTotalActiveMax\",\n          MAX(\"frequencyHz\")      AS \"frequencyHzMax\"\n        FROM \"SmartMeterData\"\n        WHERE ", "\n      "])), whereSql)),
                        prisma_1.prisma.smartMeterData.findFirst({ where: where, orderBy: { createdAt: 'desc' } }),
                        prisma_1.prisma.smartMeterData.findFirst({ where: where, orderBy: { createdAt: 'asc' } }),
                        prisma_1.prisma.$queryRaw(client_1.Prisma.sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n        SELECT \"machine\", COUNT(*)::int AS \"count\"\n        FROM \"SmartMeterData\"\n        WHERE ", "\n        GROUP BY \"machine\"\n      "], ["\n        SELECT \"machine\", COUNT(*)::int AS \"count\"\n        FROM \"SmartMeterData\"\n        WHERE ", "\n        GROUP BY \"machine\"\n      "])), whereSql))
                    ])];
            case 3:
                _a = _k.sent(), summaryRows = _a[0], latest = _a[1], first = _a[2], machineCounts = _a[3];
                summary = summaryRows[0];
                samples = summary ? Number(summary.samples) : 0;
                machineTotals = machineCounts.reduce(function (sum, row) { return sum + Number(row.count); }, 0);
                machineOn = (_d = (_c = machineCounts.find(function (row) { return row.machine === true; })) === null || _c === void 0 ? void 0 : _c.count) !== null && _d !== void 0 ? _d : 0;
                machineOff = (_f = (_e = machineCounts.find(function (row) { return row.machine === false; })) === null || _e === void 0 ? void 0 : _e.count) !== null && _f !== void 0 ? _f : 0;
                machineUnknown = (_h = (_g = machineCounts.find(function (row) { return row.machine === null; })) === null || _g === void 0 ? void 0 : _g.count) !== null && _h !== void 0 ? _h : 0;
                machineOnRatio = machineTotals > 0 ? machineOn / machineTotals : null;
                res.json({
                    deviceId: deviceId,
                    meter: meterValue || null,
                    range: {
                        from: fromDate ? fromDate.toISOString() : null,
                        to: toDate ? toDate.toISOString() : null
                    },
                    staleAfterSeconds: SMART_METER_STALE_SECONDS,
                    dataStale: false,
                    lastSavedAt: ((_j = latest === null || latest === void 0 ? void 0 : latest.createdAt) === null || _j === void 0 ? void 0 : _j.toISOString()) || null,
                    samples: samples,
                    averages: {
                        voltagePhase1: toNumber(summary === null || summary === void 0 ? void 0 : summary.voltagePhase1Avg),
                        voltagePhase2: toNumber(summary === null || summary === void 0 ? void 0 : summary.voltagePhase2Avg),
                        voltagePhase3: toNumber(summary === null || summary === void 0 ? void 0 : summary.voltagePhase3Avg),
                        voltageTotal: toNumber(summary === null || summary === void 0 ? void 0 : summary.voltageTotalAvg),
                        currentTotal: toNumber(summary === null || summary === void 0 ? void 0 : summary.currentTotalAvg),
                        powerFactorTotal: toNumber(summary === null || summary === void 0 ? void 0 : summary.powerFactorTotalAvg),
                        powerTotalActive: toNumber(summary === null || summary === void 0 ? void 0 : summary.powerTotalActiveAvg),
                        frequencyHz: toNumber(summary === null || summary === void 0 ? void 0 : summary.frequencyHzAvg)
                    },
                    minimums: {
                        voltagePhase1: toNumber(summary === null || summary === void 0 ? void 0 : summary.voltagePhase1Min),
                        voltageTotal: toNumber(summary === null || summary === void 0 ? void 0 : summary.voltageTotalMin),
                        currentTotal: toNumber(summary === null || summary === void 0 ? void 0 : summary.currentTotalMin),
                        powerFactorTotal: toNumber(summary === null || summary === void 0 ? void 0 : summary.powerFactorTotalMin),
                        powerTotalActive: toNumber(summary === null || summary === void 0 ? void 0 : summary.powerTotalActiveMin),
                        frequencyHz: toNumber(summary === null || summary === void 0 ? void 0 : summary.frequencyHzMin)
                    },
                    maximums: {
                        voltagePhase1: toNumber(summary === null || summary === void 0 ? void 0 : summary.voltagePhase1Max),
                        voltageTotal: toNumber(summary === null || summary === void 0 ? void 0 : summary.voltageTotalMax),
                        currentTotal: toNumber(summary === null || summary === void 0 ? void 0 : summary.currentTotalMax),
                        powerFactorTotal: toNumber(summary === null || summary === void 0 ? void 0 : summary.powerFactorTotalMax),
                        powerTotalActive: toNumber(summary === null || summary === void 0 ? void 0 : summary.powerTotalActiveMax),
                        frequencyHz: toNumber(summary === null || summary === void 0 ? void 0 : summary.frequencyHzMax)
                    },
                    machine: {
                        on: machineOn,
                        off: machineOff,
                        unknown: machineUnknown,
                        onRatio: machineOnRatio
                    },
                    first: first,
                    latest: latest
                });
                return [3 /*break*/, 5];
            case 4:
                error_6 = _k.sent();
                console.error('❌ Error fetching smart meter summary analytics:', error_6);
                res.status(500).json({ error: 'Failed to fetch summary analytics' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/smartmeter/:deviceId/analytics/series
 */
router.get('/:deviceId/analytics/series', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceId, fromValue, toValue, meterValue, bucketValue, fromDate, toDate, bucket, device, conditions, whereSql, latestForStaleness, rows, series, error_7;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                deviceId = req.params.deviceId;
                fromValue = getQueryString(req.query.from);
                toValue = getQueryString(req.query.to);
                meterValue = getQueryString(req.query.meter);
                bucketValue = getQueryString(req.query.bucket);
                fromDate = parseDateParam(fromValue);
                if (fromValue && !fromDate)
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid from date' })];
                toDate = parseDateParam(toValue);
                if (toValue && !toDate)
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid to date' })];
                bucket = parseBucket(bucketValue);
                if (!bucket)
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid bucket value' })];
                return [4 /*yield*/, prisma_1.prisma.device.findUnique({
                        where: { deviceId: deviceId },
                        select: { deviceId: true, deviceType: true }
                    })];
            case 1:
                device = _c.sent();
                if (!device)
                    return [2 /*return*/, res.status(404).json({ error: 'Device not found' })];
                if (device.deviceType !== 'SMART_METER')
                    return [2 /*return*/, res.status(400).json({ error: 'Not a smart meter device' })];
                conditions = [client_1.Prisma.sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\"deviceId\" = ", ""], ["\"deviceId\" = ", ""])), deviceId)];
                if (meterValue)
                    conditions.push(client_1.Prisma.sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\"meter\" = ", ""], ["\"meter\" = ", ""])), meterValue));
                if (fromDate)
                    conditions.push(client_1.Prisma.sql(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\"createdAt\" >= ", ""], ["\"createdAt\" >= ", ""])), fromDate));
                if (toDate)
                    conditions.push(client_1.Prisma.sql(templateObject_10 || (templateObject_10 = __makeTemplateObject(["\"createdAt\" <= ", ""], ["\"createdAt\" <= ", ""])), toDate));
                whereSql = client_1.Prisma.join(conditions, ' AND ');
                return [4 /*yield*/, prisma_1.prisma.smartMeterData.findFirst({
                        where: __assign({ deviceId: deviceId }, (meterValue ? { meter: meterValue } : {})),
                        orderBy: { createdAt: 'desc' },
                        select: { createdAt: true }
                    })];
            case 2:
                latestForStaleness = _c.sent();
                if (isSmartMeterDataStale(latestForStaleness === null || latestForStaleness === void 0 ? void 0 : latestForStaleness.createdAt)) {
                    return [2 /*return*/, res.json({
                            deviceId: deviceId,
                            meter: meterValue || null,
                            bucket: bucket,
                            range: {
                                from: fromDate ? fromDate.toISOString() : null,
                                to: toDate ? toDate.toISOString() : null
                            },
                            staleAfterSeconds: SMART_METER_STALE_SECONDS,
                            dataStale: true,
                            lastSavedAt: ((_a = latestForStaleness === null || latestForStaleness === void 0 ? void 0 : latestForStaleness.createdAt) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                            series: null
                        })];
                }
                return [4 /*yield*/, prisma_1.prisma.$queryRaw(client_1.Prisma.sql(templateObject_11 || (templateObject_11 = __makeTemplateObject(["\n      SELECT\n        date_trunc(", ", \"createdAt\") AS \"bucket\",\n        AVG(\"voltagePhase1\")    AS \"voltagePhase1Avg\",\n        AVG(\"voltageTotal\")     AS \"voltageTotalAvg\",\n        AVG(\"currentTotal\")     AS \"currentTotalAvg\",\n        AVG(\"powerFactorTotal\") AS \"powerFactorTotalAvg\",\n        AVG(\"powerTotalActive\") AS \"powerTotalActiveAvg\",\n        AVG(\"frequencyHz\")      AS \"frequencyHzAvg\",\n        AVG(CASE WHEN \"machine\" = true THEN 1 ELSE 0 END) AS \"machineOnRatio\",\n        COUNT(*)::int AS \"count\"\n      FROM \"SmartMeterData\"\n      WHERE ", "\n      GROUP BY 1\n      ORDER BY 1\n    "], ["\n      SELECT\n        date_trunc(", ", \"createdAt\") AS \"bucket\",\n        AVG(\"voltagePhase1\")    AS \"voltagePhase1Avg\",\n        AVG(\"voltageTotal\")     AS \"voltageTotalAvg\",\n        AVG(\"currentTotal\")     AS \"currentTotalAvg\",\n        AVG(\"powerFactorTotal\") AS \"powerFactorTotalAvg\",\n        AVG(\"powerTotalActive\") AS \"powerTotalActiveAvg\",\n        AVG(\"frequencyHz\")      AS \"frequencyHzAvg\",\n        AVG(CASE WHEN \"machine\" = true THEN 1 ELSE 0 END) AS \"machineOnRatio\",\n        COUNT(*)::int AS \"count\"\n      FROM \"SmartMeterData\"\n      WHERE ", "\n      GROUP BY 1\n      ORDER BY 1\n    "])), bucket, whereSql))];
            case 3:
                rows = _c.sent();
                series = rows.map(function (row) { return ({
                    bucket: row.bucket instanceof Date ? row.bucket.toISOString() : String(row.bucket),
                    count: Number(row.count),
                    averages: {
                        voltagePhase1: toNumber(row.voltagePhase1Avg),
                        voltageTotal: toNumber(row.voltageTotalAvg),
                        currentTotal: toNumber(row.currentTotalAvg),
                        powerFactorTotal: toNumber(row.powerFactorTotalAvg),
                        powerTotalActive: toNumber(row.powerTotalActiveAvg),
                        frequencyHz: toNumber(row.frequencyHzAvg)
                    },
                    machine: { onRatio: toNumber(row.machineOnRatio) }
                }); });
                res.json({
                    deviceId: deviceId,
                    meter: meterValue || null,
                    bucket: bucket,
                    range: {
                        from: fromDate ? fromDate.toISOString() : null,
                        to: toDate ? toDate.toISOString() : null
                    },
                    staleAfterSeconds: SMART_METER_STALE_SECONDS,
                    dataStale: false,
                    lastSavedAt: ((_b = latestForStaleness === null || latestForStaleness === void 0 ? void 0 : latestForStaleness.createdAt) === null || _b === void 0 ? void 0 : _b.toISOString()) || null,
                    series: series
                });
                return [3 /*break*/, 5];
            case 4:
                error_7 = _c.sent();
                console.error('❌ Error fetching smart meter series analytics:', error_7);
                res.status(500).json({ error: 'Failed to fetch series analytics' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/smartmeter/:deviceId/analytics/live
 */
router.get('/:deviceId/analytics/live', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceId, meterValue, prefixMatch, parameterPrefix, device, where, latest, snapshot, pickPhase, pickLast, voltagePhase1, voltagePhase2, voltagePhase3, voltageTotal, currentPhase1, currentPhase2, currentPhase3, currentTotal, powerPhase1, powerPhase2, powerPhase3, powerTotalActive, pfPhase1, pfPhase2, pfPhase3, pfTotal, roundTo, apparentPhase1, apparentPhase2, apparentPhase3, apparentFromPhases, apparentFromTotals, apparentPowerValue, reactiveFrom, reactivePhase1, reactivePhase2, reactivePhase3, reactiveFromPhases, reactivePowerValue, energyFromPower, live, prefixedParameters, error_8;
    var _a;
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11;
    return __generator(this, function (_12) {
        switch (_12.label) {
            case 0:
                _12.trys.push([0, 4, , 5]);
                deviceId = req.params.deviceId;
                meterValue = getQueryString(req.query.meter);
                prefixMatch = deviceId.match(/(\d{4})$/);
                parameterPrefix = (_b = prefixMatch === null || prefixMatch === void 0 ? void 0 : prefixMatch[1]) !== null && _b !== void 0 ? _b : deviceId.slice(-4);
                return [4 /*yield*/, prisma_1.prisma.device.findUnique({
                        where: { deviceId: deviceId },
                        select: { deviceId: true, deviceType: true }
                    })];
            case 1:
                device = _12.sent();
                if (!device)
                    return [2 /*return*/, res.status(404).json({ error: 'Device not found' })];
                if (device.deviceType !== 'SMART_METER')
                    return [2 /*return*/, res.status(400).json({ error: 'Not a smart meter device' })];
                where = { deviceId: deviceId };
                if (meterValue)
                    where.meter = meterValue;
                return [4 /*yield*/, prisma_1.prisma.smartMeterData.findFirst({
                        where: where,
                        orderBy: { createdAt: 'desc' }
                    })];
            case 2:
                latest = _12.sent();
                return [4 /*yield*/, (0, smartmeter_service_1.getSmartMeterLiveSnapshotStored)(deviceId)];
            case 3:
                snapshot = _12.sent();
                if (!latest || isSmartMeterDataStale(latest.createdAt)) {
                    return [2 /*return*/, res.json({
                            deviceId: deviceId,
                            meter: meterValue || null,
                            parameterPrefix: parameterPrefix,
                            staleAfterSeconds: SMART_METER_STALE_SECONDS,
                            dataStale: true,
                            lastSavedAt: ((_c = latest === null || latest === void 0 ? void 0 : latest.createdAt) === null || _c === void 0 ? void 0 : _c.toISOString()) || null,
                            prefixedParameters: buildNullPrefixedParameters(parameterPrefix)
                        })];
                }
                pickPhase = function (values, index) {
                    if (!values || values.length <= index)
                        return null;
                    var value = Number(values[index]);
                    return Number.isFinite(value) ? value : null;
                };
                pickLast = function (values) {
                    if (!values || values.length === 0)
                        return null;
                    var value = Number(values[values.length - 1]);
                    return Number.isFinite(value) ? value : null;
                };
                voltagePhase1 = (_e = (_d = pickPhase(snapshot === null || snapshot === void 0 ? void 0 : snapshot.voltagePhases, 0)) !== null && _d !== void 0 ? _d : latest.voltagePhase1) !== null && _e !== void 0 ? _e : null;
                voltagePhase2 = (_g = (_f = pickPhase(snapshot === null || snapshot === void 0 ? void 0 : snapshot.voltagePhases, 1)) !== null && _f !== void 0 ? _f : latest.voltagePhase2) !== null && _g !== void 0 ? _g : null;
                voltagePhase3 = (_j = (_h = pickPhase(snapshot === null || snapshot === void 0 ? void 0 : snapshot.voltagePhases, 2)) !== null && _h !== void 0 ? _h : latest.voltagePhase3) !== null && _j !== void 0 ? _j : null;
                voltageTotal = (_l = (_k = pickLast(snapshot === null || snapshot === void 0 ? void 0 : snapshot.voltagePhases)) !== null && _k !== void 0 ? _k : latest.voltageTotal) !== null && _l !== void 0 ? _l : null;
                currentPhase1 = (_o = (_m = pickPhase(snapshot === null || snapshot === void 0 ? void 0 : snapshot.currentPhases, 0)) !== null && _m !== void 0 ? _m : latest.currentPhase1) !== null && _o !== void 0 ? _o : null;
                currentPhase2 = (_q = (_p = pickPhase(snapshot === null || snapshot === void 0 ? void 0 : snapshot.currentPhases, 1)) !== null && _p !== void 0 ? _p : latest.currentPhase2) !== null && _q !== void 0 ? _q : null;
                currentPhase3 = (_s = (_r = pickPhase(snapshot === null || snapshot === void 0 ? void 0 : snapshot.currentPhases, 2)) !== null && _r !== void 0 ? _r : latest.currentPhase3) !== null && _s !== void 0 ? _s : null;
                currentTotal = (_u = (_t = pickLast(snapshot === null || snapshot === void 0 ? void 0 : snapshot.currentPhases)) !== null && _t !== void 0 ? _t : latest.currentTotal) !== null && _u !== void 0 ? _u : null;
                powerPhase1 = (_w = (_v = pickPhase(snapshot === null || snapshot === void 0 ? void 0 : snapshot.powerPhases, 0)) !== null && _v !== void 0 ? _v : latest.powerPhase1) !== null && _w !== void 0 ? _w : null;
                powerPhase2 = (_y = (_x = pickPhase(snapshot === null || snapshot === void 0 ? void 0 : snapshot.powerPhases, 1)) !== null && _x !== void 0 ? _x : latest.powerPhase2) !== null && _y !== void 0 ? _y : null;
                powerPhase3 = (_0 = (_z = pickPhase(snapshot === null || snapshot === void 0 ? void 0 : snapshot.powerPhases, 2)) !== null && _z !== void 0 ? _z : latest.powerPhase3) !== null && _0 !== void 0 ? _0 : null;
                powerTotalActive = (_2 = (_1 = pickLast(snapshot === null || snapshot === void 0 ? void 0 : snapshot.powerPhases)) !== null && _1 !== void 0 ? _1 : latest.powerTotalActive) !== null && _2 !== void 0 ? _2 : null;
                pfPhase1 = (_4 = (_3 = pickPhase(snapshot === null || snapshot === void 0 ? void 0 : snapshot.powerFactorPhases, 0)) !== null && _3 !== void 0 ? _3 : latest.powerFactorPhase1) !== null && _4 !== void 0 ? _4 : null;
                pfPhase2 = (_6 = (_5 = pickPhase(snapshot === null || snapshot === void 0 ? void 0 : snapshot.powerFactorPhases, 1)) !== null && _5 !== void 0 ? _5 : latest.powerFactorPhase2) !== null && _6 !== void 0 ? _6 : null;
                pfPhase3 = (_8 = (_7 = pickPhase(snapshot === null || snapshot === void 0 ? void 0 : snapshot.powerFactorPhases, 2)) !== null && _7 !== void 0 ? _7 : latest.powerFactorPhase3) !== null && _8 !== void 0 ? _8 : null;
                pfTotal = (_10 = (_9 = pickLast(snapshot === null || snapshot === void 0 ? void 0 : snapshot.powerFactorPhases)) !== null && _9 !== void 0 ? _9 : latest.powerFactorTotal) !== null && _10 !== void 0 ? _10 : null;
                roundTo = function (value, decimals) {
                    if (value === null || !Number.isFinite(value))
                        return null;
                    var scale = Math.pow(10, decimals);
                    return Math.round(value * scale) / scale;
                };
                apparentPhase1 = voltagePhase1 !== null && currentPhase1 !== null ? Math.abs(voltagePhase1 * currentPhase1) : null;
                apparentPhase2 = voltagePhase2 !== null && currentPhase2 !== null ? Math.abs(voltagePhase2 * currentPhase2) : null;
                apparentPhase3 = voltagePhase3 !== null && currentPhase3 !== null ? Math.abs(voltagePhase3 * currentPhase3) : null;
                apparentFromPhases = [apparentPhase1, apparentPhase2, apparentPhase3]
                    .filter(function (v) { return v !== null; })
                    .reduce(function (sum, v) { return sum + v; }, 0);
                apparentFromTotals = voltageTotal !== null && currentTotal !== null ? Math.abs(voltageTotal * currentTotal) : null;
                apparentPowerValue = apparentFromPhases > 0 ? apparentFromPhases : apparentFromTotals;
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
                reactivePowerValue = reactiveFromPhases > 0
                    ? reactiveFromPhases
                    : reactiveFrom(apparentPowerValue, powerTotalActive);
                energyFromPower = function (activePower) {
                    return activePower === null ? null : Math.abs(activePower) / 1000;
                };
                live = {
                    timestamp: latest.createdAt,
                    status: connectivityStatusFromFreshness(latest.createdAt),
                    machine: latest.machine,
                    fault: latest.fault,
                    temperatureC: latest.temperatureC,
                    frequencyHz: latest.frequencyHz,
                    voltage: {
                        phase1: voltagePhase1,
                        phase2: voltagePhase2,
                        phase3: voltagePhase3,
                        total: voltageTotal
                    },
                    current: {
                        phase1: currentPhase1,
                        phase2: currentPhase2,
                        phase3: currentPhase3,
                        total: currentTotal
                    },
                    power: {
                        phase1: powerPhase1,
                        phase2: powerPhase2,
                        phase3: powerPhase3,
                        totalActive: powerTotalActive
                    },
                    powerFactor: {
                        phase1: pfPhase1,
                        phase2: pfPhase2,
                        phase3: pfPhase3,
                        total: pfTotal
                    },
                    energyConsumption: {
                        phaseR: roundTo(energyFromPower(powerPhase1), 3),
                        phaseY: roundTo(energyFromPower(powerPhase2), 3),
                        phaseB: roundTo(energyFromPower(powerPhase3), 3),
                        total3Phase: roundTo((_11 = energyFromPower(powerTotalActive)) !== null && _11 !== void 0 ? _11 : [powerPhase1, powerPhase2, powerPhase3]
                            .filter(function (v) { return v !== null; })
                            .reduce(function (sum, p) { return sum + Math.abs(p) / 1000; }, 0), 3)
                    },
                    additional: {
                        reactivePower: roundTo(reactivePowerValue, 2),
                        apparentPower: roundTo(apparentPowerValue, 2),
                        frequencyHz: latest.frequencyHz,
                        temperatureC: latest.temperatureC
                    }
                };
                prefixedParameters = (_a = {},
                    _a["".concat(parameterPrefix, "_timestamp")] = live.timestamp,
                    _a["".concat(parameterPrefix, "_status")] = live.status,
                    _a["".concat(parameterPrefix, "_machine")] = live.machine,
                    _a["".concat(parameterPrefix, "_fault")] = live.fault,
                    _a["".concat(parameterPrefix, "_temperatureC")] = live.temperatureC,
                    _a["".concat(parameterPrefix, "_frequencyHz")] = live.frequencyHz,
                    _a["".concat(parameterPrefix, "_voltage_phase1")] = live.voltage.phase1,
                    _a["".concat(parameterPrefix, "_voltage_phase2")] = live.voltage.phase2,
                    _a["".concat(parameterPrefix, "_voltage_phase3")] = live.voltage.phase3,
                    _a["".concat(parameterPrefix, "_voltage_total")] = live.voltage.total,
                    _a["".concat(parameterPrefix, "_current_phase1")] = live.current.phase1,
                    _a["".concat(parameterPrefix, "_current_phase2")] = live.current.phase2,
                    _a["".concat(parameterPrefix, "_current_phase3")] = live.current.phase3,
                    _a["".concat(parameterPrefix, "_current_total")] = live.current.total,
                    _a["".concat(parameterPrefix, "_power_phase1")] = live.power.phase1,
                    _a["".concat(parameterPrefix, "_power_phase2")] = live.power.phase2,
                    _a["".concat(parameterPrefix, "_power_phase3")] = live.power.phase3,
                    _a["".concat(parameterPrefix, "_power_totalActive")] = live.power.totalActive,
                    _a["".concat(parameterPrefix, "_powerFactor_phase1")] = live.powerFactor.phase1,
                    _a["".concat(parameterPrefix, "_powerFactor_phase2")] = live.powerFactor.phase2,
                    _a["".concat(parameterPrefix, "_powerFactor_phase3")] = live.powerFactor.phase3,
                    _a["".concat(parameterPrefix, "_powerFactor_total")] = live.powerFactor.total,
                    _a["".concat(parameterPrefix, "_energy_phaseR_kWh")] = live.energyConsumption.phaseR,
                    _a["".concat(parameterPrefix, "_energy_phaseY_kWh")] = live.energyConsumption.phaseY,
                    _a["".concat(parameterPrefix, "_energy_phaseB_kWh")] = live.energyConsumption.phaseB,
                    _a["".concat(parameterPrefix, "_energy_total3Phase_kWh")] = live.energyConsumption.total3Phase,
                    _a["".concat(parameterPrefix, "_reactivePower_var")] = live.additional.reactivePower,
                    _a["".concat(parameterPrefix, "_apparentPower_VA")] = live.additional.apparentPower,
                    _a);
                res.json({
                    deviceId: deviceId,
                    meter: latest.meter || (snapshot === null || snapshot === void 0 ? void 0 : snapshot.meter) || meterValue || null,
                    parameterPrefix: parameterPrefix,
                    staleAfterSeconds: SMART_METER_STALE_SECONDS,
                    dataStale: false,
                    lastSavedAt: latest.createdAt.toISOString(),
                    prefixedParameters: prefixedParameters
                });
                return [3 /*break*/, 5];
            case 4:
                error_8 = _12.sent();
                console.error('❌ Error fetching smart meter live analytics:', error_8);
                res.status(500).json({ error: 'Failed to fetch live analytics' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/smartmeter/:deviceId/analytics/trend
 */
router.get('/:deviceId/analytics/trend', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceId, minutesValue, meterValue, bucketValue, minutes, bucket, device, now, fromDate, conditions, whereSql, latestForStaleness, rows, series, error_9;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                deviceId = req.params.deviceId;
                minutesValue = getQueryString(req.query.minutes);
                meterValue = getQueryString(req.query.meter);
                bucketValue = getQueryString(req.query.bucket);
                minutes = parsePositiveInt(minutesValue, 120, 10080);
                if (minutesValue && !minutes)
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid minutes value' })];
                bucket = bucketValue ? parseBucket(bucketValue) : 'minute';
                if (!bucket)
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid bucket value' })];
                return [4 /*yield*/, prisma_1.prisma.device.findUnique({
                        where: { deviceId: deviceId },
                        select: { deviceId: true, deviceType: true }
                    })];
            case 1:
                device = _c.sent();
                if (!device)
                    return [2 /*return*/, res.status(404).json({ error: 'Device not found' })];
                if (device.deviceType !== 'SMART_METER')
                    return [2 /*return*/, res.status(400).json({ error: 'Not a smart meter device' })];
                now = new Date();
                fromDate = new Date(now.getTime() - (minutes !== null && minutes !== void 0 ? minutes : 120) * 60 * 1000);
                conditions = [
                    client_1.Prisma.sql(templateObject_12 || (templateObject_12 = __makeTemplateObject(["\"deviceId\" = ", ""], ["\"deviceId\" = ", ""])), deviceId),
                    client_1.Prisma.sql(templateObject_13 || (templateObject_13 = __makeTemplateObject(["\"createdAt\" >= ", ""], ["\"createdAt\" >= ", ""])), fromDate),
                    client_1.Prisma.sql(templateObject_14 || (templateObject_14 = __makeTemplateObject(["\"createdAt\" <= ", ""], ["\"createdAt\" <= ", ""])), now)
                ];
                if (meterValue)
                    conditions.push(client_1.Prisma.sql(templateObject_15 || (templateObject_15 = __makeTemplateObject(["\"meter\" = ", ""], ["\"meter\" = ", ""])), meterValue));
                whereSql = client_1.Prisma.join(conditions, ' AND ');
                return [4 /*yield*/, prisma_1.prisma.smartMeterData.findFirst({
                        where: __assign({ deviceId: deviceId }, (meterValue ? { meter: meterValue } : {})),
                        orderBy: { createdAt: 'desc' },
                        select: { createdAt: true }
                    })];
            case 2:
                latestForStaleness = _c.sent();
                if (isSmartMeterDataStale(latestForStaleness === null || latestForStaleness === void 0 ? void 0 : latestForStaleness.createdAt)) {
                    return [2 /*return*/, res.json({
                            deviceId: deviceId,
                            meter: meterValue || null,
                            bucket: bucket,
                            minutes: minutes,
                            range: {
                                from: fromDate.toISOString(),
                                to: now.toISOString()
                            },
                            staleAfterSeconds: SMART_METER_STALE_SECONDS,
                            dataStale: true,
                            lastSavedAt: ((_a = latestForStaleness === null || latestForStaleness === void 0 ? void 0 : latestForStaleness.createdAt) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                            series: null
                        })];
                }
                return [4 /*yield*/, prisma_1.prisma.$queryRaw(client_1.Prisma.sql(templateObject_16 || (templateObject_16 = __makeTemplateObject(["\n      SELECT\n        date_trunc(", ", \"createdAt\") AS \"bucket\",\n        AVG(\"voltagePhase1\")    AS \"voltagePhase1Avg\",\n        AVG(\"voltageTotal\")     AS \"voltageTotalAvg\",\n        AVG(\"currentTotal\")     AS \"currentTotalAvg\",\n        AVG(\"powerFactorTotal\") AS \"powerFactorTotalAvg\",\n        AVG(\"powerTotalActive\") AS \"powerTotalActiveAvg\",\n        AVG(\"frequencyHz\")      AS \"frequencyHzAvg\",\n        AVG(CASE WHEN \"machine\" = true THEN 1 ELSE 0 END) AS \"machineOnRatio\",\n        COUNT(*)::int AS \"count\"\n      FROM \"SmartMeterData\"\n      WHERE ", "\n      GROUP BY 1\n      ORDER BY 1\n    "], ["\n      SELECT\n        date_trunc(", ", \"createdAt\") AS \"bucket\",\n        AVG(\"voltagePhase1\")    AS \"voltagePhase1Avg\",\n        AVG(\"voltageTotal\")     AS \"voltageTotalAvg\",\n        AVG(\"currentTotal\")     AS \"currentTotalAvg\",\n        AVG(\"powerFactorTotal\") AS \"powerFactorTotalAvg\",\n        AVG(\"powerTotalActive\") AS \"powerTotalActiveAvg\",\n        AVG(\"frequencyHz\")      AS \"frequencyHzAvg\",\n        AVG(CASE WHEN \"machine\" = true THEN 1 ELSE 0 END) AS \"machineOnRatio\",\n        COUNT(*)::int AS \"count\"\n      FROM \"SmartMeterData\"\n      WHERE ", "\n      GROUP BY 1\n      ORDER BY 1\n    "])), bucket, whereSql))];
            case 3:
                rows = _c.sent();
                series = rows.map(function (row) { return ({
                    bucket: row.bucket instanceof Date ? row.bucket.toISOString() : String(row.bucket),
                    count: Number(row.count),
                    averages: {
                        voltagePhase1: toNumber(row.voltagePhase1Avg),
                        voltageTotal: toNumber(row.voltageTotalAvg),
                        currentTotal: toNumber(row.currentTotalAvg),
                        powerFactorTotal: toNumber(row.powerFactorTotalAvg),
                        powerTotalActive: toNumber(row.powerTotalActiveAvg),
                        frequencyHz: toNumber(row.frequencyHzAvg)
                    },
                    machine: { onRatio: toNumber(row.machineOnRatio) }
                }); });
                res.json({
                    deviceId: deviceId,
                    meter: meterValue || null,
                    bucket: bucket,
                    minutes: minutes,
                    range: {
                        from: fromDate.toISOString(),
                        to: now.toISOString()
                    },
                    staleAfterSeconds: SMART_METER_STALE_SECONDS,
                    dataStale: false,
                    lastSavedAt: ((_b = latestForStaleness === null || latestForStaleness === void 0 ? void 0 : latestForStaleness.createdAt) === null || _b === void 0 ? void 0 : _b.toISOString()) || null,
                    series: series
                });
                return [3 /*break*/, 5];
            case 4:
                error_9 = _c.sent();
                console.error('❌ Error fetching smart meter trend analytics:', error_9);
                res.status(500).json({ error: 'Failed to fetch trend analytics' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/smartmeter/:deviceId/data
 */
router.get('/:deviceId/data', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceId, _a, limit, device, latestForStaleness, data, dataWithConnectivityStatus, error_10;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 4, , 5]);
                deviceId = req.params.deviceId;
                _a = req.query.limit, limit = _a === void 0 ? '10' : _a;
                return [4 /*yield*/, prisma_1.prisma.device.findUnique({
                        where: { deviceId: deviceId },
                        select: { deviceId: true, deviceType: true }
                    })];
            case 1:
                device = _d.sent();
                if (!device)
                    return [2 /*return*/, res.status(404).json({ error: 'Device not found' })];
                if (device.deviceType !== 'SMART_METER')
                    return [2 /*return*/, res.status(400).json({ error: 'Not a smart meter device' })];
                return [4 /*yield*/, prisma_1.prisma.smartMeterData.findFirst({
                        where: { deviceId: deviceId },
                        orderBy: { createdAt: 'desc' },
                        select: { createdAt: true }
                    })];
            case 2:
                latestForStaleness = _d.sent();
                if (isSmartMeterDataStale(latestForStaleness === null || latestForStaleness === void 0 ? void 0 : latestForStaleness.createdAt)) {
                    return [2 /*return*/, res.json({
                            deviceId: device.deviceId,
                            staleAfterSeconds: SMART_METER_STALE_SECONDS,
                            dataStale: true,
                            lastSavedAt: ((_b = latestForStaleness === null || latestForStaleness === void 0 ? void 0 : latestForStaleness.createdAt) === null || _b === void 0 ? void 0 : _b.toISOString()) || null,
                            data: [buildNullSmartMeterData()]
                        })];
                }
                return [4 /*yield*/, prisma_1.prisma.smartMeterData.findMany({
                        where: { deviceId: deviceId },
                        orderBy: { createdAt: 'desc' },
                        take: parseInt(limit)
                    })];
            case 3:
                data = _d.sent();
                dataWithConnectivityStatus = data.map(function (row) { return (__assign(__assign({}, row), { status: connectivityStatusFromFreshness(row.createdAt) })); });
                res.json({
                    deviceId: device.deviceId,
                    staleAfterSeconds: SMART_METER_STALE_SECONDS,
                    dataStale: false,
                    lastSavedAt: ((_c = latestForStaleness === null || latestForStaleness === void 0 ? void 0 : latestForStaleness.createdAt) === null || _c === void 0 ? void 0 : _c.toISOString()) || null,
                    data: dataWithConnectivityStatus
                });
                return [3 /*break*/, 5];
            case 4:
                error_10 = _d.sent();
                console.error('❌ Error fetching smart meter data:', error_10);
                res.status(500).json({ error: 'Failed to fetch data' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/smartmeter/:deviceId/settings
 */
router.get('/:deviceId/settings', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceId, device, settings, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                deviceId = req.params.deviceId;
                return [4 /*yield*/, prisma_1.prisma.device.findUnique({
                        where: { deviceId: deviceId },
                        select: { deviceId: true, deviceType: true }
                    })];
            case 1:
                device = _a.sent();
                if (!device)
                    return [2 /*return*/, res.status(404).json({ error: 'Device not found' })];
                if (device.deviceType !== 'SMART_METER')
                    return [2 /*return*/, res.status(400).json({ error: 'Not a smart meter device' })];
                return [4 /*yield*/, prisma_1.prisma.smartMeterSettings.findUnique({
                        where: { deviceId: deviceId }
                    })];
            case 2:
                settings = _a.sent();
                res.json({ deviceId: device.deviceId, settings: settings || null });
                return [3 /*break*/, 4];
            case 3:
                error_11 = _a.sent();
                console.error('❌ Error fetching smart meter settings:', error_11);
                res.status(500).json({ error: 'Failed to fetch settings' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/smartmeter/:deviceId/latest
 */
router.get('/:deviceId/latest', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceId, device, latestData, dataStale, latestDataResponse, settings, error_12;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                deviceId = req.params.deviceId;
                return [4 /*yield*/, prisma_1.prisma.device.findUnique({
                        where: { deviceId: deviceId },
                        select: {
                            deviceId: true,
                            deviceType: true,
                            ipAddress: true,
                            firmwareVersion: true
                        }
                    })];
            case 1:
                device = _b.sent();
                if (!device)
                    return [2 /*return*/, res.status(404).json({ error: 'Device not found' })];
                if (device.deviceType !== 'SMART_METER')
                    return [2 /*return*/, res.status(400).json({ error: 'Not a smart meter device' })];
                return [4 /*yield*/, prisma_1.prisma.smartMeterData.findFirst({
                        where: { deviceId: deviceId },
                        orderBy: { createdAt: 'desc' }
                    })];
            case 2:
                latestData = _b.sent();
                dataStale = isSmartMeterDataStale(latestData === null || latestData === void 0 ? void 0 : latestData.createdAt);
                latestDataResponse = latestData && !dataStale
                    ? __assign(__assign({}, latestData), { status: connectivityStatusFromFreshness(latestData.createdAt) }) : buildNullSmartMeterData();
                return [4 /*yield*/, prisma_1.prisma.smartMeterSettings.findUnique({
                        where: { deviceId: deviceId }
                    })];
            case 3:
                settings = _b.sent();
                res.json({
                    device: {
                        deviceId: device.deviceId,
                        deviceType: device.deviceType,
                        ipAddress: device.ipAddress,
                        firmwareVersion: device.firmwareVersion
                    },
                    staleAfterSeconds: SMART_METER_STALE_SECONDS,
                    dataStale: dataStale,
                    lastSavedAt: ((_a = latestData === null || latestData === void 0 ? void 0 : latestData.createdAt) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                    latestData: latestDataResponse,
                    settings: settings || null
                });
                return [3 /*break*/, 5];
            case 4:
                error_12 = _b.sent();
                console.error('❌ Error fetching latest smart meter data:', error_12);
                res.status(500).json({ error: 'Failed to fetch data' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16;

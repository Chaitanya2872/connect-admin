"use strict";
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
var prisma_1 = require("../db/prisma");
var router = (0, express_1.Router)();
/**
 * GET /api/devices
 * Get all devices
 */
router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var devices, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma_1.prisma.device.findMany({
                        orderBy: { createdAt: 'desc' }
                    })];
            case 1:
                devices = _a.sent();
                res.json(devices);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error fetching devices:', error_1);
                res.status(500).json({ error: 'Failed to fetch devices' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/devices/:deviceId
 * Get single device by deviceId
 */
router.get('/:deviceId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var device, switches, latestClimate, latestEnergy, latestHealth, smartMeterData, smartMeterSettings, deviceWithRelations, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 9, , 10]);
                return [4 /*yield*/, prisma_1.prisma.device.findUnique({
                        where: { deviceId: req.params.deviceId }
                    })];
            case 1:
                device = _a.sent();
                if (!device) {
                    return [2 /*return*/, res.status(404).json({ error: 'Device not found' })];
                }
                return [4 /*yield*/, prisma_1.prisma.deviceSwitch.findMany({
                        where: { deviceId: req.params.deviceId }
                    })];
            case 2:
                switches = _a.sent();
                return [4 /*yield*/, prisma_1.prisma.deviceClimate.findFirst({
                        where: { deviceId: req.params.deviceId },
                        orderBy: { createdAt: 'desc' }
                    })];
            case 3:
                latestClimate = _a.sent();
                return [4 /*yield*/, prisma_1.prisma.deviceEnergy.findFirst({
                        where: { deviceId: req.params.deviceId },
                        orderBy: { createdAt: 'desc' }
                    })];
            case 4:
                latestEnergy = _a.sent();
                return [4 /*yield*/, prisma_1.prisma.deviceHealth.findFirst({
                        where: { deviceId: req.params.deviceId },
                        orderBy: { createdAt: 'desc' }
                    })
                    // Smart meter specific data
                ];
            case 5:
                latestHealth = _a.sent();
                smartMeterData = null;
                smartMeterSettings = null;
                if (!(device.deviceType === 'SMART_METER')) return [3 /*break*/, 8];
                return [4 /*yield*/, prisma_1.prisma.smartMeterData.findFirst({
                        where: { deviceId: req.params.deviceId },
                        orderBy: { createdAt: 'desc' }
                    })];
            case 6:
                smartMeterData = _a.sent();
                return [4 /*yield*/, prisma_1.prisma.smartMeterSettings.findUnique({
                        where: { deviceId: req.params.deviceId }
                    })];
            case 7:
                smartMeterSettings = _a.sent();
                _a.label = 8;
            case 8:
                deviceWithRelations = __assign(__assign(__assign({}, device), { switches: switches, climate: latestClimate, energy: latestEnergy, health: latestHealth }), (device.deviceType === 'SMART_METER' && {
                    smartMeterData: smartMeterData,
                    smartMeterSettings: smartMeterSettings
                }));
                res.json(deviceWithRelations);
                return [3 /*break*/, 10];
            case 9:
                error_2 = _a.sent();
                console.error('Error fetching device:', error_2);
                res.status(500).json({ error: 'Failed to fetch device' });
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/devices
 * Add new device
 */
router.post('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, deviceId, deviceType, thingId, validTypes, existing, device, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, deviceId = _a.deviceId, deviceType = _a.deviceType, thingId = _a.thingId;
                if (!deviceId || !deviceType || !thingId) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'deviceId, deviceType, and thingId are required'
                        })];
                }
                validTypes = ['SINGLE', 'SWITCH_4CH', 'DONGLE_2CH', 'SMART_METER'];
                if (!validTypes.includes(deviceType)) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'Invalid deviceType. Must be SINGLE, SWITCH_4CH, DONGLE_2CH, or SMART_METER'
                        })];
                }
                return [4 /*yield*/, prisma_1.prisma.device.findUnique({
                        where: { deviceId: deviceId }
                    })];
            case 1:
                existing = _b.sent();
                if (existing) {
                    return [2 /*return*/, res.status(409).json({ error: 'Device already exists' })];
                }
                return [4 /*yield*/, prisma_1.prisma.device.create({
                        data: {
                            deviceId: deviceId,
                            deviceType: deviceType,
                            thingId: thingId
                        }
                    })];
            case 2:
                device = _b.sent();
                console.log("\u2705 Device created: ".concat(deviceId, " (").concat(deviceType, ")"));
                res.status(201).json(device);
                return [3 /*break*/, 4];
            case 3:
                error_3 = _b.sent();
                console.error('Error creating device:', error_3);
                res.status(500).json({ error: 'Failed to create device' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * DELETE /api/devices/:deviceId
 * Delete device
 */
router.delete('/:deviceId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var device, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, prisma_1.prisma.device.findUnique({
                        where: { deviceId: req.params.deviceId }
                    })];
            case 1:
                device = _a.sent();
                if (!device) {
                    return [2 /*return*/, res.status(404).json({ error: 'Device not found' })];
                }
                if (!(device.deviceType === 'SMART_METER')) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma_1.prisma.smartMeterSettings.deleteMany({
                        where: { deviceId: req.params.deviceId }
                    })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [4 /*yield*/, prisma_1.prisma.device.delete({
                    where: { deviceId: req.params.deviceId }
                })];
            case 4:
                _a.sent();
                console.log("\uD83D\uDDD1\uFE0F Device deleted: ".concat(req.params.deviceId));
                res.json({ success: true, message: 'Device deleted' });
                return [3 /*break*/, 6];
            case 5:
                error_4 = _a.sent();
                console.error('Error deleting device:', error_4);
                res.status(500).json({ error: 'Failed to delete device' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
exports.default = router;

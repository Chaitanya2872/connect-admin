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
var express_1 = require("express");
var publishers_1 = require("../mqtt/publishers");
var prisma_1 = require("../db/prisma");
var router = (0, express_1.Router)();
/**
 * POST /api/dongle/:thingId/config
 * Configure dongle WiFi and communication settings
 */
router.post('/:thingId/config', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var thingId, _a, deviceid, ssid, password, access_token, secret, mode, ota_host, payload;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                thingId = req.params.thingId;
                _a = req.body, deviceid = _a.deviceid, ssid = _a.ssid, password = _a.password, access_token = _a.access_token, secret = _a.secret, mode = _a.mode, ota_host = _a.ota_host;
                if (!deviceid || !ssid || !password) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'deviceid, ssid and password are required'
                        })];
                }
                payload = {
                    deviceid: deviceid,
                    ssid: ssid,
                    password: password,
                    access_token: access_token || '',
                    secret: secret || '',
                    mode: mode || '1', // 1=WiFi, 2=BLE, 3=custom
                    ota_host: ota_host || ''
                };
                return [4 /*yield*/, (0, publishers_1.publishToDevice)(thingId, 'config', payload)];
            case 1:
                _b.sent();
                res.json({ success: true });
                return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/dongle/:thingId/setting
 * Configure channel settings (childlock, etc.)
 */
router.post('/:thingId/setting', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var thingId, _a, deviceid, channel, switch_no, childlock, payload;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                thingId = req.params.thingId;
                _a = req.body, deviceid = _a.deviceid, channel = _a.channel, switch_no = _a.switch_no, childlock = _a.childlock;
                if (!deviceid || !channel || !switch_no) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'deviceid, channel and switch_no are required'
                        })];
                }
                payload = {
                    deviceid: deviceid,
                    channel: channel.toString(),
                    switch_no: switch_no.toString(),
                    childlock: childlock || ''
                };
                return [4 /*yield*/, (0, publishers_1.publishToDevice)(thingId, 'setting', payload)];
            case 1:
                _b.sent();
                res.json({ success: true });
                return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/dongle/:thingId/reset
 * Reset device to default settings
 */
router.post('/:thingId/reset', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var thingId, _a, deviceid, mode, secret, payload;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                thingId = req.params.thingId;
                _a = req.body, deviceid = _a.deviceid, mode = _a.mode, secret = _a.secret;
                if (!deviceid) {
                    return [2 /*return*/, res.status(400).json({ error: 'deviceid is required' })];
                }
                payload = {
                    deviceid: deviceid,
                    mode: mode || '1',
                    secret: secret || ''
                };
                return [4 /*yield*/, (0, publishers_1.publishToDevice)(thingId, 'reset', payload)];
            case 1:
                _b.sent();
                res.json({ success: true });
                return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/dongle/:thingId/alive
 * Request alive status from device
 */
router.post('/:thingId/alive', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var thingId, deviceid;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                thingId = req.params.thingId;
                deviceid = req.body.deviceid;
                if (!deviceid) {
                    return [2 /*return*/, res.status(400).json({ error: 'deviceid is required' })];
                }
                return [4 /*yield*/, (0, publishers_1.publishToDevice)(thingId, 'alive', { deviceid: deviceid })];
            case 1:
                _a.sent();
                res.json({ success: true });
                return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/dongle/:deviceId/channels
 * Get channel configuration for a dongle device
 */
router.get('/:deviceId/channels', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceId, device;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                deviceId = req.params.deviceId;
                return [4 /*yield*/, prisma_1.prisma.device.findUnique({
                        where: { deviceId: deviceId },
                        select: {
                            deviceId: true,
                            deviceType: true,
                            channels: true
                        }
                    })];
            case 1:
                device = _a.sent();
                if (!device) {
                    return [2 /*return*/, res.status(404).json({ error: 'Device not found' })];
                }
                if (device.deviceType !== 'DONGLE_2CH') {
                    return [2 /*return*/, res.status(400).json({ error: 'Not a dongle device' })];
                }
                res.json({
                    deviceId: device.deviceId,
                    channels: device.channels || null
                });
                return [2 /*return*/];
        }
    });
}); });
exports.default = router;

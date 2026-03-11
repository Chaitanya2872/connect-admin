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
 * POST /api/device/:thingId/control
 *
 * Universal control endpoint for ALL device types
 *
 * Body examples:
 *
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
 *
 * DONGLE_2CH:
 * {
 *   "deviceId": "IOTIQDC2_A1025022",
 *   "channel": 1,
 *   "switchNo": "S1",
 *   "status": "on"
 * }
 */
router.post('/:thingId/control', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var thingId, _a, deviceId, status_1, switchNo, channel, device, payload, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                thingId = req.params.thingId;
                _a = req.body, deviceId = _a.deviceId, status_1 = _a.status, switchNo = _a.switchNo, channel = _a.channel;
                if (!deviceId || !status_1) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ error: 'deviceId and status are required' })];
                }
                return [4 /*yield*/, prisma_1.prisma.device.findUnique({
                        where: { deviceId: deviceId },
                        select: {
                            deviceId: true,
                            deviceType: true,
                            thingId: true
                        }
                    })];
            case 1:
                device = _b.sent();
                if (!device) {
                    return [2 /*return*/, res.status(404).json({ error: 'Device not found' })];
                }
                payload = {
                    deviceid: deviceId,
                    status: status_1
                };
                if (device.deviceType === 'SWITCH_4CH') {
                    if (!switchNo) {
                        return [2 /*return*/, res
                                .status(400)
                                .json({ error: 'switchNo required for 4CH device' })];
                    }
                    payload.switch_no = "S".concat(switchNo);
                }
                if (device.deviceType === 'DONGLE_2CH') {
                    if (!channel || !switchNo) {
                        return [2 /*return*/, res
                                .status(400)
                                .json({ error: 'channel and switchNo required for dongle device' })];
                    }
                    payload.channel = channel.toString();
                    payload.switch_no = switchNo; // Already formatted like "S1", "F1", etc.
                }
                // Publish MQTT command
                return [4 /*yield*/, (0, publishers_1.publishToDevice)(thingId, 'control', payload)];
            case 2:
                // Publish MQTT command
                _b.sent();
                console.log("\uD83C\uDF9B\uFE0F  Control sent: ".concat(deviceId, " (").concat(device.deviceType, ") -> ").concat(status_1));
                res.json({ success: true });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                console.error('❌ Control error:', error_1);
                res.status(500).json({ error: 'Control command failed' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = router;

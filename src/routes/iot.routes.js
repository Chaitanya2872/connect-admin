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
var iot_provisioning_service_1 = require("../services/iot-provisioning.service");
var router = (0, express_1.Router)();
router.post('/things/provision', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, thingName, policyName, attributes, s3Prefix, invalidEntry, result, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body || {}, thingName = _a.thingName, policyName = _a.policyName, attributes = _a.attributes, s3Prefix = _a.s3Prefix;
                if (!thingName || typeof thingName !== 'string') {
                    return [2 /*return*/, res.status(400).json({ error: 'thingName is required' })];
                }
                if (policyName !== undefined && typeof policyName !== 'string') {
                    return [2 /*return*/, res.status(400).json({ error: 'policyName must be a string' })];
                }
                if (attributes !== undefined &&
                    (typeof attributes !== 'object' || Array.isArray(attributes) || attributes === null)) {
                    return [2 /*return*/, res.status(400).json({ error: 'attributes must be an object of string values' })];
                }
                if (s3Prefix !== undefined && typeof s3Prefix !== 'string') {
                    return [2 /*return*/, res.status(400).json({ error: 's3Prefix must be a string' })];
                }
                if (attributes) {
                    invalidEntry = Object.entries(attributes).find(function (_a) {
                        var key = _a[0], value = _a[1];
                        return typeof key !== 'string' || typeof value !== 'string';
                    });
                    if (invalidEntry) {
                        return [2 /*return*/, res.status(400).json({ error: 'attributes must contain only string values' })];
                    }
                }
                return [4 /*yield*/, (0, iot_provisioning_service_1.provisionThingAndStoreCertificates)({
                        thingName: thingName,
                        policyName: policyName,
                        attributes: attributes,
                        s3Prefix: s3Prefix
                    })];
            case 1:
                result = _b.sent();
                return [2 /*return*/, res.status(201).json(__assign({ success: true }, result))];
            case 2:
                error_1 = _b.sent();
                console.error('Provisioning failed:', error_1);
                return [2 /*return*/, res.status(500).json({
                        error: error_1 instanceof Error ? error_1.message : 'Failed to provision thing'
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publishers_1 = require("../mqtt/publishers");
const crypto = __importStar(require("crypto"));
const router = (0, express_1.Router)();
router.post('/:thingId/init', async (req, res) => {
    try {
        const { deviceid, url, ota_version } = req.body;
        if (!deviceid || !url || !ota_version) {
            return res.status(400).json({
                error: 'deviceid, url and ota_version are required'
            });
        }
        const transactionId = crypto.randomUUID();
        await (0, publishers_1.publishToDevice)(req.params.thingId, 'ota/initialize', {
            deviceid,
            url,
            ota_version,
            transactionId
        });
        res.json({
            success: true,
            transactionId
        });
    }
    catch (err) {
        console.error('❌ OTA init failed:', err);
        res.status(500).json({ error: 'OTA initialization failed' });
    }
});
exports.default = router;

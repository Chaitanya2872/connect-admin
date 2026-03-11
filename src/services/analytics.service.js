"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyEnergy = void 0;
var prisma_1 = require("../db/prisma");
var getDailyEnergy = function (deviceId) {
    return prisma_1.prisma.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\nSELECT date_trunc('day', \"createdAt\") AS day,\nSUM(unit) as units\nFROM \"DeviceEnergy\"\nWHERE \"deviceId\"=", "\nGROUP BY day ORDER BY day\n"], ["\nSELECT date_trunc('day', \"createdAt\") AS day,\nSUM(unit) as units\nFROM \"DeviceEnergy\"\nWHERE \"deviceId\"=", "\nGROUP BY day ORDER BY day\n"])), deviceId);
};
exports.getDailyEnergy = getDailyEnergy;
var templateObject_1;

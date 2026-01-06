"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyEnergy = void 0;
const prisma_1 = require("../db/prisma");
const getDailyEnergy = (deviceId) => {
    return prisma_1.prisma.$queryRaw `
SELECT date_trunc('day', "createdAt") AS day,
SUM(unit) as units
FROM "DeviceEnergy"
WHERE "deviceId"=${deviceId}
GROUP BY day ORDER BY day
`;
};
exports.getDailyEnergy = getDailyEnergy;

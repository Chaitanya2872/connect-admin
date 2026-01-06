"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseClimate = exports.parseEnergy = void 0;
const parseEnergy = (v) => {
    const [voltage, current, power, unit] = v.split('/').map(Number);
    return { voltage, current, power, unit };
};
exports.parseEnergy = parseEnergy;
const parseClimate = (v) => {
    const [temperature, humidity, sunlight] = v.split('/').map(Number);
    return { temperature, humidity, sunlight };
};
exports.parseClimate = parseClimate;

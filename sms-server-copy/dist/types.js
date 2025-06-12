"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSRequestSchema = void 0;
const zod_1 = require("zod");
exports.SMSRequestSchema = zod_1.z.object({
    phoneNumber: zod_1.z.string()
        .regex(/^\d+$/, 'Phone number must contain only digits')
        .default('88869436'),
    amount: zod_1.z.number()
        .positive('Amount must be positive')
        .default(650),
    targetPhone: zod_1.z.string()
        .regex(/^\d+$/, 'Target phone must contain only digits')
        .default('70701222')
});

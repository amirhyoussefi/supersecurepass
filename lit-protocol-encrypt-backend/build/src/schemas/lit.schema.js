"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.litParams = exports.litSchema = void 0;
const zod_1 = require("zod");
exports.litSchema = zod_1.z.object({
    body: zod_1.z.object({
        ciphertext: zod_1.z.string({
            required_error: "ciphertext is required"
        }),
        dataToEncryptHash: zod_1.z.string({
            required_error: "dataToEncryptHash is required"
        })
    })
});
exports.litParams = zod_1.z.object({
    userId: zod_1.z.string()
});

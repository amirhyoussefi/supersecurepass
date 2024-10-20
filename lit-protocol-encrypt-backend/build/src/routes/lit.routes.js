"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const lit_controller_1 = require("../controllers/lit.controller");
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 7 * 1000, // 7 seconds
    max: 1, // Limit each IP to 100 requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
    handler: (request, response) => {
        return response.status(404).json({
            error: {
                message: `Too many requests, please try again later.`
            }
        });
    }
});
const router = express_1.default.Router();
router.route("/").post(limiter, lit_controller_1.litController);
exports.default = router;

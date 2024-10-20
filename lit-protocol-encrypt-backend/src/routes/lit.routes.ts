import express from "express";
import rateLimit from "express-rate-limit";
import { litController } from "../controllers/lit.controller";

const limiter = rateLimit({
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

const router = express.Router();

router.route("/").post(limiter, litController);
export default router;

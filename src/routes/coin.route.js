import { Router } from "express";
import CoinsController from "../controllers/coins.controller";
import validateToken from "../middlewares/auth.middleware";

const router = Router();

router.post("/add-remove", validateToken, CoinsController.addOrRemoveCoins);
router.get("/get-all", validateToken, CoinsController.getCoinsTransactions);

export default router;

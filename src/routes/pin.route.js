import { Router } from "express";
import PinController from "../controllers/pin.controller";

const router = Router();

router.post("/autorize/:text", PinController.authorizeWithPin);
// router.post("/generate", PinController.createPin);
export default router;
//shsjhsj

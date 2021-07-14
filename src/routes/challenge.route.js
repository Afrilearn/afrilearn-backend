import { Router } from "express";
import ChallengeController from "../controllers/challenge.controller";
import validateToken from "../middlewares/auth.middleware";

const router = Router();

router.post("/add", validateToken, ChallengeController.addChallenge);
router.delete(
  "/delete/:challengeId",
  validateToken,
  ChallengeController.deleteChallenge
);
router.get("/:challengeId", ChallengeController.getChallenge);
router.get("/", ChallengeController.getChallenges);
router.post(
  "/register/:challengeId",
  validateToken,
  ChallengeController.registerForAChallenge
);
router.post(
  "/add-result/:challengeId",
  validateToken,
  ChallengeController.storeAChallengeResult
);
router.get(
  "/results/:challengeId",
  validateToken,
  ChallengeController.getChallengeResults
);

export default router;

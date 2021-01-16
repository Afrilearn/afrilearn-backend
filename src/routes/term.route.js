import { Router } from 'express';
import TermController from '../controllers/term.countroller';

const router = Router();

router.get('/', TermController.getAllTerms);
export default router;

import express from 'express';
import { getPublicPlans } from '../../../controllers/common/plan.js';

const router = express.Router();

// Public plans listing - no auth required
router.get('/public', getPublicPlans);

export default router;

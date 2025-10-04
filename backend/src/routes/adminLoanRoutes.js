import express from 'express';
import { adminGetAllLoans, adminApproveLoan, adminDeclineLoan, adminGetLoanDetails, adminGetAllRepayments } from '../controllers/loanController.js';
import { authMiddleware } from '../middleware/auth.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/loans', authMiddleware, adminMiddleware, adminGetAllLoans);
router.put('/loans/:id/approve', authMiddleware, adminMiddleware, adminApproveLoan);
router.put('/loans/:id/decline', authMiddleware, adminMiddleware, adminDeclineLoan);
router.get('/loans/:id/details', authMiddleware, adminMiddleware, adminGetLoanDetails);
router.get('/repayments', authMiddleware, adminMiddleware, adminGetAllRepayments);

export default router;

import express from "express";
import {createAccount,getAccounts,deposit,withdraw,transfer, deleteAccount} from "../controllers/accountController.js";
import { authMiddleware } from "../middleware/auth.js"; // Correct import path

const router = express.Router();

router.post("/", authMiddleware, createAccount);
router.get("/", authMiddleware, getAccounts);
router.post("/:id/deposit", authMiddleware, deposit);
router.post("/:id/withdraw", authMiddleware, withdraw);
router.post("/transfer", authMiddleware, transfer);
router.delete("/:id", authMiddleware, deleteAccount);

export default router;


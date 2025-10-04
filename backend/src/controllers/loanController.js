// Add these imports at the top
import {Account} from "../models/Account.js"; // Import the Account model
import Loan from "../models/Loan.js";
import Repayment from "../models/Repayment.js";
// import User from "../models/User.js"; // Import the User model
import { generateRepaymentSchedule } from "../utils/loanUtils.js";
import mongoose from 'mongoose'; // Ensure mongoose is imported for sessions

// @route POST /api/loans
// @desc User applies for a new loan
// @access Private (User only)
export const applyForLoan = async (req, res) => {
  try {
    const { loanType, amount, tenureMonths, interestRate } = req.body;
    const loan = await Loan.create({
      userId: req.user.userId, // Use userId from JWT token
      loanType,
      amount,
      tenureMonths,
      interestRate,
    });
    res.status(201).json(loan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @route GET /api/loans/user
// @desc Get all loans for the authenticated user
// @access Private (User only)
export const getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user.userId });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @route GET /api/loans/:id
// @desc Get details of a single loan
// @access Private (Owner only)
export const getLoanDetails = async (req, res) => {
  try {
    // Find loan by ID AND userId to ensure ownership
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!loan) {
      return res.status(404).json({ message: "Loan not found or you do not have access." });
    }
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @route PATCH /api/loans/:id/status
// @desc Admin updates loan status (approve/reject/close)
// @access Private (Admin only)
export const updateLoanStatus = async (req, res) => {
  /* try {
    const { status } = req.body;
    const loan = await Loan.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!loan) {
      return res.status(404).json({ message: "Loan not found." });
    }
    res.json(loan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  } */

      // Start a transaction session for atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status } = req.body;

    // Find the loan document within the transaction
    const loan = await Loan.findById(req.params.id).session(session);

    if (!loan) {
      // If loan not found, abort the transaction and end the session
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Loan not found." });
    }

    // Store the current status to check for a specific transition
    const previousStatus = loan.status;
    loan.status = status;

    // Conditionally generate and save repayment schedule
    // This block only runs if the loan status changes from 'Pending' to 'Approved'
    // This ensures repayments are generated only once and at the right time
    if (previousStatus === 'Pending' && status === 'Approved') {
      const repayments = generateRepaymentSchedule(loan);
      // Insert all repayment records in a single batch within the transaction
      await Repayment.insertMany(repayments, { session });
    }

    // Save the updated loan document within the transaction
    await loan.save({ session });
    
    // Commit the entire transaction to make all changes permanent
    await session.commitTransaction();
    session.endSession();

    res.json(loan);
  } catch (error) {
    // If any error occurs, abort the transaction to roll back all changes
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
};

// @route GET /api/loans/:id/repayments
// @desc Get repayment schedule for a loan
// @access Private (Owner only)
export const getRepaymentSchedule = async (req, res) => {
  try {
    // Find loan by ID and userId to ensure ownership before fetching repayments
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!loan) {
      return res.status(404).json({ message: "Loan not found or you do not have access." });
    }
    const repayments = await Repayment.find({ loanId: req.params.id });
    res.json(repayments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// @route POST /api/loans/:id/pay
// @desc User makes a payment on a loan installment
// @access Private (Owner only)
export const payLoanInstallment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { paymentAmount } = req.body;
    const loanId = req.params.id;
 // Add this line to log the values
    console.log("Looking for loan with ID:", loanId, "and userId:", req.user.userId);
    // 1. Find the loan and verify ownership
    const loan = await Loan.findOne({ _id: loanId, userId: req.user.userId }).session(session);
    if (!loan) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Loan not found or you do not have access." });
    }

    // 2. Find the first unpaid repayment record
    const repayment = await Repayment.findOne({ loanId: loan._id, paid: false }).sort({ dueDate: 1 }).session(session);
    if (!repayment) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "No outstanding payments for this loan." });
    }
    
    // 3. Find the user's account and verify sufficient funds
    const account = await Account.findOne({ userId: req.user.userId }).session(session);
    if (!account || account.balance < repayment.amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Insufficient balance to make this payment." });
    }

    // 4. Update both the account and the repayment record atomically
    account.balance -= repayment.amount;
    repayment.paid = true;
    repayment.paidDate = new Date();

    // 5. Save both changes within the transaction
    await account.save({ session });
    await repayment.save({ session });

    // 6. Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Payment successful.",
      account,
      repayment,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: "Failed to process payment: " + error.message });
  }
};

// Admin: Get all loan applications
export const adminGetAllLoans = async (req, res) => {
  try {
    // populate user info
    const loans = await Loan.find().populate('userId', 'name email').lean();

    // Gather userIds and map accounts
    const userIds = [...new Set(loans.map(l => l.userId?._id).filter(Boolean))];
    const accounts = await Account.find({ userId: { $in: userIds } }).lean();
    const accountsByUser = {};
    for (const acc of accounts) {
      const key = acc.userId.toString();
      if (!accountsByUser[key]) accountsByUser[key] = [];
      accountsByUser[key].push(acc);
    }

    // Attach a representative account and computed placeholder monthlyPayment if interestRate present
    const enriched = loans.map(l => {
      const userKey = l.userId?._id?.toString();
      const primaryAccount = userKey && accountsByUser[userKey] ? accountsByUser[userKey][0] : null;
      let monthlyPayment = undefined;
      if (l.interestRate && l.tenureMonths && l.amount) {
        const r = (l.interestRate / 100) / 12;
        if (r === 0) {
          monthlyPayment = l.amount / l.tenureMonths;
        } else {
          monthlyPayment = l.amount * (r * Math.pow(1 + r, l.tenureMonths)) / (Math.pow(1 + r, l.tenureMonths) - 1);
        }
        monthlyPayment = parseFloat(monthlyPayment.toFixed(2));
      }
      return {
        ...l,
        accountId: primaryAccount ? {
          _id: primaryAccount._id,
          accountNumber: primaryAccount.accountNumber,
          type: primaryAccount.type,
          balance: primaryAccount.balance
        } : null,
        monthlyPayment
      };
    });

    res.json({ loans: enriched, count: enriched.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Approve loan (sets status to Approved and generates repayment schedule)
export const adminApproveLoan = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { interestRate, term, monthlyPayment, approvedDate } = req.body;
    const loanId = req.params.id;
    const loan = await Loan.findById(loanId).session(session);
    if (!loan) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Loan not found.' });
    }

    const previousStatus = loan.status;
    loan.status = 'Approved';
    if (interestRate) loan.interestRate = interestRate;
    if (term) loan.tenureMonths = term;

    // If transitioning from Pending to Approved, generate repayments
    if (previousStatus === 'Pending' && loan.status === 'Approved') {
      const repayments = generateRepaymentSchedule(loan);
      await Repayment.insertMany(repayments, { session });
    }

    await loan.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Loan approved', loan });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
};

// Admin: Decline loan
export const adminDeclineLoan = async (req, res) => {
  try {
    const loanId = req.params.id;
    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ message: 'Loan not found.' });
    loan.status = 'Rejected';
    await loan.save();
    res.json({ message: 'Loan declined', loan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Get loan details with account(s)
export const adminGetLoanDetails = async (req, res) => {
  try {
    const loanId = req.params.id;
    const loan = await Loan.findById(loanId).populate('userId', 'name email');
    if (!loan) return res.status(404).json({ message: 'Loan not found.' });
    const accounts = await Account.find({ userId: loan.userId });
    res.json({ loan, accounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Get all repayments
export const adminGetAllRepayments = async (req, res) => {
  try {
    // Fetch all loans with user
    const loans = await Loan.find().populate('userId', 'name email');

    // Preload all accounts grouped by userId for quick lookup
    const userIds = [...new Set(loans.map(l => l.userId && l.userId._id).filter(Boolean))];
    const accountsByUser = {};
    if (userIds.length > 0) {
      const accounts = await Account.find({ userId: { $in: userIds } });
      for (const acc of accounts) {
        const key = acc.userId.toString();
        if (!accountsByUser[key]) accountsByUser[key] = [];
        accountsByUser[key].push(acc);
      }
    }

    // Fetch all repayments and group by loanId
    const repayments = await Repayment.find();
    const repaymentsByLoan = {};
    for (const r of repayments) {
      const key = r.loanId.toString();
      if (!repaymentsByLoan[key]) repaymentsByLoan[key] = [];
      repaymentsByLoan[key].push(r);
    }

    const loanAccounts = loans.map(loan => {
      const loanIdStr = loan._id.toString();
      const rList = (repaymentsByLoan[loanIdStr] || []).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
      const totalRepayments = rList.length;
      const paidRepayments = rList.filter(r => r.paid).length;
      const totalPaidAmount = rList.filter(r => r.paid).reduce((sum, r) => sum + r.amount, 0);
      const totalRemainingAmount = rList.filter(r => !r.paid).reduce((sum, r) => sum + r.amount, 0);
      const firstAccount = (accountsByUser[loan.userId?._id?.toString()] || [])[0] || null;

      return {
        _id: loan._id,
        amount: loan.amount,
        interestRate: loan.interestRate,
        tenureMonths: loan.tenureMonths,
        userDetails: {
          name: loan.userId?.name || 'Unknown',
          email: loan.userId?.email || 'Unknown',
          phone: '' // phone not in schema currently
        },
        accountDetails: firstAccount ? {
          accountNumber: firstAccount.accountNumber,
            type: firstAccount.type,
            balance: firstAccount.balance
        } : {
          accountNumber: 'N/A',
            type: 'N/A',
            balance: 0
        },
        repayments: rList.map(r => ({
          _id: r._id,
          dueDate: r.dueDate,
          amount: r.amount,
          paid: r.paid,
          paidDate: r.paidDate || null
        })),
        totalRepayments,
        paidRepayments,
        totalPaidAmount: parseFloat(totalPaidAmount.toFixed(2)),
        totalRemainingAmount: parseFloat(totalRemainingAmount.toFixed(2))
      };
    });

    res.json({ success: true, loanAccounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
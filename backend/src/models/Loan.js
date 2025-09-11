import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  loanType: {
    type: String,
    enum: ["Personal", "Home", "Education", "Auto", "Business"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  tenureMonths: {
    type: Number,
    required: true,
  },
  interestRate: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Active", "Closed"],
    default: "Pending",
  },
}, { timestamps: true });

export default mongoose.model("Loan", loanSchema);
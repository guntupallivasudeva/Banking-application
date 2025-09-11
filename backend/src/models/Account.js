import mongoose from "mongoose";

// Define the Transaction schema is an embedded document within Account

const transactionSchema = new mongoose.Schema({
    txnId: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['Credit', 'Debit', 'Transfer'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    timeStamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Success', 'Failed','Pending'],
        default: 'Success',
        required: true
    },
    
});

//The main Account schema
const accountSchema = new mongoose.Schema({
    accountNumber: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Savings', 'Current', 'Fixed'],
        required: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Frozen', 'Closed'],
        default: 'Active',
        required: true
    },

    transactions: [transactionSchema]
});

export const Account = mongoose.model('Account', accountSchema);
export const Transaction = mongoose.model('Transaction', transactionSchema);


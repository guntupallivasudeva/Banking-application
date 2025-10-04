import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import accountsRoutes from './routes/accountRoutes.js';
import loansRoutes from './routes/loanRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminLoanRoutes from './routes/adminLoanRoutes.js';



//Load environment variables from .env file

dotenv.config();

const app = express();

app.use(cors());

//Global middleware for parse JSON bodies for all routes
app.use(express.json());



// integrate account rest api routes with /api base URL (matching frontend)
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/admin', adminLoanRoutes);


mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("Connected to MongoDB");
        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`Server is ready at http://localhost:${PORT}/api`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });






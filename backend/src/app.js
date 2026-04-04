import express from 'express';
import cors from 'cors';
import accountsRoutes from './routes/accountRoutes.js';
import loansRoutes from './routes/loanRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminLoanRoutes from './routes/adminLoanRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/admin', adminLoanRoutes);

export default app;
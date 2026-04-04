import dotenv from 'dotenv';
import app from '../src/app.js';
import { connectToDatabase } from '../src/db.js';

dotenv.config();

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    return res.status(500).json({ error: `Database connection failed: ${error.message}` });
  }
}
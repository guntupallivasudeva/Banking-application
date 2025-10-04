import express from "express";
// Removed Apollo/GraphQL server - using REST endpoints only
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import accountsRoutes from "./routes/accountRoutes.js";
import loansRoutes from "./routes/loanRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminLoanRoutes from './routes/adminLoanRoutes.js';
import { authMiddleware } from "./middleware/auth.js";


// Load environment variables from .env file
dotenv.config();

const app = express();

// app.use(cors());

//Global middleware to parse JSON bodies for all routes
app.use(express.json());

// Enable CORS for the frontend (Angular dev server)
// Adjust origin as needed in production
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
// preflight requests are handled by the cors middleware registered above

const startServer = async () => {
    // Mount REST routes
    app.use("/api/auth", authRoutes);
    app.use("/api/accounts", accountsRoutes);
    app.use("/api/loans", loansRoutes);
  app.use('/api/admin', adminLoanRoutes);


  // MongoDB connection and server start
  const mongoUrl = process.env.MONGO_URL ? process.env.MONGO_URL.trim() : '';

  // Basic validation of the scheme to give a clearer error message early
  const hasValidScheme = mongoUrl.startsWith('mongodb://') || mongoUrl.startsWith('mongodb+srv://');
  if (!mongoUrl) {
    console.error('Environment variable MONGO_URL is not set. Please add it to backend/.env or your environment.');
    process.exit(1);
  }
  if (!hasValidScheme) {
    // show a masked hint (don't print credentials). If the URL contains '@', show the host part only
    let hostHint = mongoUrl;
    if (mongoUrl.includes('@')) {
      hostHint = mongoUrl.split('@')[1].split('/')[0];
    } else {
      hostHint = mongoUrl.split('/')[0];
    }
    console.error('MONGO_URL does not start with a supported scheme (mongodb:// or mongodb+srv://). Detected value hint:', hostHint);
    process.exit(1);
  }

  try {
  await mongoose.connect(mongoUrl);
  console.log('Connected to MongoDB');
  const startPort = parseInt(process.env.PORT, 10) || 8000;
  // Try to listen on the configured port, but if it's in use try a few alternatives
  const tryListen = (startPortNum, maxAttempts = 10) => {
      return new Promise((resolve, reject) => {
        let attempt = 0;
        const tryPort = () => {
          const portToTry = startPortNum + attempt;
          const server = app.listen(portToTry, () => {
            resolve({ server, port: portToTry });
          });

          server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
              attempt += 1;
              server.close?.();
              if (attempt < maxAttempts) {
                console.warn(`Port ${portToTry} in use, trying port ${startPortNum + attempt}...`);
                setTimeout(tryPort, 200);
                return;
              }
              reject(new Error(`Ports ${startPortNum}-${startPortNum + maxAttempts - 1} are all in use.`));
            } else {
              reject(err);
            }
          });
        };
        tryPort();
      });
    };

    const { server, port: listeningPort } = await tryListen(startPort, 10);
    console.log(`Server is ready at http://localhost:${listeningPort}/`);

    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Database connection error:', error && error.message ? error.message : error);
    // If mongoose threw a MongoParseError, include the stack for diagnosis
    if (error && error.stack) console.error(error.stack);
    process.exit(1);
  }
};


//start the express server
startServer();





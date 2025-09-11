import express from "express";
import {ApolloServer} from "@apollo/server";
import {expressMiddleware} from "@as-integrations/express5";
import mongoose from "mongoose";
import dotenv from "dotenv";
// import cors from "cors";
import accountsRoutes from "./routes/accountRoutes.js";
import loansRoutes from "./routes/loanRoutes.js";
import { typeDefs,resolvers } from "./graphql/schema.js";
import { authMiddleware } from "./middleware/auth.js";


// Load environment variables from .env file
dotenv.config();

const app = express();

// app.use(cors());

//Global middleware to parse JSON bodies for all routes
app.use(express.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
});


const startServer = async () => {
    // Start the Apollo Server
    await server.start();

    //integrate account REST API routes
    app.use("/api/accounts", accountsRoutes);
    app.use("/api/loans", loansRoutes);

    //use express middleware to integrate apollo server with express server
  app.use(
    '/graphql', //this is the path for your graphql server
    expressMiddleware(server, {
      context: async ({ req, res }) => 
      {
        authMiddleware(req, res, () => { });
        return { user: req.user };
      }
    })
  );


  //MongoDB connection and server start
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server is ready at http://localhost:${PORT}/graphql`);
    });
  })
  .catch((error) => console.error("Database connection error:", error));
};


//start the express server
startServer();





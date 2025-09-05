import express from "express";
import {ApolloServer} from "@apollo/server";
import {expressMiddleware} from "@as-integrations/express5";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables from .env file
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


//MongoDB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.error("Database connection error:", error));

  // Apollo Server setup
const typeDefs = `
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello, Banking App backend !',
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
    // Start the Apollo Server
    await server.start();

    //use express middleware to integrate apollo server with express server
    app.use('/graphql', //this is the path for your graphql server
        cors(),
        express.json(), 
        expressMiddleware(server)
    );
};

//start the express server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {console.log(`Server is ready at http://localhost:${PORT}/graphql`);
});
startServer();





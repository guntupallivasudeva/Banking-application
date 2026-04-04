import dotenv from 'dotenv';
import app from './app.js';
import { connectToDatabase } from './db.js';



//Load environment variables from .env file

dotenv.config();

connectToDatabase()
    .then(() => {
        console.log('Connected to MongoDB');
        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`Server is ready at http://localhost:${PORT}/api`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });






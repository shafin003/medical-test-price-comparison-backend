import express from 'express';
import dotenv from 'dotenv';
import errorHandler from './src/middleware/errorHandler.js';
import hospitalRoutes from './src/routes/hospitalRoutes.js';
import connectDB from './src/config/db.js';
import notFound from './src/middleware/notFound.js';

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());


app.get('/', (req, res) => {
	res.send('Hello World!');
});

// --- API Routes ---
app.use('/api/hospitals', hospitalRoutes);

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const http = require('http'); 
const connectDB = require('./config/db');
const socketService = require('./services/socketService'); // Real-time service

// Load environment variables
dotenv.config();

// Connect Database
connectDB();

// Initialize Express App
const app = express();
// Create HTTP server for both Express and Socket.io
const server = http.createServer(app); 

// Initialize Socket.io Server
socketService.init(server);

// Middleware Setup
// Logging middleware: 'dev' format in development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); 
}

app.use(express.json()); // Body parser
app.use(cors()); // Global CORS enabled

// Define API Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/event');

app.use('/api/auth', authRoutes); 
app.use('/api/events', eventRoutes); 

// Health Check / Fallback Route
app.get('/', (req, res) => {
  res.send('Online Voting API Status: Operational with WebSocket Service.');
});

// Port and Server Start
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
import express from 'express';
import { connect } from './config/db.js';
import * as dotenv from 'dotenv';
import AuthRouter from './routes/auth.routes.js';
import UserRouter from './routes/user.routes.js';
import EventRouter from './routes/event.routes.js';
import BookingRouter from './routes/booking.routes.js';
import AdminRouter from './routes/admin.routes.js';
import { errorHandler } from './middleware/error.handler.js';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit'

const app = express();
dotenv.config(); 

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // Limit each IP to 150 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  });
 
const port = process.env.PORT || 3000;
  
// Middleware for logging HTTP requests
app.use(morgan('combined'));
  
app.use(express.urlencoded()); 
// Middleware for parsing JSON bodies
app.use(express.json());

// Serve static files from the public directory
app.use('/uploads', express.static('public/uploads'));

// Middleware for enabling CORS
app.use(cors({
      origin:"*"
    }));

// Middleware for limiting repeated requests
app.use(limiter); 
    
// Middleware for adding Helmet security headers
app.use(helmet());
    
app.use('/auth', AuthRouter); 
app.use('/users', UserRouter);
app.use('/events', EventRouter);
app.use('/bookings', BookingRouter);
app.use('/admin', AdminRouter);
app.use(errorHandler); 

app.listen(port, () => {
     connect(); 
    console.log(`Server running at http://localhost:${port}`);
});
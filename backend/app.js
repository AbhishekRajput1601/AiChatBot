import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

connect();


const app = express();

app.use(cors()); // allows all origins to access the server 
app.use(morgan('dev')); // logs all requests to the console 
app.use(express.json()); // parses incoming requests with JSON payloads meaning that it can parse JSON data in the body of the request
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); // parses cookies attached to the client request object

app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use("/ai", aiRoutes)


export default app; 
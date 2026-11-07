import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import dns from 'dns';
import userRouter from "./Routes/userRoutes.js";
import ownerRouter from "./Routes/ownerRoutes.js";
import bookingRouter from "./Routes/bookingRoutes.js";




dns.setServers(["8.8.8.8","1.1.1.1"])
const app = express();

await connectDB();

app.use(cors());
app.use(express.json());


app.get('/',(req,res) => res.send("Server is Running"))
app.use('/api/user',userRouter)
app.put('/items',(req,res)=>res.send("Server is Running On PUT"))
app.use('/api/owner', ownerRouter)
app.use('/api/booking', bookingRouter)


const PORT = process.env.PORT || 3000;

app.listen(PORT,()=> console.log(`Server running on port ${PORT}`));
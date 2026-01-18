import express from "express";
import { connect } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors"
import authRoute from "./routes/authRoute.js"
import productRoute from "./routes/productRoute.js"
import paymentRoutes from "./routes/paymentRoute.js";



const app = express();
app.use(cors())
dotenv.config()

console.log("EMAIL_USERNAME:", process.env.EMAIL_USERNAME);
console.log("EMAIL_PASSWORD exists:", !!process.env.EMAIL_PASSWORD);

const port = process.env.PORT || 3000;

app.use(express.json());
// api routes
app.use("/api/auth", authRoute);
app.use("/api/product", productRoute);
app.use("/api/payment", paymentRoutes)



app.get("/",(req,res)=>{
    res.status(200).json({success:true, message:"server is live"})
})


app.use((req,res)=>{
    res.status(404).json({success:false,errMsg:"route not found"})
})

connect()
.then( ( )=>{
    try {
        app.listen(port,()=>{
            console.log(`http://localhost:${port}`);
        })
    } catch (error) {
        console.log("can not connect to server" + error.message);
    }
})
.catch((error)=>{
    console.log("invalid database connection" + error.message);
    
})

const express = require("express");
const app = express();
const authRouter = require("./src/routes/authRoutes");
const messageRouter = require("./src/routes/messageRoutes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectToDb = require("./src/config/db");
const userInfoRouter = require("./src/routes/userInfoRoutes");
const isAuthMiddleware = require("./src/middleware/authMiddleware");
require("dotenv").config();


const url = process.env.DB_URL;

connectToDb(url)
  .then(() => console.log("Connected to DB"))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

//middlewares
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors(
  {
    origin : process.env.CLIENT_URL,
    credentials : true
  }
));

//routes
app.use("/api", authRouter);
app.use("/api/message", messageRouter);
app.use("/api/user",isAuthMiddleware, userInfoRouter);



//Global Error Handler
app.use((err,req,res,next) =>{
  console.log(err);
  res.status(500).json({error : "Something went wrong"})
})

module.exports = app;
const express = require("express");
const app = express();
const authRouter = require("./src/routes/authRoutes");
const messageRouter = require("./src/routes/messageRoutes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectToDb = require("./src/config/db");
require("dotenv").config();

const PORT = process.env.PORT || 8000;
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
app.use(cors());

//routes
app.use("/api", authRouter);
app.use("/api/message", messageRouter);

app.listen(PORT, () => {
  `App is listening at port ${PORT}`;
});

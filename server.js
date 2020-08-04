const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const morgan = require("morgan");
const movie = require("./route/movie");
const user = require("./route/user");
const reply = require("./route/reply");
const reserve = require("./route/reserve");
const fileupload = require("express-fileupload");
const path = require("path");

const app = express();
app.use(express.json());
app.use(fileupload());
app.use(express.static(path.join(__dirname, "public")));

app.use(morgan("dev"));

app.use("/api/v1/movie", movie);
app.use("/api/v1/user", user);
app.use("/api/v1/reply", reply);
app.use("/api/v1/reserve", reserve);

const PORT = process.env.PORT;
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} node on part ${PORT}`)
);

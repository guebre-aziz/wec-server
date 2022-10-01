const express = require("express");
const morgan = require("morgan");
const app = express();
const connectDB = require("./services/db/connection");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const port = process.env.PORT;
const corsOptions = require("./middleware/corsOptions");

// mongoDB connection
connectDB();

// middleware
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(morgan("common"));

// serve server public
app.use("/public/", express.static(path.join(__dirname, "../../public")));
app.use(
  "/profile/public",
  express.static(path.join(__dirname, "../../public"))
);

// serve the files for react built
const root = path.join(__dirname, "../../wec-client", "build");
app.use(express.static(root));

// get react app
app.get("/", (req, res) => {
  res.sendFile(path.resolve("index.html", { root }));
});
app.use(cors());

// load router API v1 ----->BE AWARE CHANGING PATH <-----
app.use("/api/v1", require("./api_v1/routers/router"));

app.listen(port, () => {
  console.log(`wec.server is running on ${port}`);
});

const Express = require("express");
const Session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes/index"); // import router
require("dotenv").config();

// initialize session middlware
const session = Session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  cookie: {
    secure: false
  }
});
const app = Express();

// use middleware and router
app.use(
  cors({
    origin: 'http://localhost:40709',
    preflightContinue: true,
    credentials: true
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session);
app.use("/", routes);

module.exports = app;

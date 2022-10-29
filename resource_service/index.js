require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const { checkJwt } = require("./auth/auth0");
const PORT = process.env.PORT || 3008;

app.use("*", checkJwt, (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    console.error("UnauthorizedError", new Error(err));
    res.status(401).send({ Status: "This endpoint is private" });
  }
});

// checkJwt middleware autheticates bearer token
app.get("/sample_route", (req, res) => {
  res.send("You are authenticated");
});

app.listen(PORT, () => {
  console.log(`Listening @ http://localhost:${PORT}`);
});

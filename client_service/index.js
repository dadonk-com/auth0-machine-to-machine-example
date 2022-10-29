require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const axios = require("axios");
const redis = require("./lib/redis").connect();
const auth0_service = require("./auth/auth0_service");
const PORT = process.env.PORT || 3000;

// auth0_service middleware returns Bearer token in res.apiBearer
app.get("/", auth0_service, async (req, res) => {
  try {
    const response = await axios.get("http://localhost:3008/sample_route", {
      method: "GET",
      headers: {
        Authorization: `${res.apiBearer}`,
        "Content-Type": "application/json",
      },
    });

    const json = await response.data;
    res.status(200).send(json);
  } catch (err) {
    console.log(err);
    res.status(err.response.status).send(err.response.statusText);
  }
});

redis.on("connect", function (error) {
  if (error) {
    console.log("Redis connection error:", error);
    return false;
  }
  app.listen(PORT, () => {
    console.log(`Listening @ http://localhost:${PORT}`);
  });
});

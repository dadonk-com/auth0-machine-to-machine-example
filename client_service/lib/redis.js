require("dotenv").config();
const express = require("express");
const app = express();
const fs = require("fs");
let redis = null;

module.exports = {
  connect: () => {
    let redisHost = process.env.redisHost ? process.env.redisHost : "127.0.0.1";
    let redisPort = process.env.redisPort ? process.env.redisPort : 6379;
    let redisOptions = {
      host: redisHost,
      port: redisPort,
    };

    redis = require("async-redis").createClient(redisOptions);

    redis.on("connect", function (err) {
      if (!err) {
        console.log("Redis Connected");
        console.log(redisHost);
        console.log(redisPort);
      }
    });
    redis.on("error", function (err) {
      console.log("Error " + err);
    });
    return redis;
  },
  redisClient: () => redis,
};

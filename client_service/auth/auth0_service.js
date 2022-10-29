const axios = require("axios");
const redis = require("../lib/redis").redisClient();
const keyName = process.env.REDIS_KEY;

module.exports = async (req, res, next) => {
  try {
    const auth0ClientId = process.env.AUTH0_CLIENT_ID;
    const auth0Secret = process.env.AUTH0_SECRET;
    const auth0Audience = process.env.AUTH0_AUDIENCE;
    const auth0Domain = process.env.AUTH0_DOMAIN;

    // If token is expired request a new token from Auth0 otherwise pull it from Redis otherwise
    let data = 0;

    const validate = async () => {
      try {
        const checkToken = await redis.TTL(keyName);
        // Token expired or doesn't exist ... get new token
        if (checkToken < 3600) {
          // If TTL(Time To Live) is less than 1 hour
          // Options for Axios call to Auth0 oAuth Token Request
          const data = {
            client_id: auth0ClientId,
            client_secret: auth0Secret,
            audience: auth0Audience,
            grant_type: "client_credentials",
          };
          const headers = {
            "content-type": "application/json",
          };
          const url = `https://${auth0Domain}/oauth/token`;
          try {
            // Axios to Auth0 call
            const token = await axios.post(url, headers, data);
            const tokenParsed = token;

            const setToken = redis.hmset(
              keyName,
              [
                "access_token",
                tokenParsed.data.access_token,
                "token_type",
                tokenParsed.data.token_type,
                "expires_in",
                tokenParsed.data.expires_in,
              ],
              function (err, data) {
                if (err) {
                  console.log(err);
                }
              }
            );

            // CACHE_LENGTH is set in seconds
            // You can control token expire from Auth0 dashboard
            //const CACHE_LENGTH = 3660; // Sets expire to 1 hour 1 minute for testing
            const CACHE_LENGTH = tokenParsed.data.expires_in;
            redis.expire(keyName, CACHE_LENGTH);
            console.log("New token requested");

            // Return Bearer token for "authorization" header
            const bearer = `${tokenParsed.data.token_type} ${tokenParsed.data.access_token}`;
            // Set apiBearer in res
            res.apiBearer = bearer;
            process.env.apiBearer = bearer;
            next();
          } catch (error) {
            console.error(error);
            console.log("Token request failed");
            res.apiBearer = "";
            next();
          }
          // Redis Token is valid ... use token from Redis
        } else {
          //
          const access_token = await redis.hmget(keyName, ["access_token"]);
          // Build Bearer token string for "authorization" header insert
          const bearer = "Bearer " + access_token.toString();
          res.apiBearer = bearer;
          process.env.apiBearer = bearer;
          // console.log("Cached token used");
          next();
        }
      } catch (e) {
        console.log(e);
      }
    };
    return validate();
  } catch (e) {
    console.log("Redis auth error");
    console.log(e);
  }
};

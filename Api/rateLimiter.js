const redis = require("./redis-client");
function rateLimiter({ secondsWindow, allowedHits }) {
  return async function (req, res, next) {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log(ip);
    const requests = await redis.incr(ip);
    let ttl;
    if (requests == 1) {
      ttl = await redis.expire(ip, secondsWindow);
      ttl = secondsWindow;
    } else {
      ttl = redis.ttl(ip);
    }
    if (requests > allowedHits) {
      return res.status(503).json({
        response: "error",
        callsInAMinute: requests,
        ttl,
      });
    } else {
        req.requests=requests
        req.ttl=ttl
      next();
    }
  };
}
module.exports = rateLimiter;

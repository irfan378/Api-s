const express = require("express");
const path = require("path");
const axios = require("axios");
const app = express();
const redis = require("./redis-client");
const PORT = 5001;

app.use(express.json());
app.post("/data", async (req, res) => {
  const repo = req.body.repo;
  let timeStart = Date.now();

  const value = await redis.get(repo);
  if (value) {
    const timeEnd = Date.now();
    res.json({
      from: "redis",
      status: "Ok",
      stars: value,
      timeForRet: timeEnd - timeStart,
    });
    const response = await axios.get(`https://api.github.com/repos/${repo}`);

    if (response.data.stargazers_count != undefined) {
      await redis.setex(repo, 10, response.data.stargazers_count);
    }
    return;
  }
  timeStart = Date.now();
  const response = await axios.get(`https://api.github.com/repos/${repo}`);
  const timeEnd = Date.now();
  if (response.data.stargazers_count != undefined) {
    await redis.setex(repo, 10, response.data.stargazers_count);
  }
  res.json({
    from: "remote",
    status: "Ok",
    stars: response.data.stargazers_count,
    timeForRet: timeEnd - timeStart,
  });
});
app.post("/api1", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  console.log(ip);
  const requests = await redis.incr(ip);
  let ttl;
  if (requests == 1) {
    ttl = await redis.expire(ip, 10);
  } else {
    ttl = redis.ttl(ip);
  }
  console.log(requests);
  if (requests > 10) {
    return res.status(503).json({
      response: "error",
      callsInAMinute: requests,
      ttl,
    });
  }
  return res.json({
    response: "ok",
    callsInAMinute: requests,
    ttl,
  });
});
app.post("/api3", (req, res) => {
  return res.json({
    response: "ok",
    callsInAMinute: 0,
  });
});
app.post("/api3", (req, res) => {
  return res.json({
    response: "ok",
    callsInAMinute: 0,
  });
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.listen(PORT, () => {
  console.log("Server ready");
});

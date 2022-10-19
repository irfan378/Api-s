const express = require("express");
const path = require("path");
const axios = require("axios");
const app = express();
const redis = require("./redis-client");
const PORT = 5001;

app.use(express.json());
app.post("/data", async (req, res) => {
  const repo = req.body.repo;

  const value = await redis.get(repo);
  if (value) {
   return res.json({
      from: "redis",
      status: "Ok",
      stars: value,
    });
  }
  const response = await axios.get(`https://api.github.com/repos/${repo}`);

  if (response.data.stargazers_count != undefined) {
    await redis.set(repo, response.data.stargazers_count);
  }
  res.json({
    from: "remote",
    status: "Ok",
    stars: response.data.stargazers_count,
  });
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.listen(PORT, () => {
  console.log("Server ready");
});

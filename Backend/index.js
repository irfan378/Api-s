const express = require("express");
const path = require("path");
const axios = require("axios");
const app = express();
const redis = require("./redis-client");
const PORT = 5001;


app.use(express.json());
app.post("/data", async (req, res) => {
  const repo = req.body.repo;
 
  const response = await axios.get(`https://api.github.com/repos/${repo}`).then(
    function (response) {
      console.log(response)
    }
  );
 
  res.json({
    from: "remote",
    status: "Ok",
    stars: response.stargazers_count,
  });
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.listen(PORT, () => {
  console.log("Server ready");
});

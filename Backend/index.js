const express=require("express")
const path=require('path')
const fetch=require('node-fetch')
const app=express();

app.use(express.json())
const PORT=5000;
app.post('/data',async(req,res)=>{
    const repo=req.body.repo
    const response=await fetch(`https://api.github.com/repos/${repo}`.then(t=>t.json()))
    res.json({
        status:"Ok",
        stars:response.stargazers_count
    })
})
app.post("/",(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'))
})
app.listen(PORT,()=>{
    console.log("Server ready")
})
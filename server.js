require("dotenv").config();
const express = require("express");
const fetch = (...a)=>import("node-fetch").then(({default:f})=>f(...a));
const app = express();

app.use(express.static("public"));

app.get("/login",(req,res)=>{
  const redirect=encodeURIComponent(process.env.REDIRECT_URI);
  res.redirect(`https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=identify guilds`);
});

app.get("/callback",async(req,res)=>{
  const data=new URLSearchParams({
    client_id:process.env.CLIENT_ID,
    client_secret:process.env.CLIENT_SECRET,
    grant_type:"authorization_code",
    code:req.query.code,
    redirect_uri:process.env.REDIRECT_URI
  });

  const t=await fetch("https://discord.com/api/oauth2/token",{method:"POST",body:data});
  const tok=await t.json();

  const user=await fetch("https://discord.com/api/users/@me",{headers:{Authorization:`Bearer ${tok.access_token}`}}).then(r=>r.json());
  const guilds=await fetch("https://discord.com/api/users/@me/guilds",{headers:{Authorization:`Bearer ${tok.access_token}`}}).then(r=>r.json());

  res.send(`<script>
    localStorage.setItem("user",${JSON.stringify(user)});
    localStorage.setItem("guilds",${JSON.stringify(guilds)});
    location.href='/dashboard.html';
  </script>`);
});

app.listen(process.env.PORT,()=>console.log("Web running"));

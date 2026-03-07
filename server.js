const express=require("express");

const app=express();

app.use(express.json());

app.use((req,res,next)=>{
res.header("Access-Control-Allow-Origin","*");
res.header("Access-Control-Allow-Headers","Content-Type");
res.header("Access-Control-Allow-Methods","GET,POST,OPTIONS");

if(req.method==="OPTIONS"){
return res.sendStatus(200);
}

next();
});

const apiKey=process.env.ANTHROPIC_API_KEY;



const profiles={

sonya:{
name:"Соня",
age:86,
likes:"частушки, военные песни, добрые разговоры"
},

default:{
name:"друг",
age:"",
likes:"спокойный разговор"
}

};



app.post("/api/chat",async(req,res)=>{

const text=req.body.text;
const user=req.body.user || "default";

if(!text){
return res.status(400).json({reply:"пустой текст"});
}

const profile=profiles[user] || profiles.default;



const systemPrompt=`

Ты MetaPelet — тёплый голосовой помощник для пожилого человека.

Сейчас ты разговариваешь с человеком:

Имя: ${profile.name}
Возраст: ${profile.age}

Он любит:
${profile.likes}

Твоя задача:

говорить мягко  
спокойно  
короткими фразами  
создавать ощущение, что рядом заботливый собеседник  

не говори что ты ИИ
не спорь
не будь холодной

`;



try{

const response=await fetch("https://api.anthropic.com/v1/messages",{

method:"POST",

headers:{
"Content-Type":"application/json",
"x-api-key":apiKey,
"anthropic-version":"2023-06-01"
},

body:JSON.stringify({

model:"claude-3-haiku-20240307",

max_tokens:300,

system:systemPrompt,

messages:[
{
role:"user",
content:text
}
]

})

});

const data=await response.json();

const reply=data.content?.[0]?.text || "Я рядом.";

res.json({reply});

}catch(e){

console.error(e);

res.json({reply:"Я рядом."});

}

});



app.listen(3000,()=>{
console.log("MetaPelet server started");
});

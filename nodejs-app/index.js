import express from "express";
import controllers from "./controller.js";


const  app = express()

app.get('/',controllers.homeController)
app.get('/post',controllers.postController)

//set interval http get "/" every 5 seconds
setInterval(() => {
    fetch('http://localhost:8080/')
        .then(response => response.text())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
}, 2000);

app.listen(8080,()=>{
    console.log("server is running on port 8080")
})
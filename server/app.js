const express = require('express')
const app = express();

const PORT = 8000;

//middlewares
app.use(express.json());

app.get('/',(req,res)=>{
    res.json({
        message: "Hello World"
    })
})

app.listen(PORT,()=>{
    `App is listening at port ${PORT}`
})
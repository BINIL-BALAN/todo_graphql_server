const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://user:<password>@cluster0.1pusp8l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(data=>{
    console.log('mongodb connected successfully');
}).catch(error=>{
    console.log("error in mongodb connection");
})

const User = mongoose.model("User",{
    id:String,
    name:String,
    email:String,
    task:[]
})

module.exports = {
    User
}
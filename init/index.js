const mongoose=require("mongoose");
const indata=require("./data.js");
const Listing=require("../models/listing.js");
const { object } = require("joi");
const MONGO_url="mongodb://127.0.0.1:27017/wonderlust";
main().then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log(err);
})
async function main() {

    await mongoose.connect(MONGO_url);
}
const initDb =async () =>{
    await Listing.deleteMany({});
     indata.data=indata.data.map(obj=>({...obj,owner:"6a2d2cfd41e2a6f67b87da25"}));
    await Listing.insertMany(indata.data);
    console.log("data was initlaize");

}
initDb();
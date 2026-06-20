const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const bookingSchema=new Schema({
    listing:{
        type:Schema.Types.ObjectId,
        ref:"Listing",
        required:true,
    },
    client:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
});

bookingSchema.index({listing:1,client:1},{unique:true});

module.exports=mongoose.model("Booking",bookingSchema);

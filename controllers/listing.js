const Listing=require("../models/listing.js");
const {cloudinary}=require("../cloudConfig.js");
const Booking=require("../models/booking.js");

const geocodeLocation=async(location,country)=>{
    try{
        const query=encodeURIComponent(`${location}, ${country}`);
        const response=await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,{
            headers:{
                "User-Agent":"Wonderlust/1.0",
            },
            signal:AbortSignal.timeout(8000),
        });
        const data=await response.json();
        if(!data.length){
            return undefined;
        }
        return {
            type:"Point",
            coordinates:[Number(data[0].lon),Number(data[0].lat)],
        };
    }catch(err){
        return undefined;
    }
};

module.exports.index=async(req,res)=>{
     const {search}=req.query;
     let filter={};
     if(search){
        filter.location={$regex:search,$options:"i"};
     }
     const allisting=await Listing.find(filter);
     res.render("index.ejs",{allisting,search});
};
module.exports.showroute=async (req,res)=>{
    let {id}=req.params;
    const listing =await Listing.findById(id).populate({path:"reviews",populate:{
        path:"author",
    }}).populate("owner");
    if(!listing){
         req.flash("error","Listing you requested does not exist");
         return res.redirect("/listings");
    }
    const geometry=await geocodeLocation(listing.location,listing.country);
    if(geometry){
        listing.geometry=geometry;
        await listing.save();
    }
    const bookings=await Booking.find({listing:id}).populate("client");
    const currUserBooking=req.user ? bookings.find((booking)=>booking.client._id.equals(req.user._id)) : null;
    const bookedByCurrUser=!!currUserBooking;
    res.render("show.ejs",{listing,bookings,bookedByCurrUser,currUserBooking});
};
module.exports.createroute=async (req,res)=>{
     const newl= new Listing(req.body.listing);
     if(req.file){
    let url=req.file.path;
    let filename=req.file.filename;
    console.log(url,"..",filename);
    newl.image={url,filename};
     }else{
    newl.image={
        url:"https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=60",
        filename:"default_listing_image",
    };
     }
   
    newl.owner=req.user._id;
    newl.geometry=await geocodeLocation(newl.location,newl.country);
    await newl.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");


    };
module.exports.editlisting=async (req,res)=>{
    let {id}=req.params;
     const listing =await Listing.findById(id);
     if(!listing){
         req.flash("error","Listing you requested does not exist");
         res.redirect("/listings");
    }
      req.flash("success","Edited Successfully");
     res.render("edit.ejs",{listing})
}
module.exports.updateroute=async(req,res)=>{
    let {id}=req.params;
     let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing},{new:true})
     listing.geometry=await geocodeLocation(listing.location,listing.country);

     if(req.file){
        if(listing.image && listing.image.filename && listing.image.filename !== "default_listing_image" && listing.image.filename !== "listingimage"){
            await cloudinary.uploader.destroy(listing.image.filename);
        }
        listing.image={url:req.file.path,filename:req.file.filename};
     }
     await listing.save();

     res.redirect("/listings");
}
module.exports.deleteroute=async(req,res)=>{
    let {id}=req.params;
     await Listing.findByIdAndDelete(id)
      req.flash("success","Delete Successfully");
     res.redirect("/listings");
};

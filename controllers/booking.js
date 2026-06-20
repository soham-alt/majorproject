const Booking=require("../models/booking.js");
const Listing=require("../models/listing.js");

module.exports.createBooking=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);

    if(!listing){
        req.flash("error","Listing you requested does not exist");
        return res.redirect("/listings");
    }

    if(listing.owner.equals(req.user._id)){
        req.flash("error","You cannot book your own listing");
        return res.redirect(`/listings/${id}`);
    }

    const existingBooking=await Booking.findOne({listing:id,client:req.user._id});
    if(existingBooking){
        req.flash("error","You already booked this listing");
        return res.redirect(`/listings/${id}`);
    }

    await Booking.create({
        listing:id,
        client:req.user._id,
        owner:listing.owner,
    });

    req.flash("success","Listing booked successfully");
    res.redirect("/bookings");
};

module.exports.myBookings=async(req,res)=>{
    const bookings=await Booking.find({client:req.user._id}).populate("listing").populate("owner");
    res.render("bookings.ejs",{bookings});
};

module.exports.deleteBooking=async(req,res)=>{
    let {id}=req.params;
    const booking=await Booking.findById(id);

    if(!booking){
        req.flash("error","Booking does not exist");
        return res.redirect("/bookings");
    }

    if(!booking.client.equals(req.user._id)){
        req.flash("error","You cannot cancel this booking");
        return res.redirect("/bookings");
    }

    await Booking.findByIdAndDelete(id);
    req.flash("success","Booking cancelled");
    res.redirect(req.get("referer") || "/bookings");
};

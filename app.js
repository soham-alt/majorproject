if(process.env.NODE_ENV!="production"){
require('dotenv').config()
}
console.log(process.env.HELLO);
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("../MAJORPROJECT/models/listing.js");
const path=require("path");
const MONGO_url=process.env.ATLASDB_URL;
const methodoverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapasync.js");
const Expresserror=require("./utils/Expresserror.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review=require("../MAJORPROJECT/models/review.js");
const session=require("express-session");
const MongoStore = require('connect-mongo').default;
const flash=require("connect-flash");
const passport=require("passport");
const Localstategy=require("passport-local");
const User=require("../MAJORPROJECT/models/user.js");
const {isLogged,isOwner,isreviewAuthor}=require("../MAJORPROJECT/middleware.js");
const {saveredirectUrl}=require("../MAJORPROJECT/middleware.js");
const listingController=require("../MAJORPROJECT/controllers/listing.js");
const bookingController=require("../MAJORPROJECT/controllers/booking.js");
const { reviewroute, reviewdelete } = require("./controllers/review.js");
const { signupuser, loginuser, logoutuser } = require("./controllers/user.js");
const multer  = require('multer')
const{storage}=require("../MAJORPROJECT/cloudConfig.js");
const upload = multer({ storage })

main().then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log(err);
})
async function main() {
    await mongoose.connect(MONGO_url);
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodoverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store=MongoStore.create({
    mongoUrl:MONGO_url,
    crypto:{
        secret: process.env.SECRET,
    },
   touchAfter: 24 * 3600,
  });

store.on("error",()=>{
    console.log("error in mngo session ",err);

})

const sessionOptions={
    store:store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitlaized:true,
    cookie:{
        expires: Date.now() + 1000*60*60*24*3,
        maxAge: 1000*60*60*24*3,
        httpOnly:true,
    }


};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
        res.locals.error=req.flash("error");
        res.locals.currUser=req.user;
    next();
})
const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
   
    if(error){
        throw new Expresserror(400,result.error);
    }else{
        next();
    }

}
const validateReview=(req,res,next)=>{
    
    let {error}=reviewSchema.validate(req.body);
   
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new Expresserror(400,errMsg);
    }else{
        next();
    }

}


//index route 
app.get("/listings",
    wrapAsync(listingController.index));
//show route 
app.get("/listings/:id",wrapAsync(listingController.showroute));
// create route 
app.post("/listings",isLogged,upload.single("listing[image]"),validateListing,
    wrapAsync(listingController.createroute));

app.get("/listing/new",isLogged,(req,res)=>{
    
    res.render("new.ejs");
})
//edit route
app.get("/listings/:id/edit",isLogged,isOwner,wrapAsync(listingController.editlisting))

//update
app.put("/listing/:id",isLogged,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateroute))
//delete
app.delete("/listing/:id",isLogged,isOwner,wrapAsync(listingController.deleteroute))

//booking routes
app.post("/listings/:id/bookings",isLogged,wrapAsync(bookingController.createBooking));
app.get("/bookings",isLogged,wrapAsync(bookingController.myBookings));
app.delete("/bookings/:id",isLogged,wrapAsync(bookingController.deleteBooking));



app.get("/signup",(req,res)=>{
    res.render("signup.ejs")
})

app.post("/signup",wrapAsync(signupuser))

app.get("/login",(req,res)=>{
    res.render("login.ejs");
})

app.post("/login",
    saveredirectUrl,passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),loginuser);
app.get("/logout",logoutuser);

//reviews
app.post("/listings/:id/reviews",isLogged,validateReview,wrapAsync(reviewroute));
//delete review route

app.delete("/listings/:id/reviews/:reviewId",isLogged,isreviewAuthor,wrapAsync(reviewdelete));


app.use((req,res,next)=>{
    next(new Expresserror(404,"page not found"));
})
app.use((err,req,res,next)=>{
    let{statusCode=500,message="something went wrong"}=err;
    
    res.status(statusCode).render("error.ejs",{message});
})
app.listen(8080,() =>{
    console.log("server is listening to port 8080");
})

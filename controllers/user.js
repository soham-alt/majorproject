const User=require("../models/user.js");
module.exports.signupuser=async(req,res)=>{
    try {
        let{username,email,password}=req.body;
    const newuser= new User({email,username});
    const registeredUser=await User.register(newuser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
    if(err){
        next(err);
    }
    req.flash("success","Welcome !");
    res.redirect("/listings");

})
    
        
    } catch (e) {
     req.flash("error",e.message)   
     res.redirect("/signup");
    }

}
module.exports.loginuser=async(req,res)=>{
    req.flash("success","Welcome, you are logged in!");
    let redirectUrl=res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);

}
module.exports.logoutuser=(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err)
        }
        req.flash("success","logged out !");
        res.redirect("/listings");
    })
}
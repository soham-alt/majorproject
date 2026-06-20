const cloudinaryModule = require('cloudinary');
const cloudinary = cloudinaryModule.v2;
const CloudinaryStorage = require('multer-storage-cloudinary');


cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOU_DAPI_KEY,
    api_secret:process.env.CLOUD_SECRET_VALUE
})
const storage = new CloudinaryStorage({
  cloudinary: cloudinaryModule,
  params: {
    folder: 'soham_devlepoment',
    allowedFormats: ["png","jpg","jpeg"],
    
  },
});

module.exports={
    cloudinary,
    storage,
};
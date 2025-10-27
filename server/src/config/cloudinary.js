const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

const uploadImage = async (imagePath)=>{
    const options = {
        use_filename : true,
        unique_filename : false,
        overwrite : true,
        folder : "avatars",
        allowed_formats : ["jpg", "png", "jpeg"]
    };
    try {
        const result = await cloudinary.uploader.upload(imagePath,options);
        return result.public_id;
    } catch (error) {
        console.log(error);
    }
}

module.exports = uploadImage;
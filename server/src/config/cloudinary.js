const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

const uploadImage = (fileBuffer)=>{
    return new Promise((resolve, reject)=>{
        const stream = cloudinary.uploader.upload_stream({
            folder : "avatars",
            allowed_formats: ["jpg", "png", "jpeg"],
            overwrite: true,
        }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
        const readableStream = new Readable();
        readableStream.push(fileBuffer);
        readableStream.push(null);
        readableStream.pipe(stream);
    })
}

module.exports = uploadImage;
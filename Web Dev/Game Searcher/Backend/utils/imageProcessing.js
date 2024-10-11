const multer=require('multer');
const sharp=require('sharp');
const appError=require('./appError');
const catchAsyncWrapper = require('./catchAsyncWrapper');
const fs=require('node:fs/promises');
const path=require('path');

const multerStorage=multer.memoryStorage();

const multerFilter=(req, file, cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null, true);
    }
    else{
        cb(new appError('Uploaded file must be an image', 400), false);
    }
}

const upload=multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

const resizeImage=async (imageFile, filename, dims)=>{
    await sharp(imageFile).resize(dims).toFormat('jpeg').jpeg({quality: 90}).toFile(filename);
}

const getFileNumDir=async(dirPath)=>{
    let numFiles;
    try{
        const files= await fs.readdir(path.join(__dirname, dirPath));
        numFiles=files.length;
    }
    catch(err){
        await fs.mkdir(path.join(__dirname, dirPath));
        numFiles=0;
    }

    return(numFiles);
}

//function to resize any images that might be uploaded on forms to the api
const resizeImages=(resourceName, fieldNames, dimList, idFieldLocation, id) =>{
    return(catchAsyncWrapper(async (req, res, next)=>{
        const dirPath=`public/img/${resourceName}/${req[idFieldLocation][id]}`;
   
        let imageNum=await getFileNumDir('../'+dirPath)+1;
        //For each field that has an image
        await Promise.all(fieldNames.map(async (fieldName, index)=>{
            //If there are files in the field 
            if(req.files[fieldName]){
                req.body[fieldName]=[];
                //for each file
                const dims=dimList[index];
                await Promise.all (req.files[fieldName].map(async image=>{
                    const imageName=`${req[idFieldLocation][id]}-img-${imageNum}.jpeg`
                    const fileName=path.join(dirPath,imageName);
                    //Resize it 
                    await resizeImage(image.buffer, fileName, dims);
                    //Put the name of the image on the list of names
                    req.body[fieldName].push(imageName);
                    imageNum+=1;
                }));
                if(req.files[fieldName].length===1){
                    req.body[fieldName]=req.body[fieldName][0];
                }
            }
            
            
        }));
        next(); 
    }));
}

module.exports={
    upload,
    resizeImages
}
const express = require("express");
const routers = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const libre = require('libreoffice-convert');
let toPdf = require("office-to-pdf")
const {json} = require("express");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
        );
    },
});



const docsToPDF = (req , file , callback) => {
    let ext = path.extname(file.originalname)


    console.log(ext )

    if(ext !== '.docx' && ext !== '.doc' ){
        return callback('this is not supported')
    }

    callback(null , true)
}



const docxToPDF = multer({
    storage: storage,
    fileFilter : docsToPDF
});



const pdfToDocxFilter = (req , file , callback) => {
    var ext = path.extname(file.originalname)

    if(ext !== '.pdf' ){
        return callback('not supported')
    }
    callback(null , true)
}

const pdfToDocx = multer({
    storage: storage,
    fileFilter : pdfToDocxFilter
});





routers.post('/down', docxToPDF.single('file') ,(req, res)=>{
    console.log(req.file)


    const file =  fs.readFileSync(req.file.path)
    let outputFilePath = Date.now() + "output.pdf"


    libre.convert(file , '.pdf' , undefined , async (err , done) => {
        if(done){

            res.status(200).json({
                message : 'err',
            })
        }

        try {
           await fs.writeFileSync(`./uploads/${outputFilePath}`, done)
            res.status(200).json({
                message : outputFilePath,
            })

        }catch(err){
            res.status(200).json({
                message : 'catch',

            })
        }

    })



})



routers.post("/fileUpload",  docxToPDF.single('file') ,(req , res) => {
    if(req.file){
        const file =  fs.readFileSync(req.file.path)
        let outputFilePath = Date.now() + "output.pdf"

        libre.convert(file , '.pdf' , undefined , (err , done) => {
            if(err){
                // fs.unlinkSync(req.file.path)
                // fs.unlinkSync(outputFilePath)

                res.send('some error has taken in convertion')
            }
            const npth = path.join(__dirname + `/uploads/${outputFilePath}`)
            console.log({npth})
            try {
                fs.writeFileSync(npth, done)
                console.log(done)

            }catch(err){
                console.log(({err}))
            }
            res.download(npth , (err , done) => {
                if(err){
                    console.log({err})
                    // fs.unlinkSync(req.file.path)
                    // fs.unlinkSync(outputFilePath)

                    res.send('some error has taken in download ')
                }
                // fs.unlinkSync(req.file.path)
                // fs.unlinkSync(`./uploads/${outputFilePath}`)

            })
        } )

    }



});



routers.post('/officetopdf' , pdfToDocx.single('file') , async (req , res) => {
    let path = `./${req.file.path}`
    var wordBuffer = fs.readFileSync(path)

    var pdfBuffer = await toPdf(wordBuffer)

    res.send(pdfBuffer)

} )


module.exports = routers
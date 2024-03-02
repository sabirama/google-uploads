import express from "express";
import multer from "multer";
import cors from "cors";
import "dotenv/config";

import { uploadFile, generatePublicUrl } from "./src/routes/googleEndpoint.js";

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, "storage/images")
    },
    filename: function (req, res, cb) {
        
        cb(null, Date.now() + "-" + res.originalname)
    }
})
const upload = multer({ storage });

const host = process.env.APP_HOST || 'http://localhost';
const port = process.env.PORT || 3000;
const app = express();

app.use(cors({origin: "*"}));

app.get("/", (req, res) => {
    res.send("GOOGLE UPLOAD IMAGES");
});

app.post("/api/image", upload.single("image"), async (req, res) => {
    const file = req.file;
    if (file) {
        const data = await uploadFile(file.filename, file.mimetype, `./storage/images/${file.filename}`, (err, response) => {
            if (err) {
            return err;
            }
            else {
             return response.data;
            }
         })
         generatePublicUrl(data.id, (err, data)=> {
             if (err) {
                 res.send(err)
             } else {
                 return res.send(data.data);
             }
         })
    }
    else {
        res.status(403);
        res.send("No valid image");
    };
})

app.listen(port, () => {
    console.log(`SERVER RUNNING AT ${host}:${port}`);
})
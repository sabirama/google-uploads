import { google } from "googleapis";
import { createReadStream } from 'fs';
import "dotenv/config"

const auth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)

const drive = google.drive({
    version: 'v3',
    auth: auth2 
})

const folderId = process.env.GOOGLE_FOLDER_ID;

auth2.setCredentials({refresh_token: process.env.GOOGLE_REFRESH_TOKEN});


export const uploadFile = async (filename, mimetype, filepath, cb) => {
    //takes in file = String(filepath) to upload file.
    try {
        const response = await drive.files.create({
            requestBody: {
                parents: [folderId],
                name: filename,
                mimeType: mimetype
            },
            media: {
                body: createReadStream(filepath),
                mimeType: mimetype
            }
        })
        return cb(null,response);
    }
    catch(error) {
        return cb(error, null);
    }
}

export const deleteFile = async (file, cb) => {
    //takes in an image id from google = String(file) to delete file.
    try {
        const response = await drive.files.delete({
            fileId: file,
        })
        return cb(null, response);
    }
    catch(error) {
        return cb(error, null)
    }
}

export const generatePublicUrl = async (imageId, cb) => {
    try {
        //first edit permission for file in google drive into public
        const create = await drive.permissions.create({
            fileId: imageId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        })
        //then create a URI 
        if (create) {
            const result = await drive.files.get({
                fileId: imageId,
                fields: 'webViewLink, webContentLink, id'
            })
            return cb(null, result);
        }   
    }
    catch(error) {
        return cb(error, null);
    }
}

export default { uploadFile, deleteFile, generatePublicUrl };
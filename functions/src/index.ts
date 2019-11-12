import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);
const ref = admin.database().ref();
import * as _ from 'lodash'
// import { google } from 'googleapis'
import * as fs from 'fs-extra'
import * as sharp from 'sharp';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
const {Storage} = require('@google-cloud/storage');
const gcs = new Storage();

// const serviceAccount = require('../serviceAccount.json')
// const jwtClient = new google.auth.JWT({
//     email: serviceAccount.client_email,
//     key: serviceAccount.private_key,
//     scopes: [ 'https://www.googleapis.com/auth/spreadsheets',
//             'https://www.googleapis.com/auth/documents',
//             'https://www.googleapis.com/auth/presentations',
//             'https://www.googleapis.com/auth/drive'
//     ],  // read and write sheets
// })
// const jwtAuthPromise = jwtClient.authorize().then(function(auto){
//     console.log(auto)
// })
// const sheets = google.sheets('v4');
// const slides = google.slides({version:'v1',auth: jwtClient});
// const Gdocs = google.docs({version: 'v1',auth:  jwtClient});
// const drive = google.drive({version:'v3',auth: jwtClient});

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// --- Crear Usuarios Email/Pass ---------------------------------------------------
    exports.creaUsuarios = functions.https.onCall((data, context) => {
        // console.log('Usuario que solicita creacion:',context.auth.token)
        return admin.auth().createUser({
            email: data.email,
            emailVerified: false,
            password: data.password,
            displayName: data.displayName,
            disabled: false
        }).then((userRecord)=> {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log("Successfully created new user:", userRecord.uid);
            let claims = {super:false, admin: false, empleado:false, usuario:true}
            switch (data.rol) {
                case 'super':
                    claims = {super:true, admin: true, empleado:false, usuario:false}
                    break;
                case 'admin':
                    claims = {super:false, admin: true, empleado:false, usuario:false}
                    break;
                case 'empleado':
                    claims = {super:false, admin: false, empleado:true, usuario:false}
                    break;
                case 'usuario':
                    claims = {super:false, admin: false, empleado:false, usuario:true}
                    break;
            }
            return admin.auth().setCustomUserClaims(userRecord.uid, claims ).then(() => {
                console.log("Successfully created Claims to new user:",data, userRecord);

                ref.child(data.rol + '/' + userRecord.uid).set({
                    email: userRecord.email,
                    emailVerified: userRecord.emailVerified,
                    rol: data.rol,
                    nombre: data.nombre,
                    telefono: data.telefono,
                    cedula: data.cedula,
                    barrio: data.barrio,
                    direccion: data.direccion
                }).then(()=>{console.log('ok')}).catch((error)=>{console.log('error',error)})

                console.log('Usuario '+userRecord+' creado correctamente y sus claims tambien')
                return userRecord.uid
            }).catch(function (error) {
                console.error("Error creando los claims:", error);
                throw new functions.https.HttpsError(error.code, error);
                // return error;
            });
        }).catch((error)=> {
            console.error("Error creating new user:", error);
            // return error;
            if(error.code === 'auth/email-already-exists'){
                throw new functions.https.HttpsError('invalid-argument', 'La direccion de email ya esta en uso por otra cuenta de usuario');
            }else if(error.code === 'auth/invalid-email'){
                throw new functions.https.HttpsError('invalid-argument', 'Formato incoorecto para el email');
            }else{
                throw new functions.https.HttpsError(error.code, error);
            }
        });
    });
    exports.actualizaUsuarios = functions.https.onCall((data, context) => {
        // console.log('Usuario que solicita creacion:',context.auth.token)
        actualizaUsuario(data).then(()=>{console.log('ok')}).catch((error)=>{console.log('error',error)})
    });
    exports.SetSuper = functions.https.onCall((data, context) => {
        // const superUID = 'GZrOk0nDv5W7CSXRYP92uSKldRt2';
        const claims = {super:true, admin: false, empleado:false, usuario:false}
        return admin.auth().setCustomUserClaims(data, claims ).then(() => {
            // The new custom claims will propagate to the user's ID token the
            // next time a new one is issued.
            console.log("Successfully created Claims to new Super:",data);
            ref.child('super/' + data + '/rol').set('super').then(()=>{console.log('ok')}).catch((error)=>{console.log('error',error)})
            ref.child('n/' + data + '/rol').set('super').then(()=>{console.log('ok')}).catch((error)=>{console.log('error',error)})
            return {
                result:`Successfully created new Super: ${data}`
            }
        }).catch(function (error) {
            // console.log("Error creating new user:", error);
            // return error;
            throw new functions.https.HttpsError('unknown', error.message, error);
        });
    });
    function actualizaUsuario(data:any){
        console.log("Updated user:", data);
        let claims = {super:false, admin: false, empleado:false, usuario:true}
        switch (data.rol) {
            case 'super':
                claims = {super:true, admin: true, empleado:false, usuario:false}
                data.zona = 'todas'
                break;
            case 'admin':
                claims = {super:false, admin: true, empleado:false, usuario:false}
                break;
            case 'empleado':
                claims = {super:false, admin: false, empleado:true, usuario:false}
                break;
            case 'usuario':
                claims = {super:false, admin: false, empleado:false, usuario:true}
                break;
        }
        return admin.auth().setCustomUserClaims(data.uid, claims ).then(() => {
            // The new custom claims will propagate to the user's ID token the
            // next time a new one is issued.
            console.log("Successfully updated Claims to user:",data);
            ref.child(data.rol + '/' + data.uid).update({
                email: data.email,
                rol: data.rol,
                nombre: data.nombre,
                telefono: data.telefono,
                cedula: data.cedula,
                barrio: data.barrio,
                direccion: data.direccion
            }).then(()=>{console.log('ok')}).catch((error)=>{console.log('error',error)})
            
            return {
                result:`Successfully updated user: ${data}`
            }
        }).catch(function (error) {
            // console.log("Error creating new user:", error);
            // return error;
            throw new functions.https.HttpsError('unknown', error.message, error);
        });
    }
// ---- Imagenes -------------------------------------------------------------------
    export const generateThumbs = functions.storage
    .object()
    .onFinalize(async function (object:any){
        const bucket = gcs.bucket(object.bucket);
        const filePath:any = object.name;
        const fileName = filePath.split('/').pop();
        const bucketDir = dirname(filePath);

        const workingDir = join(tmpdir(), 'thumbs');
        const tmpFilePath = join(workingDir, 'source.png');

        if (fileName.includes('thumb@') || !object.contentType.includes('image')) {
            console.log('exiting function');
            return false;
        }

        // 1. Ensure thumbnail dir exists
        await fs.ensureDir(workingDir);

        // 2. Download Source File
        await bucket.file(filePath).download({
            destination: tmpFilePath
        });

        // 3. Resize the images and define an array of upload promises
        const sizes = [64, 128, 256];

        const uploadPromises = sizes.map(async size => {
            const thumbName = `thumb@${size}_${fileName}`;
            const thumbPath = join(workingDir, thumbName);

            // Resize source image
            await sharp(tmpFilePath)
                .resize(size, size)
                .toFile(thumbPath);

            // Upload to GCS
            return bucket.upload(thumbPath, {
                destination: join(bucketDir, thumbName)
            });
        });

        // 4. Run the upload operations
        await Promise.all(uploadPromises);

        // 5. Cleanup remove the tmp/thumbs from the filesystem
        return fs.remove(workingDir);
    });
// ---------------------------------------------------------------------------------

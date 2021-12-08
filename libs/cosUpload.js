'use strict';

module.exports = function (app) {
    const config = app.get('config');
    const Busboy = app.get('busboy');
    const StreamUpload = app.get('stream_upload');
    const path = require('path');
    const logger = app.get('logger');
    const uuid = app.get('uuid');
    const { finished } = require('stream');

    const _drainStream = function (stream) {
        stream.on('readable', stream.read.bind(stream));
    };

    const _upload = function (req, folderName) {
        const appDir = __dirname.replace('/libs', '/public/uploads');

        const baseFolder = config.storage.baseFolder || appDir;
        const baseURL = config.storage.baseURL || (config.url.api + '/uploads/');

        let subFolder = folderName || '';
        const uploader = new StreamUpload({
            extensions: config.storage.allowedFileTypes,
            types: config.storage.allowedMimeTypes,
            maxSize: config.storage.maxFileSize,
            baseFolder: baseFolder,
            storage: config.storage
        });

        const storageConfig = config.storage;
        let busboy;
        if (storageConfig) {
            return new Promise (function (resolve, reject) {
                try {
                    busboy = new Busboy({
                        headers: req.headers,
                        limits: {
                            fileSize: config.storage.maxFileSize
                        }
                    });
                } catch (error) {
                    logger.error('UPLOAD ERROR', error);

                    return reject(error);
                }

                let isDone;
                let uploadResult;
                const newFileName = uuid.v4();
                let accessPath = '';
                let formdata = {};
                let errors = false;
                busboy.on('field', function (key, value) {
                    formdata[key] = value;
                })
                busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
                    let savedFilename = path.join(subFolder, newFileName + path.extname(filename));
                    if (!config.storage.type || config.storage.type === 'local') {
                        accessPath = new URL(savedFilename, baseURL);
                        savedFilename = path.join(baseFolder, savedFilename);
                    }

                    file.on('error', function (error) {
                        if (!errors){
                            busboy.emit('error', error);
                            errors = true;
                        }
                    });

                    file.on('limit', function (err) {
                        if (!errors){
                            uploader.deletePartials();
                            const error = new Error('File too large');
                            error.type = 'fileSize';
                            error.statusCode = 403;
                            busboy.emit('error', error)
                            errors = true;
                        }
                    });

                    uploadResult = uploader.upload(file, {
                        type: mimetype,
                        filename: savedFilename
                    });

                });

                busboy.on('error', function (error) {
                    logger.error('UPLOAD ERROR', error);
                    if (isDone) return;
                    isDone = true;

                    req.unpipe(busboy);
                    _drainStream(req);
                    busboy.removeAllListeners();

                    return reject(error);
                });
                busboy.on('finish', async function () {
                    if (uploadResult) {
                        try {
                            let data = await uploadResult;
                            if (accessPath) {
                                data.filename = accessPath.href;
                            }
                            formdata.link = data.filename;
                            formdata.size = data.size;
                            return resolve(formdata);
                        } catch (err) {
                            return reject(err);
                        };
                    }

                });
                req.pipe(busboy);
            });
        }

    };

    return {
        upload: _upload
    }
};
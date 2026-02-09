const setUploadConfig = (folder, allowedTypes) => {
    return (req, res, next) => {
        req.uploadFolder = folder;
        req.allowedTypes = allowedTypes;
        next();
    };
};

module.exports =  setUploadConfig ;
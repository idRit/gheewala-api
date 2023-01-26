const jwt = require('jsonwebtoken');

module.exports.tokenVerify = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({
            message: "No token provided"
        });
    }
    jwt.verify(token, "ggwp", (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        req.userId = decoded._id;
        next();
    });
};

module.exports.adminTokenVerify = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({
            message: "No token provided"
        });
    }
    jwt.verify(token, "ggwp-admin", (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        req.userId = decoded._id;
        next();
    });
}
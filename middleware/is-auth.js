const jwt = require('jsonwebtoken');
module.exports = (req, res, next)=> {
    const token = req.headers.authorization.split(' ')[1];
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, 'companysecret')
    }catch(err){
        err.statusCode = 500;
        // throw err;
    } 
    if(!decodedToken) return res.status(401).json({message: 'wrong token information'})
    req.userInfo = decodedToken
    next();
}
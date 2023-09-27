const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        const token =  req.header('Authorization').replace('Bearer ', '');
        const decode =  jwt.verify(token, process.env.JWT_SECRET);
   

        //decode={ _id: '65081857f0e6c593b8bb010e', iat: 1695029405 }
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token });
        if (!user) {
            throw new Error();
        }
        req.token = token;
        req.user = user;
        next();
    }
    catch (e) {
        res.status(401).send({ error: "Please authenticates first", e });
    }
}

module.exports = auth;
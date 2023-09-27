const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_CONNECTIONSTRING, {
    useNewUrlParser: true
});
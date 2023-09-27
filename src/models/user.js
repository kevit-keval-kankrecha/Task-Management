const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Task = require('../models/task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        default: 0
        //min: [18, 'Age must be Greater than 18'],
        //max: [28, 'Age must be Less than 25'],
    },
    email: {
        required: true,
        unique: true,
        type: String,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Please Provide an Appropriate Email Address');
            }
        },
        trim: true,
        lowercase: true
    },
    password: {
        required: true,
        type: String,
        trim: true,
        minlength: [7, "Password having at least 7 characters"],
        validate(value) {
            if (validator.contains(value.toLowerCase(), 'password')) {
                throw new Error(`Password should not be 'Password'`);
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'owner'
});

//generate authentication token
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

//check authentication 
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Unable to Login");
    }
    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
        throw new Error("Unable to Login");
    }
    return user;
}

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}

//hash the plain text to password before saving
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

//Delete all the task of deleted user
userSchema.post('findOneAndDelete', async function (user) {
    await Task.deleteMany({ owner: user._id });
});

const User = mongoose.model('Users', userSchema);
module.exports = User;
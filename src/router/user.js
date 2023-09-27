const express = require('express');
const User = require('../models/user');
require('../db/mongoose');
const auth = require('../middleware/auth');
const Task = require('../models/task');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendDeleteAccountEmail } = require('../emails/account');


const router = new express.Router();

router.post('/users', async (req, res) => {
    const newUser = new User(req.body);
    try {
        await newUser.save();
        sendWelcomeEmail(req.body.email, req.body.name);
        const token = await newUser.generateAuthToken();
        res.status(201).send({ newUser, token });
    }
    catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).send(users);
    }
    catch (error) {
        res.status(500).send(error);
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.status(200).send({ user, token });
    }
    catch (e) {
        res.status(400).send(e);
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        });
        await req.user.save();
        res.send();
    }
    catch (error) {
        res.status(500).send(error)
    }
});

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        res.send(req.user.tokens);
        await req.user.save();
        res.send("Logout all tokens");
    }
    catch (error) {
        res.status(500).send(error)
    }
});

const upload = multer({
    //dest:"Directory name to direct store an image"
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            cb(new Error('Please Provide a valid image'));
        }
        cb(undefined, true);
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({
        width: 250,
        height: 250
    }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save()
    res.status(200).send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    req.user.save();
    res.send(req.user);
});

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

router.patch('/users/me', auth, async (req, res) => {
    const reqKeys = Object.keys(req.body);

    const allowUpdateKeys = ['name', 'age', 'password', 'email'];
    const isValidUpdateOperation = reqKeys.every((key) => allowUpdateKeys.includes(key));

    if (!isValidUpdateOperation) {
        return res.status(400).send("Invalid Update Operation");
    }
    try {
        reqKeys.forEach((keytoUpdate) => req.user[keytoUpdate] = req.body[keytoUpdate]);
        await req.user.save();
        if (!req.user) {
            return res.status(400).send("No User Found For Update");
        }
        res.status(200).send(req.user);
    }
    catch (error) {
        res.status(500).send(error);
    }
});

router.delete('/users/me', auth, async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ _id: req.user._id });
        sendDeleteAccountEmail(user.email, user.name);
        if (!user) {
            return res.status(400).send('User Not Found');
        }
        res.status(200).send(req.user);
    }
    catch (error) {
        res.status(500).send(error);
    }
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar);
    }
    catch (e) {
        res.status(404).send(e);
    }
});


module.exports = router;
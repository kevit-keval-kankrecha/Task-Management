const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
require('../db/mongoose');


const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    try {
        //const newTask = await new Task(req.body);
        const newTask = new Task({
            ...req.body,
            owner: req.user._id
        })
        await newTask.save();
        res.status(201).send(newTask);
    }
    catch (error) {
        res.status(500).send(error);
    }
});

//GET /tasks?completed=true
//GET /tasks?limit=2&skip=0---first 2 
//GET /tasks?limit=2&skip=2---skip first 2 and then return next 2
//GET /tasks?sortBy=createdAt:desc/asce
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const srt = {};
    if (req.query.completed) {
        match['completed'] = req.query.completed === 'true'
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        srt[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        let tasks;
        if (match.hasOwnProperty('completed')) {
            tasks = await Task.find(
                {
                    owner: req.user._id,
                    completed: match.completed
                }
            ).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip)).sort(srt);
        }
        else {
            tasks = await Task.find(
                {
                    owner: req.user._id
                }
            ).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip)).sort(srt);
        }
        res.status(200).send(tasks);
    }
    catch (error) {
        res.status(500).send(error);
    }


});

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        //const task = await Task.findById(_id);
        const task = await Task.findOne({ _id: _id, 'owner': req.user._id });
        if (!task) {
            return res.status(404).send("No Such Task Found");
        }
        res.status(200).send({ task });
    }
    catch (error) {
        res.status(500).send(error);
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const reqKeys = Object.keys(req.body);
    const allowUpdateKeys = ['description', 'completed'];
    const isValidUpdateOperation = reqKeys.every((key) => allowUpdateKeys.includes(key));
    if (!isValidUpdateOperation) {
        return res.status(400).send("Invalid Update Operation");
    }
    try {
        const updatedTask = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        //const updatedTask= await Task.findByIdAndUpdate(req.params.id, req.body, {new:true,runValidators:true});
        //const updatedTask= await Task.findById(req.params.id);
        if (!updatedTask) {
            return res.status(400).send("No Task Found For Update");
        }
        reqKeys.forEach((keyToUpdate) => updatedTask[keyToUpdate] = req.body[keyToUpdate]);
        updatedTask.save();
        res.status(200).send(updatedTask);
    }
    catch (error) {
        res.status(500).send(error);
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send('Task Not Found');
        }
        res.status(200).send("Task Deleted SuccessFully");
    }
    catch (error) {
        res.status(500).send(error);
    }
});


module.exports = router;

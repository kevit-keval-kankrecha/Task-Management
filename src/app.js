const express = require('express');
require('./db/mongoose');
const userrouter=require('../src/router/user');
const taskroute=require('../src/router/task'); 

const app = express();

app.use(express.json());
app.use(userrouter);
app.use(taskroute);

module.exports=app;





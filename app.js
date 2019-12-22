const Express = require('express');
const routes = require('./routes/index');


const app = Express();
app.use('/', routes)

module.exports = app;
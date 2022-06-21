'use strict';

import http from 'http';
import express from 'express';
import routes from './routes';

express.static('./');

const app = express();

app.use(express.static('public'));
app.use('/', routes);



http.createServer(app).listen(8080);
console.log("image server started in port 8080");
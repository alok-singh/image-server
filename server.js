'use strict';

import http from 'http';
import express from 'express';
import path from 'path';
import fs from 'fs';
import routes from './routes';

const app = express();

app.use('/', routes);

http.createServer(app).listen(8080);
console.log("image server started in port 8080");
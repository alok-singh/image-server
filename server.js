'use strict';

import http from 'http';
import express from 'express';
import path from 'path';
import fs from 'fs';

// import {imageMagicController} from './Controllers'

const app = express();

app.get('/:transformations/*', function(req, res) {
	console.log(req.params.transformations);
});

const sendTo404 = (res) => {
	res.writeHead(404, {'Content-Type': 'text'});
	res.write("404 Not found");
	res.end();
}


http.createServer(app).listen(8080);
console.log("image server started in port 8080");
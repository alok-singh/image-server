import express from 'express';
import {imageMagicController} from './controllers/imageMagicController';
import {pdfConverterController} from './controllers/pdfConverterController';
import fs from 'fs';

const routes = express();

routes.get('/robots.txt', (req, res) => {
	res.writeHead(200, 'text');
	res.write('robots');
	res.end();
})

routes.get('/test', (req, res) => {
	res.writeHead(200, 'text/html');
	res.write(fs.readFileSync('./test.html'));
	res.end();
})

routes.get('/pdf', (req, res) => {
	pdfConverterController(req, res);
})

routes.get(['/:transformations/*', '/:fileName'], (req, res) => {
	imageMagicController(req, res);
});

export default routes;
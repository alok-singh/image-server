import express from 'express';
import {imageMagicController} from './controllers/imageMagicController';

const routes = express();

routes.get('/robots.txt', (req, res) => {
	res.writeHead(200, 'text');
	res.write('robots');
	res.end();
})

routes.get(['/:transformations/*', '/:fileName'], (req, res) => {
	imageMagicController(req, res);
});

export default routes;
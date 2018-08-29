import express from 'express';
import {imageMagicController} from './controllers/imageMagicController';

const routes = express();

routes.get(['/:transformations/*', '/:fileName'], (req, res) => {
	imageMagicController(req, res);
});

export default routes;
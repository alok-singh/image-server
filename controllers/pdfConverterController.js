import Canvas from 'canvas';
import fs from 'fs';
import path from 'path';
import { getScreenShotFromUrl } from './puppeteer';

export const pdfConverterController = async (req, res) => {
	const { query } = req;
	const { url, height, width } = query;
	const fileName = url.split('/').pop().split('.').shift();
	const saveAddress = path.resolve('./temp', `${fileName}.png`);

	const imageSavedSuccessfully = await getScreenShotFromUrl(url, saveAddress, height, width);

	if (imageSavedSuccessfully) {
		fs.readFile(saveAddress, (err, data) => {
			if (err) {
				res.writeHead(500, { 'content-type': 'text' });
				res.write(err);
				res.end();
				throw err;
			}

			const img = new Canvas.Image();
			img.src = data;

			const canvas = new Canvas.Canvas(img.width, img.height, 'pdf');
			const ctx = canvas.getContext('2d');

			ctx.drawImage(img, 0, 0, img.width, img.height);

			res.writeHead(200, { 'content-type': 'application/pdf' });
			res.write(canvas.toBuffer());
			res.end();
		});
	}
}
import puppeteer from 'puppeteer';
import path from 'path';

export const getScreenShotFromUrl = async (url, fileName, height, width) => {
	console.log({ url, fileName, height, width });
	try {
		const browserInstance = await puppeteer.launch();
		const page = await browserInstance.newPage();
		await page.goto(url);
		const data = await page.evaluate(() => ({ width: window.screen.width, height: window.screen.height }));
		const pageHeight = height ? parseInt(height) : data.height;
		const pageWidth = width ? parseInt(width) : data.width;
		await page.setViewport({ width: pageWidth, height: pageHeight, deviceScaleFactor: 2 });
		await page.screenshot({ path: fileName });
		await browserInstance.close();

		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
};
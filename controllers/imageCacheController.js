import deepFileReader from 'deep-file-reader';
import {nameDecoderService} from '../services/nameGeneratorService';

const getImageCache = () => {
	let obj = {};
	let arr = [];
	let name = '';
	deepFileReader('./cache/', ['jpg', 'webp', 'png']).map(file => {
		arr = file.split('.');
		name = arr[0].split('/').pop();
		obj[nameDecoderService(name)] = arr[1];
		console.log(name);
	});
	return obj;
}

export const imageCache = getImageCache();
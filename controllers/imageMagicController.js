import gm from 'gm';
import {defaultArguments} from './defaultArguments';
import {getDetailPromise} from '../services/imageDetailService';
import {nameEncoderService, nameDecoderService} from '../services/nameGeneratorService';
import path from 'path';
import fs from 'fs';
import {imageCache} from './imageCacheController';

const imageMagic = gm.subClass({imageMagick: true});

export const imageMagicController = (req, res, next) => {
	
	let imageDetails = {};
	let transformations = {};
	let imagePath = getImagePath(req);
	let processArray = [];
	let mainProcess = {};
	let finalImageFormat = '';
	let finalFileName = '';

	if(imageCache[req.url]){
		imagePath = `./cache/${nameEncoderService(req.url)}.${imageCache[req.url]}`;
		getFileFromPath(req, res, imagePath, {
			'Content-Type': `image/${imageCache[req.url]}`, 
			'Cache-Control': 'public, max-age=31557600'
		});
	}
	else{
		Promise.all([
			getDetailPromise(imagePath, 'size'), 
			getDetailPromise(imagePath, 'format')
		]).then(dataArr => {

			imageDetails.size = dataArr.shift();
			imageDetails.format = dataArr.shift();

			finalImageFormat = transformations.f ? transformations.f : imageDetails.format.toLowerCase()
			finalFileName = `./cache/${nameEncoderService(req.url)}.${finalImageFormat}`;

			transformations = getTransformations(req.params.transformations);
			processArray = getProcessArray(transformations, imageDetails);

			processArray.reduce((cumulativeProcess, processObj) => {
				return cumulativeProcess[processObj.name](...processObj.arguments);
			}, imageMagic(imagePath)).write(finalFileName, (error, data) => {
		    	if(error) {
		    		console.log(error);
		    		getFileFromPath(req, res, './default.webp', {
						'Content-Type': `image/webp`,
						'Cache-Control': 'public, max-age=31557600'
					}, 404);
		    	}
		    	else{
		    		getFileFromPath(req, res, finalFileName, {
						'Content-Type': `image/${finalImageFormat}`,
						'Cache-Control': 'public, max-age=31557600'
					});
		    		imageCache[req.url] = finalImageFormat;
		    	}
		    });
		}).catch(error => {
			console.log(error);
			getFileFromPath(req, res, './default.webp', {
				'Content-Type': `image/webp`,
				'Cache-Control': 'public, max-age=31557600'
			}, 404);
		});
	}

}

export const getProcessArray = (transformations, {size}) => {
	let retArray = [];
	let argList = [];
	let aspectRatio = size.width/size.height;
	let cropX = 0;
	let cropY = 0;
	
	if(transformations.h && transformations.w){
		if(transformations.h*aspectRatio > transformations.w){
			/*  if we transform image with required height 
				final width of image is more than required after resize 
			*/
			argList = [
				null,
				transformations.h
			];
			cropX = (transformations.h*aspectRatio - transformations.w)/2;
		}
		else{
			argList = [
				transformations.w
			];
			cropY = ((transformations.w/aspectRatio) - transformations.h)/2;
		}

		retArray.push({
			name: 'resize',
			arguments: argList
		},{
			name: 'crop',
			arguments: [
				transformations.h,
				transformations.w,
				cropX,
				cropY
			]
		});
	}
	else if(transformations.h || transformations.w){
		retArray.push({
			name: 'resize',
			arguments: [
				transformations.w ? transformations.w : null,
				transformations.h ? transformations.h : null 
			]
		});
	}
	if(transformations.q){
		retArray.push({
			name: 'quality',
			arguments: [transformations.q]
		});
	}
	if(transformations.b){
		retArray.push({
			name: 'blur',
			arguments: [transformations.b, 20]
		});
	}
	if(transformations.e){
		if(Array.isArray(transformations.e)){
			transformations.e.forEach(val => {
				retArray.push({
					name: val,
					arguments: defaultArguments[val] ? defaultArguments[val] : []
				});
			})
		}
		else{
			retArray.push({
				name: transformations.e,
				arguments: [1]
			});
		}
	}
	if(transformations.f){
		retArray.push({
			name: 'setFormat',
			arguments: [transformations.f]
		});
	}
	return retArray;
}

export const getImagePath = (req) => {
	let index = (req.params.transformations && req.params.transformations.indexOf('mn:') !== -1) ? 2 : 1;
	let path = `./images/${req.url.split('/').slice(index).join('/')}`;
	return path;
}


export const getTransformations = (reqParam) => {
	let transformations = '';
	let transformationObj = {};
	let propertyList = [];
	if(reqParam && reqParam.indexOf('mn:') !== -1){
		transformations = reqParam.split('mn:')[1];
		return transformations.split(',').reduce((obj, val) => {
			propertyList = val.split('-');
			if(obj[propertyList[0]] && Array.isArray(obj[propertyList[0]])){
				obj[propertyList[0]].push(propertyList[1])
			}
			else if(obj[propertyList[0]]){
				obj[propertyList[0]] = [obj[propertyList[0]]];
				obj[propertyList[0]].push(propertyList[1]);
			}
			else{
				obj[propertyList[0]] = propertyList[1];
			}
			return obj;
		}, {});
	}
	return transformationObj;
}

export const getFileFromPath = (req, res, filePath, contentType, status) => {
	fs.readFile(filePath, function(err, data){
		if(err){
			imageCache[req.url] = false;
			imageMagicController(req, res);
		}
		else{
			res.writeHead(status ? status : 200, contentType);
			res.write(data);
			res.end();
		}
	});
}

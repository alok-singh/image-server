import gm from 'gm';
import {defaultArguments} from './defaultArguments';
import {getDetailPromise} from '../services/imageDetailService';

const imageMagic = gm.subClass({imageMagick: true});

export const imageMagicController = (req, res, next) => {
	
	let imageDetails = {};
	let transformations = {};
	let imagePath = getImagePath(req);
	let processArray = [];
	
	Promise.all([
		getDetailPromise(imagePath, 'size'), 
		getDetailPromise(imagePath, 'format')
	]).then(dataArr => {

		imageDetails.size = dataArr.shift();
		imageDetails.format = dataArr.shift();

		transformations = getTransformations(req.params.transformations);
		processArray = getProcessArray(transformations, imageDetails);

		processArray.reduce((cumulativeProcess, processObj) => {
			return cumulativeProcess[processObj.name](...processObj.arguments);
		}, imageMagic(imagePath)).stream((err, stdout) => {
	        if(err) {
	        	return next(err);
	        }
			 res.writeHead(200, {
				'Content-Type': `image/${transformations.f ? transformations.f : imageDetails.format.toLowerCase()}`,
				'Cache-Control': 'public, max-age=31557600'
			});
	  		stdout.pipe(res);
	    });
		
	});

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
	let index = (req.params.transformations && req.params.transformations.indexOf('tr:') !== -1) ? 2 : 1;
	let path = `./images/${req.url.split('/').slice(index).join('/')}`;
	return path;
}


export const getTransformations = (reqParam) => {
	let transformations = '';
	let transformationObj = {};
	let propertyList = [];
	if(reqParam && reqParam.indexOf('tr:') !== -1){
		transformations = reqParam.split('tr:')[1];
		return transformations.split(',').reduce((obj, val) => {
			propertyList = val.split('-');
			if(obj[propertyList[0]]){
				obj[propertyList[0]] = [obj[propertyList[0]]];
				obj[propertyList[0]].push(propertyList[1])
			}
			else{
				obj[propertyList[0]] = propertyList[1];
			}
			return obj;
		}, {});
	}
	return transformationObj;
}

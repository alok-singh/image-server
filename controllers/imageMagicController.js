import gm from 'gm';

const imageMagic = gm.subClass({imageMagick: true});

export const imageMagicController = (req, res, next) => {
	
	let transformations = getTransformations(req.params.transformations);
	let imagePath = getImagePath(req);
	let processArray = getProcessArray(transformations);
	
	processArray.reduce((cumulativeProcess, processObj) => {
		return cumulativeProcess[processObj.name](...processObj.arguments);
	}, imageMagic(imagePath)).stream((err, stdout) => {
        if(err) {
        	return next(err);
        }
        res.writeHead(200, {
			'Content-Type': `image/${transformations.f ? transformations.f : 'jpg'}`,
			'Cache-Control': 'public, max-age=31557600'
		});
        stdout.pipe(res);
    });
}

export const getProcessArray = (transformations) => {
	let retArray = [];
	if(transformations.h || transformations.w){
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
	retArray.push({
		name: 'setFormat',
		arguments: [transformations.f ? transformations.f : 'jpg']
	});
	return retArray;
}

export const getImagePath = (req) => {
	let index = req.params.fileName ? 1 : 2;
	return `./images/${req.url.split('/').slice(index).join('/')}`;
}


export const getTransformations = (reqParam) => {
	let transformations = '';
	let transformationObj = {};
	let propertyList = [];
	if(reqParam && reqParam.indexOf('tr:') !== -1){
		transformations = reqParam.split('tr:')[1];
		return transformations.split(',').reduce((obj, val) => {
			propertyList = val.split('-');
			obj[propertyList[0]] = propertyList[1];
			return obj;
		}, {});
	}
	return transformationObj;
}
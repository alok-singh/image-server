import gm from 'gm';
const imageMagic = gm.subClass({imageMagick: true});

export const getDetailPromise = (imagePath, functionName) => {
	return new Promise((resolve, reject) => {
		imageMagic(imagePath)[functionName]((error, value) => {
			if(error){
				reject(error);
			}
			else{
				resolve(value);
			}
		});
	});
}
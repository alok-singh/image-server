const fs = require('fs');
const deepFileReader = require('deep-file-reader');
const gm = require('gm');
const imageMagic = gm.subClass({imageMagick: true});

let filteredArr = [];

const getImageList = () => {
	const fileList = deepFileReader('/Volumes/Seagate Backup Plus Drive/Data/Explicit/', ['jpg', 'webp', 'png']);
	filterFile(fileList.shift(), fileList);
}

const filterFile = (filePath, fileList) => {
	let aspectRatio = 0;
	if(!filePath){
		fs.writeFile('./filterFile.json', JSON.stringify(filteredArr, null, "    "), () => {
			console.log('done');
		});
		return;
	}
	imageMagic(filePath).size(function (err, size) {
	  	if(!err){
			aspectRatio = (size.width/size.height);
	  		if(size.width >= 1440 && size.height >= 900 && aspectRatio >= 1.6){
	    		filteredArr.push(filePath);
	  		}
	  	}
	  	console.log(fileList.length);
		filterFile(fileList.shift(), fileList);
	});
}

getImageList();
import {atob, btoa} from './encoder';

export const nameEncoderService = (url) =>{
	return btoa(url);
}

export const nameDecoderService = (name) =>{
	return atob(name);
}


// console.log(btoa('hello world'));
// console.log(atob('aGVsbG8gd29ybGQ='));
import {atob, btoa} from './encoder';

export const nameEncoderService = (url) =>{
	return btoa(url);
}

export const nameDecoderService = (name) =>{
	return atob(name);
}


// console.log(btoa('hello world'));
// console.log(atob('L21uOmgtMjAwLHctMjAwL3NodXR0ZXJzdG9ja180NDY4MDY1NTIuanBn'));
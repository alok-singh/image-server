import Canvas from 'canvas';
import fs from 'fs';
import path from 'path';
import request from 'request';

export const pdfConverterController = (req, res) => {
	let {query} = req;
	let url = query.url;
	let fileName = url.split('/').pop();

	request.head(url, function(err) {
        request(url).pipe(fs.createWriteStream(path.resolve('./temp', fileName))).on('close', () => {
			fs.readFile(path.resolve('./temp', fileName), function(err, data) {
		        if (err){
					res.writeHead(500, {'content-type' : 'text'});
			    	res.write(err);
			    	res.end();
					throw err;
		        }
		        
		        let img = new Canvas.Image(); // Create a new Image
				img.src = data;

		        let canvas = new Canvas.Canvas(img.width, img.height, 'pdf');
		        let ctx = canvas.getContext('2d');
		        
		        ctx.drawImage(img, 0, 0, img.width, img.height);

		        res.writeHead(200, {'content-type' : 'application/pdf'});
		    	res.write(canvas.toBuffer());
		    	res.end();  
		    });

        });
    });
}
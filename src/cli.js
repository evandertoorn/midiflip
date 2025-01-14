#! /usr/bin/env node

var argv = require("minimist")(process.argv.slice(2));
console.log("argv", argv)

var input_path = argv.input || argv.i;
var output_path = argv.output || argv.o;
var mess_with_percussion = argv.percussion || argv.p;
var transpose = argv.tranpose || argv.t

var fn = function(n, event){
	transpose = String(transpose)
	console.log("transpose", transpose.substring(1))
	if(transpose.substring(0,1) == "+"){
		console.log("plus")
		return n + Number(transpose.substring(1));
	}
	else if (transpose.substring(0,1) == "-"){
		console.log("minus")
		return n - Number(transpose.substring(1));
	}
	else
	{
		console.log("plus(not explicit)")
		return n + Number(transpose.substring(1));
	}

};

var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var midiflip = require("./midiflip.js");

var transform_file = function(input_path, output_path){
	console.log("Load " + input_path);
	var buffer = fs.readFileSync(input_path);
	var array_buffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
	var new_array_buffer = midiflip(array_buffer, fn, mess_with_percussion);
	var new_buffer = Buffer.from(new_array_buffer);
	var output_dir = path.dirname(output_path);
	mkdirp.sync(output_dir);
	fs.writeFileSync(output_path, new_buffer);
	console.log("Wrote " + output_path);
};

var glob = require("glob");
if(glob.hasMagic(input_path)){
	var glob_prefix = (input_path.match(/^[^*{]*/) || [""])[0];
	var files = glob.sync(input_path);
	files.forEach(function(file_path){
		var output_file_path = path.join(output_path, file_path.replace(glob_prefix, ""));
		transform_file(file_path, output_file_path);
		console.log("");
	});
}else{
	transform_file(input_path, output_path);
}

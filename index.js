const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const fs = require("fs");
const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);
var mime = require("mime-types");
const date = require("date-and-time");
var Filter = require('bad-words');
var customFilter = new Filter({ placeHolder: '*'});
var CleanCSS = require('clean-css');
var minify = require('html-minifier').minify;
var JavaScriptObfuscator = require('javascript-obfuscator');
var dd = "";
var cache = {};
var joinCache = {};
var cors = require('cors');

function _0xfdad(_0x593cb3,_0x20c6a2){var _0xfdad50=_0x20c6();return _0xfdad=function(_0x44ee78,_0x883683){_0x44ee78=_0x44ee78-0x177;var _0x54a425=_0xfdad50[_0x44ee78];return _0x54a425;},_0xfdad(_0x593cb3,_0x20c6a2);}function includeFile(_0x471ee1){var _0xf0943c=_0xfdad;eval(fs[_0xf0943c(0x177)](_0x471ee1,_0xf0943c(0x178)));}function _0x20c6(){var _0x291615=['readFileSync','utf-8'];_0x20c6=function(){return _0x291615;};return _0x20c6();}


includeFile("./include/server.js");

io.on("connection", (socket) => {
  socket.on("addPoll", (name, options, categories, desc, image, pwd) => {
		console.log("New Poll Added!");
		// if(socket) {}
		// else {
		// 	console.log("Error!")
		// 	return false
		// }
    var db = JSON.parse(fs.readFileSync("./public/database/polls.json"));
    var categories1 = [], options1 = [];
		if(categories !== "") {
    categories.split(",").forEach(e=>categories1.push(customFilter.clean(e.trim())));
		}
    options.split("\n").forEach(o => {
			if(o.trim() !== "") {
			options1.push({name:customFilter.clean(o),votes:0});
			}
		});
    var i =
      db.push({
        title: customFilter.clean(name),
        date: `${date.format(new Date(), "ddd, MMM DD YYYY")}`,
        categories: categories1,
        options: options1,
        desc: customFilter.clean(desc),
        image: (image),
        pwd: pwd,
      }) - 1;
    var item = db[i];
		fs.writeFileSync(
      "./public/database/polls.json",
      JSON.stringify(db),
      "utf-8"
    );
    io.emit("newPollAdded", i);
  });
  socket.on("votedNow", (a, b) => io.emit("votedNow", a, b));
  socket.on("confetti", (id) => io.emit("confetti", id));

  socket.on("vote", (optionID, pollID) => {
    io.emit("vote", optionID);
    var db = JSON.parse(
      fs.readFileSync("./public/database/polls.json", "utf-8")
    );
    if (db && pollID && db[pollID] && db[pollID].options[optionID]) {
      db[pollID].options[optionID].votes++;
      fs.writeFileSync("./public/database/polls.json",JSON.stringify(db),"utf-8");
    }
    io.emit("votedNow", pollID, db[pollID].options);
  });
});
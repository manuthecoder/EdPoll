const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const fs = require("fs");
const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);
const gamedirectory = path.join(__dirname, "public");
app.use(express.static(gamedirectory));
console.log(gamedirectory)
// app.get('/', function (req, res) {
// 	req.url = "./public" + req.url;
// 	if(req.url == "./public/") {
// 		req.url = req.url + "index.html"
// 	}
// 	console.log(req.url)
//   res.send(fs.readFileSync(req.url).toString)
// })
httpserver.listen(3000);

// const io = require("socket.io")(3000);

io.on("connection", (socket) => {

	socket.on("message", (data) => {
		console.log(data);
	});
	socket.on("votedNow", function(a,b) {
		console.log("votedNow")
		io.emit("votedNow",a,b)
	})
	socket.on("vote", (optionID, pollID) => {
		console.log(optionID);
		io.emit("vote", optionID);
		var db = JSON.parse(fs.readFileSync("./public/database/polls.json", "utf-8"));
		if (db[pollID].options[optionID]) {
			db[pollID].options[optionID].votes += 1;
			console.log(db[pollID].options[optionID].votes)
			fs.writeFileSync("./public/database/polls.json", JSON.stringify(db), "utf-8")
		}
		io.emit("votedNow", pollID, db[pollID].options)
	});
});
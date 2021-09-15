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
app.get("/", (req, res, next) => { next(); });

var _logger = (req, res, next) => {
  next();
  var url = __dirname + "/public" + req.url || "";
  if (url.endsWith("/") || !url.includes(".")) {
    url += "/";
    url = url + "index.html";
  }
  console.log(url);
	var isPoll = false;
  if (url.includes("/v/") && url !== "/home/runner/beta/public/v/style.css" && url !== "/home/runner/beta/public/v/app.js") {
		isPoll = true;
    var $_GET = url.split("/v/");
    req.query.id = $_GET[1];
    req.query.embed = "true";
    url = $_GET[0] + "/v/index.html";
    url = url;
  }
	if (url.includes("/e/") && url !== "/home/runner/beta/public/v/style.css" && url !== "/home/runner/beta/public/v/app.js") {
		isPoll = true;
    var $_GET = url.split("/e/");
    req.query.id = $_GET[1];
    url = $_GET[0] + "/v/index.html";
    url = url;
  }
  if (url.includes("/r/")) {
		isPoll = true;
    var $_GET = url.split("/r/");
    req.query.results = $_GET[1];
    url = $_GET[0] + "/v/index.html";
    url = url;
  }
	if (url.includes("/d/")) {
		isPoll = true;
    var $_GET = url.split("/d/");
    req.query.results = $_GET[1];
    url = $_GET[0] + "/delete.html";
    url = url;
  }
	if (url.includes("/j/")) {
    var $_GET = url.split("/j/");
    req.query.id = $_GET[1];
    url = $_GET[0] + "/add/index.html";
    url = url;
  }
  res.setHeader("Content-Type", mime.lookup(path.extname(url)));
	var content = fs.readFileSync(url, { encoding: "utf-8" }).toString();
	if(isPoll == true) {
		var dbPolls = JSON.parse(fs.readFileSync(__dirname + "/public/database/polls.json"));
		var id = $_GET[1].replace(/\D/g,'');
		if(dbPolls[id]) {
			content = content.split("${__vars/title}").join( dbPolls[id].title);
			content = content.split("${__vars/description}").join(dbPolls[id].desc);
			if(dbPolls[id].image) {
				content = content.split("${__vars/banner}").join(dbPolls[id].image.toString().replace("?w=500", "") || "https://i.ibb.co/4jQj7tF/s.png");
			}
			else {
					content = content.split("${__vars/banner}").join("https://i.ibb.co/4jQj7tF/s.png");
			}
			content = content.split("${__vars/id}").join(id);
		}
	}
	if(path.extname(url) == ".css") {
		var input = content;
		var options = {};
		content = new CleanCSS(options).minify(input).styles
	}
	else if(path.extname(url) == ".html") {
		var result = minify(content, {
			removeAttributeQuotes: true,
			minifyJS: true,
			collapseWhitespace: true,
			continueOnParseError: true,
			minifyCSS: true,
		});
		content = result.replace(/(\r\n|\n|\r)/gm, "").trim();
	}
	else if(path.extname(url) == ".js") {
		var result = minify(`<script id="DEL_TAG_SCRIPT">
		${content}
		</script>`, {
			minifyJS: true,
		});
		result = result.replace(`<script id="DEL_TAG_SCRIPT">`, "")
		result = result.replace(`</script>`, "")
		content = result.trim().replace(/(\r\n|\n|\r)/gm, "").trim();
	}
	else if(path.extname(url) == ".json" && req.header("Authorization") !== "Bearer f6ae2f01") {
		res.redirect("https://http.cat/403");
		return false;
	}
  res.send(content);
  res.end();
};

app.use(_logger);

httpserver.listen(3000);
io.on("connection", (socket) => {
  socket.on("addPoll", (name, options, categories, desc, image, pwd) => {
    var db = JSON.parse(fs.readFileSync("./public/database/polls.json"));
    var categories1 = [];
    var options1 = [];
		if(categories !== "") {
    categories.split(",").forEach((data) => {
      categories1.push(customFilter.clean(data.trim()));
    });
		}
    options.split("\n").forEach((data) => {
      options1.push({
        name: customFilter.clean(data),
        votes: 0,
      });
    });
    var testRowIndex =
      db.push({
        title: customFilter.clean(name),
        date: `${date.format(new Date(), "ddd, MMM DD YYYY")}`,
        categories: categories1,
        options: options1,
        desc: customFilter.clean(desc),
        image: (image),
        pwd: pwd,
      }) - 1;
    var item = db[testRowIndex];
		fs.writeFileSync(
      "./public/database/polls.json",
      JSON.stringify(db),
      "utf-8"
    );
    io.emit("newPollAdded", testRowIndex);
  });
  socket.on("votedNow",  (a, b) => {
    io.emit("votedNow", a, b);
  });
	socket.on("confetti",  (id) => {
    io.emit("confetti", id);
  });
  socket.on("vote", (optionID, pollID) => {
    io.emit("vote", optionID);
    var db = JSON.parse(
      fs.readFileSync("./public/database/polls.json", "utf-8")
    );
    if (db && pollID && db[pollID] && db[pollID].options[optionID]) {
      db[pollID].options[optionID].votes += 1;
      fs.writeFileSync("./public/database/polls.json",JSON.stringify(db),"utf-8");
    }
    io.emit("votedNow", pollID, db[pollID].options);
  });
});


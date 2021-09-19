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
var dd = ""

var cors = require('cors')
app.use(cors())

app.get("/", (req, res, next) => next());

var _logger = (req, res, next) => {
  next();
  var url = __dirname + "/public" + req.url || "";
	if(url !== "" && req.headers.host == "joinmypoll.ml") {
			var urll = __dirname + "/public/" + req.url;
			res.setHeader("Content-Type",  mime.lookup(path.extname(urll)));
			console.log(urll)
			if(urll == __dirname + "/public/" + "/") {
				urll = __dirname + "/public/join.html"
			}
			var cc = fs.readFileSync(urll).toString();
			cc = minify(cc, {
			removeAttributeQuotes: true,
			minifyJS: true,
			collapseWhitespace: true,
			continueOnParseError: true,
			minifyCSS: true,
		});
			cc = cc.split("${__vars/hostname}").join(req.headers.host)
			res.write(cc);
			res.end();
			return false;
	}
	else if(url.includes("/api")) {
		var d = JSON.parse(fs.readFileSync("./public/database/polls.json").toString());
		if(d[req.query.id]) {
			res.write("true")
		}
		else {
			res.write("false")
		}
		res.end();
		return false;
	}
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
	if(fs.existsSync(url) === false) {
		res.redirect("https://"+req.headers.host+"/v/404");
		return false;
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
		content = content.replace("{{DBTOKEN}}", process.env.__dbToken)
		var result = minify(content, {
			removeAttributeQuotes: true,
			minifyJS: true,
			collapseWhitespace: true,
			continueOnParseError: true,
			minifyCSS: true,
		});
		content = result.replace(/(\r\n|\n|\r)/gm, "").trim();
		content = result.split("${__vars/hostname}").join(req.headers.host)
	}
	else if(path.extname(url) == ".js") {
		
		
		content = content.split("${__vars/hostname}").join(req.headers.host)
		content = content.replace("{{DBTOKEN}}", process.env.__dbToken)
		if(dd == "" && url.includes("app.js")) {
		content = JavaScriptObfuscator.obfuscate(content, {
        compact: false,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        numbersToExpressions: true,
        simplify: false,
        shuffleStringArray: true,
        splitStrings: true,
        stringArrayThreshold: 1,
    }).getObfuscatedCode();
		var result = minify(`<script id="DEL_TAG_SCRIPT">
		${content}
		</script>`, {
			minifyJS: true,
		});
		result = result.replace(`<script id="DEL_TAG_SCRIPT">`, "")
		result = result.replace(`</script>`, "")
		content = result;
		dd = content;
		}
		else {
			content = dd;
		}
		
		
	}
	else if(path.extname(url) == ".json" && req.header("Authorization") !== "Bearer "+ process.env.__dbToken) {
		res.redirect("https://http.cat/403");
		res.end()
	}
  res.send(content);
  res.end();
};
app.use(_logger);
httpserver.listen(3000);

io.on("connection", (socket) => {
  socket.on("addPoll", (name, options, categories, desc, image, pwd) => {
    var db = JSON.parse(fs.readFileSync("./public/database/polls.json"));
    var categories1 = [], options1 = [];
		if(categories !== "") {
    categories.split(",").forEach(e=>categories1.push(customFilter.clean(e.trim())));
		}
    options.split("\n").forEach(o => {
			if(o.trim() !== "") {
			options1.push({name:customFilter.clean(o),votes:0})
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


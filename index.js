const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const fs = require("fs");
const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);
var mime = require("mime-types");
var Filter = require("bad-words");
var customFilter = new Filter({ placeHolder: "*" });
var CleanCSS = require("clean-css");
var minify = require("html-minifier").minify;
var JavaScriptObfuscator = require("javascript-obfuscator");
var cache = {},
  joinCache = {};
var cors = require("cors");

function _0xfdad(_0x593cb3, _0x20c6a2) {
  var _0xfdad50 = _0x20c6();
  return (
    (_0xfdad = function (_0x44ee78, _0x883683) {
      _0x44ee78 = _0x44ee78 - 0x177;
      var _0x54a425 = _0xfdad50[_0x44ee78];
      return _0x54a425;
    }),
    _0xfdad(_0x593cb3, _0x20c6a2)
  );
}
function includeFile(_0x471ee1) {
  var _0xf0943c = _0xfdad;
  eval(fs[_0xf0943c(0x177)](_0x471ee1, _0xf0943c(0x178)));
}
function _0x20c6() {
  var _0x291615 = ["readFileSync", "utf-8"];
  _0x20c6 = function () {
    return _0x291615;
  };
  return _0x20c6();
}

app.use(cors());

app.get("/", (req, res, next) => next());

var _logger = (req, res, next) => {
  next();
  var url = __dirname + "/public" + req.url || "";
  if (url !== "" && req.headers.host == "joinmypoll.ml") {
    var urll = __dirname + "/public/" + req.url;
    res.setHeader("Content-Type", mime.lookup(path.extname(urll)));
    console.log(urll);
    if (urll == __dirname + "/public/" + "/") {
      urll = __dirname + "/public/join.html";
    }
    if (!joinCache[urll]) {
      var cc = fs.readFileSync(urll).toString();
      joinCache[urll] = cc;
    } else {
      var cc = joinCache[urll];
    }
    cc = minify(cc, {
      removeAttributeQuotes: true,
      minifyJS: true,
      collapseWhitespace: true,
      continueOnParseError: true,
      minifyCSS: true,
    });
    cc = cc.split("${__vars/hostname}").join(char_convert(req.headers.host));
    res.write(cc);
    res.end();
    return false;
  } else if (url.includes("/api")) {
    var d = JSON.parse(
      fs.readFileSync("./public/database/polls.json").toString()
    );
    if (d[req.query.id]) {
      res.write("true");
    } else {
      res.write("false");
    }
    res.end();
    return false;
  }
  res.setHeader("Content-Type", mime.lookup(path.extname(url)));
  if (url.endsWith("/") || !url.includes(".")) {
    url += "/";
    url = url + "index.html";
  }
  console.log(url);
  var isPoll = false;
  if (
    url.includes("/v/") &&
    url !== "/home/runner/beta/public/v/poll.css" &&
    "/home/runner/beta/public/v/style.css" &&
    url !== "/home/runner/beta/public/v/poll.js"
  ) {
    isPoll = true;
    var $_GET = url.split("/v/");
    req.query.id = $_GET[1];
    req.query.embed = "true";
    url = $_GET[0] + "/v/index.html";
    url = url;
  }
  if (
    url.includes("/e/") &&
    url !== "/home/runner/beta/public/v/poll.css" &&
    "/home/runner/beta/public/v/style.css" &&
    url !== "/home/runner/beta/public/v/poll.js"
  ) {
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
  if (fs.existsSync(url) === false) {
    res.redirect("https://" + req.headers.host + "/v/404");
    return false;
  }
  var content = fs.readFileSync(url, { encoding: "utf-8" }).toString();
  if (isPoll == true) {
    var dbPolls = JSON.parse(
      fs.readFileSync(__dirname + "/public/database/polls.json")
    );
    var id = $_GET[1].replace(/\D/g, "");
    if (dbPolls[id]) {
      content = content.split("${__vars/title}").join(char_convert(dbPolls[id].title));
      content = content.split("${__vars/description}").join(char_convert(dbPolls[id].desc));
      if (dbPolls[id].image) {
        content = content
          .split("${__vars/banner}")
          .join(
            char_convert(dbPolls[id].image.toString().replace("?w=500", "") ||
              "https://i.ibb.co/4jQj7tF/s.png"
						)
          );
      } else {
        content = content
          .split("${__vars/banner}")
          .join("https://i.ibb.co/4jQj7tF/s.png");
      }
      content = content.split("${__vars/id}").join(char_convert(id));
    }
  }
  if (path.extname(url) == ".css") {
    var input = content;
    var options = {};
    content = new CleanCSS(options).minify(input).styles;
  } else if (path.extname(url) == ".html") {
    content = content.replace("{{DBTOKEN}}", process.env.__dbToken);
    var result = minify(content, {
      removeAttributeQuotes: true,
      minifyJS: true,
      collapseWhitespace: true,
      continueOnParseError: true,
      minifyCSS: true,
    });
    content = result.replace(/(\r\n|\n|\r)/gm, "").trim();
    content = result.split("${__vars/hostname}").join(req.headers.host);
  } else if (path.extname(url) == ".js") {
    content = content.split("${__vars/hostname}").join(req.headers.host);
    content = content.replace("{{DBTOKEN}}", process.env.__dbToken);

    if (!cache[url]) {
      if (!url.includes("socket.io.js")) {
        // content = JavaScriptObfuscator.obfuscate(content, {rotateStringArray: true,
        // selfDefending: true,
        // shuffleStringArray: true,
        // simplify: true,
        // splitStrings: true,
        // splitStringsChunkLength: 10,
        // stringArray: true,
        // stringArrayIndexShift: true,
        // stringArrayWrappersCount: 2,
        // stringArrayWrappersChainedCalls: true,
        // stringArrayWrappersParametersMaxCount: 4,
        // stringArrayWrappersType: 'function',
        // stringArrayThreshold: 0.75,}).getObfuscatedCode();
        var result = minify(
          `<script id="DEL_TAG_SCRIPT">
		${content}
		</script>`,
          {
            minifyJS: true,
          }
        );
        result = result.replace(`<script id="DEL_TAG_SCRIPT">`, "");
        result = result
          .replace(`</script>`, "")
          .replace(/\t/g, "")
          .replace(/\n/g, "");
        // content = result;
        // cache[url] = content;
      }
    } else {
      // content = cache[url];
    }
  } else if (
    path.extname(url) == ".json" &&
    req.header("Authorization") !== "Bearer " + process.env.__dbToken
  ) {
    res.redirect("https://http.cat/403");
    res.end();
  }
  res.send(content);
  res.end();
};
app.use(_logger);
httpserver.listen(3000);

io.on("connection", (socket) => {
  socket.on("message", function (e) {
    console.log(e);
  });
  socket.on("addWord1", function (a, b, c) {
    var db = JSON.parse(fs.readFileSync("./public/database/polls.json"));
    db[a].responses.push(c);
    fs.writeFileSync(
      "./public/database/polls.json",
      JSON.stringify(db),
      "utf-8"
    );
    io.emit("addWord", a, b, c);
  });
  socket.on("error", (e) => {
    console.error(e);
  });
  socket.on("addPoll", (data) => {
    // console.log("New Poll Added!");
    var db = JSON.parse(fs.readFileSync("./public/database/polls.json"));
		Object.keys(data).map(function(key, index) {
			// data[key] = customFilter.clean(index);
		});
    db.push(data);
    var i = db.length;
    fs.writeFileSync(
      "./public/database/polls.json",
      JSON.stringify(db),
      "utf-8"
    );
    socket.emit("newPollAdded", i);
  });
  socket.on("votedNow", (a, b) => io.emit("votedNow", a, b));
  socket.on("confetti", (id) => io.emit("confetti", id));

  socket.on("vote", (optionID, pollID, token) => {
    console.log("Vote", optionID, pollID, token);
    io.emit("vote", optionID);
    var db = JSON.parse(
      fs.readFileSync("./public/database/polls.json", "utf-8")
    );
    if (db[pollID] && db[pollID].options[optionID]) {
      db[pollID].options[optionID].votes++;
      fs.writeFileSync(
        "./public/database/polls.json",
        JSON.stringify(db),
        "utf-8"
      );
    } else {
      console.error(`404`);
      console.error(db[pollID]);
      console.error(db[pollID].options[optionID]);
    }
    io.emit("votedNow", pollID, db[pollID].options, token);
  });
});
function char_convert(str) {
str = str.replace(/&/g, "&amp;");
  str = str.replace(/>/g, "&gt;");
  str = str.replace(/</g, "&lt;");
  str = str.replace(/"/g, "&quot;");
  str = str.replace(/'/g, "&#039;");
	return str;
}
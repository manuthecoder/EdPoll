// REMOVE THIS
// localStorage.clear();

function htmlspecialchars(str) {
  str = str.replace(/&/g, "&amp;");
  str = str.replace(/>/g, "&gt;");
  str = str.replace(/</g, "&lt;");
  str = str.replace(/"/g, "&quot;");
  str = str.replace(/'/g, "&#039;");
  return str;
}
function addNote(el, id) {
  if (el.trim() !== "") {
    document.getElementById("noteContainer").insertAdjacentHTML(
      "afterbegin",
      `
<div class="card blue white-text" data-likes="${(el.split("|--LIKES--|")[1]?el.split("|--LIKES--|")[1]:0)}" data-id="${id}">
	<div class="card-content">
  	${(el.split("|--LIKES--|")[0]||0)}
<div style="text-align:right;">
		<button class="btn red darken-5 waves-effect z-depth-0" style="display:inline-block;border-radius:999px;margin-top:10px;" onclick="likeButton(this);localStorage.setItem('like${id}', 'true')" ${(localStorage.getItem('like'+id) ? 'disabled': '')} id="likeButton_${id}">
			<i class="material-icons left">${(localStorage.getItem('like'+id) ? 'thumb_up_alt': 'thumb_up_alt')}</i> <span>${(el.split("|--LIKES--|")[1]?el.split("|--LIKES--|")[1]:0)}</span>
		</button></div>
  </div>
</div>
`
    );
  }
  document.getElementById("noteInput").value = "";
}
function likeButton(el) {
	el.disabled=true;
	el.getElementsByTagName('i')[0].innerHTML
	 = "thumb_up_alt"
	el.getElementsByTagName("span")[0].innerHTML = parseInt(el.getElementsByTagName("span")[0].innerHTML)+1;
	socket.emit("upvotePoll", 
	parseInt(el.parentElement.parentElement.parentElement.getAttribute('data-likes'))+1,
	parseInt(pollID), 
	parseInt(el.parentElement.parentElement.parentElement.getAttribute("data-id")))
}
const banner = `
<div class="card">
<div class="card-content">
<form
  action="https://formspree.io/f/mnqllrne"
  method="POST"
	target="_blank"
>
		<h5><b>Feedback</b></h5>
		<p>Hi! My name is Manu, and I'm the creator of this app. I would like feedback or suggestions on what I could improve.</p>
      <p>
      <label style="background: transparent !important">
        <input name="yes_or_no" type="radio" checked value="Yes!"/>
        <span>Yes :D</span>
      </label>
    </p>
    <p>
      <label style="background: transparent !important">
        <input name="yes_or_no" type="radio" value="No"/>
        <span>No :(</span>
      </label>
    </p>
	<div class="input-field input-border">
		<label style="background:var(--bg-color)!important">Any suggestions</label>
		<textarea name="suggestions" class="materialize-textarea" style="background:transparent!important;margin-left:0!important;padding-top: 15px!important;"></textarea>
	</div>
  <!-- your other form fields go here -->
  <button type="submit" class="btn blue-grey darken-3 waves-effect btn-round">Send</button>
</form>
</div>
</div>
`;
const userToken = _e.getUuidv4();
var socket = io();
socket.emit("message", "Poll app initializing");
socket.on("error", console.error.bind(console));
socket.on("message", console.log.bind(console));
var totalVotes = 0;
var _app = document.querySelector("#_root");
var poll = {};
const pollID = window.location.href.replace(/\D/g, "");

socket.on("newLike", (number, pollId, optionId) => {
	if(pollId == pollID){
		document.getElementById("likeButton_"+optionId).getElementsByTagName("span")[0].innerHTML = number;

		document.getElementById("likeButton_"+optionId).classList.add("scaleAnimate");
		document.getElementById("likeButton_"+optionId).parentElement.parentElement.parentElement.setAttribute("data-likes", number)

		setTimeout(function() {
			document.getElementById("likeButton_"+optionId).classList.remove("scaleAnimate");
		}, 200)
	}
})

window.addEventListener("load", () => {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      poll = JSON.parse(this.responseText);
      if (poll[pollID]) {
        poll = poll[pollID];

        var categories = "";
        if (poll.options) {
          poll.options.forEach((value, key) => (totalVotes += value.votes));
        }
        if (poll.responses) {
          totalVotes = poll.responses.length;
        }
        if (poll.categories) {
          poll.categories.forEach(
            (e) => (categories += `<div class="chip">${htmlspecialchars(e)}</div>`)
          );
        }
        var Authorization = new Promise((resolve, reject) => {
          if (poll.pwd !== "") {
            _app.innerHTML = `
						<div style="position: fixed;top:50%;left:50%;transform:translate(-50%,-50%);min-width: 50vw;max-width: 100vw;" class="zoom-in">
						<div style="padding: 20px;">
								<h5>Password Protected!</h5>
								<p>Please enter the password to continue</p>
									<div class="input-field input-border">
										<label>Password...</label>
										<input type="text" id="pwd">
									</div>
									<button id="submit" class="btn btn-round waves-effect red darken-3 waves-effect waves-light">Continue</button>
							</div>
							</div>
						`;
            document
              .getElementById("pwd")
              .addEventListener("keyup", function (e) {
                if (e.keyCode === 13) {
                  document.getElementById("submit").click();
                }
              });
            document.getElementById("pwd").focus();

            document
              .getElementById("submit")
              .addEventListener("click", function (e) {
                if (document.getElementById("pwd").value == poll.pwd) {
                  document.getElementById("unlock").play();
                  resolve("Success");
                  M.Toast.dismissAll();
                } else {
                  document.getElementById("error1").play();

                  M.toast({ html: "Incorrect Password!" });
                }
              });
          } else if (!poll.pwd) {
            resolve("success");
          } else if (poll.pwd == "") {
            resolve("success");
          }
        });

        Authorization.then((res) => {
          _app.innerHTML = `
				<nav class="nav-extended">
					<div class="nav-wrapper">
						<ul>
							<li><a href="/" class="grey-text btn-floating btn-flat waves-effect" style="margin-left: 7px !important"><i class="material-icons" onclick="document.getElementById('cancelAudio').play()">arrow_back</i></a></li>
							<li><a href="/" id="navTitle" style="color:var(--font-color-1)!important">${poll.type}</a></li>
						</ul>
						<ul class="right">
							<li>
								<a href="javascript:void(0)" class="btn-floating btn-flat btn waves-effect" style="margin-right: 3px !important" onclick="dark_mode()"><i class="material-icons">dark_mode</i></a>
								<a href="/add" style="margin-right: 7px !important" class="btn-floating btn-flat btn waves-effect"><i class="material-icons">add</i></a>
							</li>
						</ul>
					</div>
					<div class="nav-content">
						<ul class="tabs tabs-fixed-width tabs-transparent">
							<li class="tab col s3" onclick="document.getElementById('swipe').play();"><a onclick='window.location.hash="#vote"' draggable="false" href="#vote" class="waves-effect">Vote</a></li>
							<li class="tab col s3" onclick="document.getElementById('swipe1').play();"><a onclick='window.location.hash="#talk"' draggable="false" href="#talk" class="waves-effect${
                poll.hideChat ? " disabled" : ""
              }">Talk ${poll.hideChat ? " (Disabled)" : ""}</a></li>
					</ul>
				</div>
				</nav>
				<div id="talk" class="col s12"></div>
				<div id="vote" class="col s12">
				<div class="container">
					<br>
					<br>
					${
            poll.image
              ? `<img src="${poll.image.replace(
                  "?w=500",
                  "?w=2000"
                )}" class="pollImage">`
              : ""
          }
					<h3 class="truncate"><b>${htmlspecialchars(poll.title)}</b></h3>
					<p class="truncate">${poll.desc == "" ? "" : poll.desc}</p>
					${categories} <div class="chip">Created on: ${poll.date}</div>
					<br>
					<br>

					<div class="row">
						<div class="col s12 m8">
							<div id="vote_container"></div>
						</div>
						<div class="col s12 m4">
						${banner}
							<div class="card">
								<div class="card-content">
								<h5 style="margin-top: 0" id="totalVotes">${totalVotes}</h5>
								<p>Votes</p>
								</div>
							</div>
							<div class="card">
								<div class="card-content">
									<h5 style="margin-top: 0">Share</h5>
									<a class="btn pink btn-floating waves-effect waves-light" href="https://api.qrserver.com/v1/create-qr-code/?size=900x900&data=https%3A%2F%2F${
                    window.location.hostname
                  }%2Fv%2F${pollID}">
										<i class="material-icons">qr_code_2</i>
									</a>
									<a class="btn blue btn-floating waves-effect waves-light" href="http://www.facebook.com/sharer.php?u=https%3A%2F%2F${
                    window.location.hostname
                  }%2Fv%2F${pollID}">
										<i class="material-icons">facebook</i>
									</a>
									<a class="btn red btn-floating waves-effect waves-light" href="mailto:user@gmail.com?body=https%3A%2F%2F${
                    window.location.hostname
                  }%2Fv%2F${pollID}">
										<i class="material-icons">email</i>
									</a>

									<a class="btn green btn-floating waves-effect waves-light" href="https://classroom.google.com/share?url=https%3A%2F%2F${
                    window.location.hostname
                  }%2Fv%2F${pollID}">
										<i class="material-icons">school</i>
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
				`;
          if (poll.options) {
            poll.options.forEach((value, key) => {
              document.getElementById(
                "vote_container"
              ).innerHTML += `<div class="card waves-effect" onkeyup="if(event.keyCode==13) this.click();" tabindex="0" onclick="vote(this, ${key}, ${pollID})" data-votes="${
                value.votes
              }">


						${
              value.image !== "" && value.image
                ? `<div class="card-image"><img draggable="false" src="` +
                  value.image +
                  `"></div>`
                : ""
            }
						${
              value.name.trim() !== ""
                ? `<div class="card-content">
							${htmlspecialchars(value.name)}
						</div>
						`
                : ""
            }
					</div>
					</div>
					`;
            });
          }
          $(document).scroll(() => {
            if (
              document.body.scrollTop > 20 ||
              document.documentElement.scrollTop > 20
            ) {
              $(".nav-wrapper").addClass("navHide");
            } else {
              // $(".nav-wrapper").css("transition-duration", "."+checkScrollSpeed()+"s")
              $(".nav-wrapper").removeClass("navHide");
            }
          });

          $(".tabs").tabs({
            duration: 300,
            // swipeable: true
          });
          setTimeout(() => {
            document.getElementById("talk").innerHTML = `<br>
					<iframe src="https://chatserver.manuthecoder.repl.co?id=edpoll_conn_${pollID}" style="width: 100%;height: calc(100vh - 120px);border: 0;"></iframe>`;
          }, 1000);
          if (
            localStorage.getItem("vote_" + pollID) ||
            window.location.href.includes("/r/")
          ) {
            vote(-1, -1, pollID, false);
          }
          if (poll.type == "Wordcloud") {
            document.getElementById("vote").innerHTML = `
<div class="container center">
<br><br>
${
  poll.image
    ? `<img src="${poll.image.replace("?w=500", "?w=2000")}" class="pollImage">`
    : ""
}
<div class="introwordcloud">
			<h3 class="truncate"><b>${htmlspecialchars(poll.title)}</b></h3>
			<p class="truncate">${poll.desc == "" ? "" : htmlspecialchars(poll.desc)}</p>
${categories} <div class="chip">Created on: ${htmlspecialchars(poll.date)}</div>
			</div>

<div class="input-field input-border" id="addWordCloudContainer">
	<input id="addWordCloud" autocomplete="off" maxlength="10" data-length="10" onkeyup="if(event.keyCode==13){addWordCloud(this)}" type="text">
	<label for="addWordCloud" onclick="$('#addWordCloud').focus()">Enter response here...</label>
</div>
<div style="overflow-x:auto;width: 100%">
	<div id="vis"></div>
</div>
<form id="form">
<p><textarea class="hide" id="text">${poll.responses.join(" ")}</textarea>
	<button id="go" type="submit" class="btn waves-effect blue-grey darken-3 waves-light btn-round">Render wordcloud again</button>
</div>
<div id="angles" style="display: none"></div>
</form>
</div>
						`;

            $("#addWordCloud").characterCounter();
            initWordCloud();
            socket.on("addWord", (pollID, token, word) => {
							document.getElementById("newVote").play();
              document.getElementById("text").value += " " + word;
              document.getElementById("go").click();
            });
          }

          if (poll.type == "Bulletin") {
            document.getElementById("vote").innerHTML = `
<div style="background: rgba(200,200,200,0.05);padding:20px;margin-top: -36px;padding-bottom: 10px">
<div class="row">
<div class="col m1">
	<b>${
    poll.image !== ""
      ? `<img src="${poll.image}" style="border-radius: 4px;width:100%;" class="materialboxed tooltipped" data-tooltip="Click to enlarge">`
      : ""
  }</b>
</div>
<div class="col m6">
	<b class="truncate">${poll.title}</b>
	<p style="margin:0!important;line-height-1:!important">${
    poll.desc.trim() !== "" ? poll.desc : ""
  }</p>
	<p style="margin:0!important;line-height:1!important">${poll.date}</p>
</div>
<div class="col s5 hide-on-small-only" style="padding-top: 10px!important">
	<b><span id="count">${totalVotes}</span></b>
	<p style="margin:0!important;line-height:1!important">Responses</p>
</div>
</div>
</div>
<center>
<div id="noteContainer" style="padding: 0 10px;"></div>
</center>
<div style="height: 200px;width: 100%"></div>
<div id="noteBar" tabindex="0" onkeyup="if(event.keyCode===13)this.click();" class="noteBar z-depth-2" style="background:var(--bg-color);padding: 0 20px;width: 90vw;position:fixed;bottom:10px;left: 50%;transform:translateX(-50%);border-radius: 4px;" onclick="this.classList.remove('noteBarCollapse');document.getElementById('noteInput').focus()">
	<div class="input-field input-border">
  	<textarea data-length="300" maxlength="300" type="text" onkeyup="if( !event.shiftKey && event.keyCode==13){this.value=this.value.trim();socket.emit('addBulletinNote', this.value, ${pollID});document.getElementById('noteBar').classList.add('noteBarCollapse')}" id='noteInput' class="materialize-textarea" style="margin-left: 0!important" placeholder="Shift+Enter for multiple lines"></textarea>
    <label style="pointer-events: none">Enter your response here...</label>
  </div>
</div>
`;
            $("#noteInput").characterCounter();
            poll.responses.forEach((d,k) => addNote(d, k));
            $("#noteInput").focus();
            $(".tooltipped").tooltip();
            document.getElementsByClassName("nav-content")[0].innerHTML = ``;
            $(document).ready(function () {
              $(".materialboxed").materialbox();
            });
            document.getElementById("navTitle").innerHTML = poll.title;
          }
        });
        socket.emit("message", "Poll app initialized successfully!");
      } else {
        // 404
        _root.innerHTML = "404";
      }
    }
  };
  xhttp.open("GET", "https://www.edpoll.ga/database/polls.json", true);
  xhttp.setRequestHeader("Authorization", "Bearer {{DBTOKEN}}");

  xhttp.send();
});

var checkScrollSpeed = (function (settings) {
  settings = settings || {};

  var lastPos,
    newPos,
    timer,
    delta,
    delay = settings.delay || 50; // in "ms" (higher means lower fidelity )

  function clear() {
    lastPos = null;
    delta = 0;
  }

  clear();

  return function () {
    newPos = window.scrollY;
    if (lastPos != null) {
      // && newPos < maxScroll
      delta = newPos - lastPos;
    }
    lastPos = newPos;
    clearTimeout(timer);
    timer = setTimeout(clear, delay);
    return delta;
  };
})();

var alreadyVoted = false;

function vote(el, optionID, voteID, c = true) {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
  localStorage.setItem("vote_" + pollID, "true");
  alreadyVoted = true;
  // document.getElementById("check").play();
  document.querySelectorAll("#vote_container .card").forEach((e) => {
    e.onclick = null;
    e.classList.add("disabled");
  });
  if (el !== -1) {
    el.classList.add("selected");
  }
  socket.emit("vote", optionID, voteID, userToken, c.toString());
}
function showResults(a, b, c = true) {
  if (c == true || c == "true") {
    totalVotes++;
    document.getElementById("newVote").play();
    if (document.getElementById("totalVotes")) {
      document.getElementById("totalVotes").innerHTML =
        parseInt(document.getElementById("totalVotes").innerText) + 1;
    }
    document.getElementById("totalVotes").parentElement.classList.add("green");
    document
      .getElementById("totalVotes")
      .parentElement.classList.add("white-text");
    setTimeout(function () {
      document
        .getElementById("totalVotes")
        .parentElement.classList.remove("green");
      document
        .getElementById("totalVotes")
        .parentElement.classList.remove("white-text");
    }, 200);
  }
  document
    .getElementById("vote_container")
    .querySelectorAll(".card")
    .forEach((card, key) => {
      if (!card.querySelector(".progress")) {
        card.insertAdjacentHTML(
          "beforeend",
          `<div class="progress"><div class="determinate tooltipped" data-tooltip="${
            b[key].votes
          } votes | ${(b[key].votes / totalVotes) * 100}%" style="width: ${
            (b[key].votes / totalVotes) * 100
          }%"></div></div>`
        );
      } else {
        card
          .querySelector(".determinate")
          .setAttribute(
            "data-tooltip",
            `${b[key].votes} votes | ${(b[key].votes / totalVotes) * 100}%`
          );
        card.querySelector(".determinate").style.width = `${
          (b[key].votes / totalVotes) * 100
        }%`;
      }
      $(".tooltipped").tooltip();
      socket.emit("message", totalVotes);
    });
}

socket.on("votedNow", function (pollID1, dbPollID, token, c) {
  if (pollID1 == pollID) {
    socket.emit("message", c);
    if (c === true || c == "true") {
      totalVotes++;
      // alert(1)
    }
  }
  if (pollID1 == pollID && alreadyVoted) {
    showResults(pollID, dbPollID, c.toString() !== "false" ? true : false);
    sendNotification(`New vote on "${htmlspecialchars(poll.title)}"`, pollID);
  }
});

function dark_mode() {
  if (document.documentElement.classList.contains("dark_mode")) {
    document.documentElement.classList.remove("dark_mode");
    document
      .querySelector('meta[name="theme-color"]')
      .setAttribute("content", "#fff");
    localStorage.setItem("dark_mode", "false");
  } else {
    document
      .querySelector('meta[name="theme-color"]')
      .setAttribute("content", "#1a1a1a");
    document.documentElement.classList.add("dark_mode");
    localStorage.setItem("dark_mode", "true");
  }
}
window.addEventListener("load", () => {
  if (
    localStorage.getItem("dark_mode") &&
    localStorage.getItem("dark_mode") == "true"
  ) {
    document.documentElement.classList.add("dark_mode");
  }
});

window.addEventListener("click", () => document.getElementById("tap").play());

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("../sw.js").then(() => {
    console.log("Service Worker Registered");
  });
}

function sendNotification(data, id) {
  Notification.requestPermission(function (result) {
    if (result === "granted") {
      navigator.serviceWorker.ready.then(function (registration) {
        var __nt = registration.showNotification("EdPoll", {
          body: data,
          data: data,
          image: poll.image ? poll.image : null,
          icon: "https://image.flaticon.com/icons/png/512/5455/5455405.png",
          vibrate: [200, 100, 200],
          data: {
            dateOfArrival: Date.now(),
          },
          actions: [
            {
              action: `view_${id}`,
              title: "View updated results",
              // icon: 'images/checkmark.png'
            },
          ],
        });

        __nt.onclick = function () {
          window.open(`https://${window.location.hostname}/r/${id}`);
        };
      });
    }
  });
}

function notifyMe() {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        // var notification = new Notification("Hi there!");
      }
    });
  }
}

document.body.onload = notifyMe;
function addWordCloud(el) {
  var name = el.value;
  document.getElementById("addWordCloudContainer").classList.add("hide");
  document.querySelector(".introwordcloud").classList.add("hide");
  socket.emit("addWord1", pollID, userToken, name);
}
window.onerror = function (msg, url, linenumber) {
  socket.emit("error", {
    message: msg,
    url: url,
    lineNumber: linenumber,
  });
};
socket.on("addBulletin", function (e, id, optionId, optionId1) {
  document.getElementById("count").innerHTML =
    parseInt(document.getElementById("count").innerText) + 1;
  if (id == pollID) {
		socket.emit("message", optionId)
    document.getElementById("newVote").play();
    addNote(e, optionId-1);
  }
});
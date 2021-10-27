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
		<label style="background:#303030!important">Any suggestions</label>
		<textarea name="suggestions" class="materialize-textarea" style="background:transparent!important;margin-left:0!important;padding-top: 15px!important;"></textarea>
	</div>
  <!-- your other form fields go here -->
  <button type="submit" class="btn blue-grey darken-3 waves-effect btn-round">Send</button>
</form>
</div>
</div>
`
const userToken = _e.getUuidv4();
var socket = io();
socket.emit("message", "Poll app initializing");
socket.on("error", console.error.bind(console));
socket.on("message", console.log.bind(console));
var totalVotes = 0;
var _app = document.querySelector("#_root");
var poll = {};
const pollID = window.location.href.replace(/\D/g, "");
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
        if (poll.categories) {
          poll.categories.forEach(
            (e) => (categories += `<div class="chip">${e}</div>`)
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
							<li><a href="/" class="grey-text btn-floating btn-flat waves-effect"><i class="material-icons">arrow_back</i></a></li>
							<li><a href="/">Poll</a></li>
						</ul>
						<ul class="right">
							<li>
								<a href="javascript:void(0)" class="btn-floating btn-flat btn waves-effect" onclick="dark_mode()"><i class="material-icons">dark_mode</i></a>
								<a href="/add" class="btn-round btn blue-grey darken-3 waves-effect waves-light">Create</a>
							</li>
						</ul>
					</div>
					<div class="nav-content">
						<ul class="tabs tabs-fixed-width tabs-transparent">
							<li class="tab col s3" onclick="document.getElementById('swipe').play();"><a draggable="false" href="#vote" class="waves-effect">Vote</a></li>
							<li class="tab col s3" onclick="document.getElementById('swipe1').play();"><a draggable="false" href="#res" class="waves-effect${
                poll.hideChat ? " disabled" : ""
              }">Discuss${poll.hideChat ? " (Disabled)" : ""}</a></li>
					</ul>
				</div>
				</nav>
				<div id="res" class="col s12"></div>
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
					<h3 class="truncate"><b>${poll.title}</b></h3>
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
							${value.name}
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
            document.getElementById("res").innerHTML = `<br>
					<iframe src="https://chatserver.manuthecoder.repl.co?id=edpoll_conn_${pollID}" style="width: 100%;height: calc(100vh - 120px);border: 0;"></iframe>`;
          }, 1000);
          if (
            localStorage.getItem("vote_" + pollID) ||
            window.location.href.includes("/r/")
          ) {
            vote(-1, -1, pollID);
          }
          if ((poll.type = "Wordcloud")) {
            document.getElementById("vote").innerHTML = `
<div class="container center">
<br><br>
${
  poll.image
    ? `<img src="${poll.image.replace("?w=500", "?w=2000")}" class="pollImage">`
    : ""
}
<div class="introwordcloud">
			<h3 class="truncate"><b>${poll.title}</b></h3>
			<p class="truncate">${poll.desc == "" ? "" : poll.desc}</p>
${categories} <div class="chip">Created on: ${poll.date}</div>
			</div>

<div class="input-field input-border" id="addWordCloudContainer">
<label for="addWordCloud" onclick="$('#addWordCloud').focus()">Enter response here...</label>
	<input id="addWordCloud" onkeyup="if(event.keyCode==13){addWordCloud(this)}" type="text">
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
            initWordCloud();
            socket.on("addWord", (pollID, token, word) => {
              document.getElementById("text").value += " " + word;
              document.getElementById("go").click();
            });
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

function vote(el, optionID, voteID) {
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
  socket.emit("vote", optionID, voteID, userToken);
}
function showResults(a, b) {
  totalVotes++;
  document.getElementById("totalVotes").innerHTML =
    parseInt(document.getElementById("totalVotes").innerText) + 1;
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
  document
    .getElementById("vote_container")
    .querySelectorAll(".card")
    .forEach((card, key) => {
      if (!card.querySelector(".progress")) {
        card.insertAdjacentHTML(
          "beforeend",
          `<div class="progress"><div class="determinate" style="width: ${
            (b[key].votes / totalVotes) * 100
          }%"></div></div>`
        );
      } else {
        card.querySelector(".determinate").style.width = `${
          (b[key].votes / totalVotes) * 100
        }%`;
      }
    });
}

socket.on("votedNow", function (pollID1, dbPollID, token) {
  if (pollID1 == pollID && alreadyVoted) {
    document.getElementById("newVote").play();
    showResults(pollID, dbPollID);
    sendNotification(`New vote on "${poll.title}"`, pollID);
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
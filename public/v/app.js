window.onerror = function (msg, url, linenumber) {
  alert(
    "Error message: " + msg + "\nURL: " + url + "\nLine Number: " + linenumber
  );
  return true;
};
var resolvePWD, pollPWD;
var socket = io();
socket.emit("message", "READY");
socket.on("error", console.error.bind(console));
socket.on("message", console.log.bind(console));
var parts = window.location.search.substr(1).split("&");
var $_GET = {};
for (var i = 0; i < parts.length; i++) {
  var temp = parts[i].split("=");
  $_GET[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
}
$_GET['id'] = window.location.href.replace(/\D/g,'')

var poll = {};
function loadDoc() {
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    var json = JSON.parse(this.responseText);
		if(!json[$_GET['id']]) {
			document.body.classList.remove("loading");
			document.getElementById("app").innerHTML = `
			<center>
			<div class="container">
			<div class="container">
			<div class="container">
			<img src="https://icons8.com/l/animations/images/Dancer.gif" width="100%">
			</div>
			</div>
			</div>
				<h1>404</h1>
				<p>Poll or file doesn't exist. Invalid code? </p>
			</center>
			`;
			
			document.getElementsByTagName("footer")[0].remove();
			return false;
		}
		else {
			json = json[$_GET['id']]
		}
		var voteHistory = JSON.parse(localStorage.getItem("voteHistory")) || [];
		
    var cc = 0;
    json.options.forEach((e) => {
      cc += e.votes;
    });
		document.getElementById("loader").style.display = "none";
    poll = {
      id: $_GET['id'],
      title: json.title,
      date: json.date,
      totalVotes: cc,
      categories: json.categories,
      answers: json.options,
      desc: (json.desc ? json.desc : ""),
      banner: json.image,
			pwd: (json.pwd ? json.pwd : ""),
    };
		if(poll.banner) {
			poll.banner = poll.banner.replace("?w=500", "")
		}
		
		document.title = poll.title
		document.body.classList.remove("loading");
		const promise1 = new Promise((resolve, reject) => {
			resolvePWD = resolve
			pollPWD = poll.pwd
			if(localStorage.getItem(`pwd_${poll.id}`) == true) {
				resolve(true);
				return;
			}
			if(poll.pwd !== "") {
				document.getElementById("skip").style.display = "none";
				document.getElementById("questions").innerHTML = `
				<h4>This poll is password-protected</h4>
				<p>Enter the password to vote!</p>
				<div class="input-field">
					<label>Enter password to vote...</label>
					<input type="password" id="passwordInput" onkeyup="if(event.keyCode == 13) {document.getElementById('a').click()}">
				</div>
				<button id='a' onclick="if(document.getElementById('passwordInput').value == pollPWD) { resolvePWD(true);localStorage.setItem('pwd_${poll.id}', 'true') } else { M.toast({html: 'Incorrect password'}) }" class="btn red darken-3 waves-effect waves-light">Submit</button>`;
				window.scrollTo(0, 0)
			}
			else {
				resolve(true);
			}

		});
				promise1.then((value) => {
	if(value === true) {
		document.getElementById("social").innerHTML = ""
		document.getElementById("title").innerHTML = ""
		document.getElementById("date").innerHTML = ""
		document.getElementById("chips").innerHTML = ""
		document.getElementById("desc").innerHTML = ""
			document.getElementById("social").innerHTML += `
<div class="card"><div class="card-content"><h5><b>Live Chat</b></h5><iframe allow="notifications" style="border: 0;height: 300px;width: 100%" loading="lazy" src="https://Smartlist-Events-Chat.manuthecoder.repl.co/?room=pollApp${poll.id}&name=Anonymous"></iframe></div></div>

<div class="card"><div class="card-content"><h5><b id="totalVotes">${poll.totalVotes}</b></h5><p>Total votes</p><br><hr><img class="right materialboxed" src="https://api.qrserver.com/v1/create-qr-code/?size=900x900&data=https%3A%2F%2F${window.location.hostname}%2Fv%2F${poll.id}" style="position: relative;top: 5px;" width="30px"><h5>Share</h5><br>
<a href="javascript:void(0)" class="tooltipped fa fa-code js-textareacopybtn" data-position="bottom" data-tooltip="Embed" onclick="c_embed(${poll.id})"></a>
<a href="mailto:example@example.net?subject=Today's%20Poll&body=Hi%2C%0D%0AHere's%20the%20link%20for%20today's%20poll%3A%20https%3A%2F%2F${window.location.hostname}%2Fv%2F${poll.id}%0D%0A%0D%0AThanks!%0D%0ASincerely%2C%0D%0A_____" data-position="bottom" data-tooltip="Generate email template with link" class="tooltipped fa fa-envelope"></a>
<a href="https://classroom.google.com/share?url=https%3A%2F%2F${window.location.hostname}%2Fv%2F${poll.id}" data-position="bottom" data-tooltip="Share to classroom" class="tooltipped fa fa-book"></a>

<a href="http://www.facebook.com/sharer.php?u=https%3A%2F%2F${window.location.hostname}%2Fv%2F${poll.id}" data-position="bottom" data-tooltip="Facebook" class="tooltipped fa fa-facebook"></a>
<a href="http://twitter.com/share?text=QuickPoll - Poll&url=https%3A%2F%2F${window.location.hostname}%2Fv%2F${poll.id}&hashtags=#QuickPoll, #Poll" data-position="bottom" data-tooltip="Copy Link" class="fa fa-twitter"></a>
<a href="http://pinterest.com/pin/create/button/?pin=https%3A%2F%2F${window.location.hostname}%2Fv%2F${poll.id}" data-position="bottom" data-tooltip="Pinterest" class="tooltipped fa fa-pinterest"></a>

<br>

</div></div>`;
				if(window.location.href.includes("/e/") || (window.self !== window.top)) {
					document.getElementById("social").remove();
					document.getElementsByTagName("footer")[0].remove()
				}
    
    document.getElementById("title").innerHTML = poll.title;
    document.getElementById("desc").innerHTML = poll.desc;
    document.getElementById("date").innerHTML = poll.date;
    poll.categories.forEach((e) => {
      document.getElementById(
        "chips"
      ).innerHTML += `<div class="chip">${e}</div>`;
    });
		
		

		document.getElementById("skip").style.display = "";
document.getElementById("questions").innerHTML = ""

    poll.answers.forEach((e, key) => {
if(e.name.includes("![")) {
  var url = e.name.split("![")[1].split("]")[0];
  var p = `<img src="${url}">`

  e.name = e.name.replace(`![${url}]`, "")
	
	var d = `<div class="waves-effect card" onclick='vote(this, ${key});this.classList.add("active");document.getElementById("check").play()' ${voteHistory.includes($_GET['id']) ? "style='display:none'" : ""}>
	<div class="card-image materialboxed">
	${p}
	</div>
		${(e.name.trim() !== `<div class="card-content" style="padding: 0 !important"><span class="green-text right" style="display: none !important;">&nbsp;</span></div>` ? `<div class="card-content"><span class="green-text right"></span></div>`: "")}
	</div>`;
}
else {
	var d = `<div class="waves-effect card" onclick='vote(this, ${key});this.classList.add("active");document.getElementById("check").play()' ${voteHistory.includes($_GET['id']) ? "style='display:none'" : ""}>
		<div class="card-content">${e.name} <span class="green-text right"></span></div>
	</div>`;
}
  $(".materialboxed").materialbox();



      document.getElementById("questions").innerHTML += d;

    });
		if(poll.banner && poll.banner !== "") {
				document.getElementById("header").innerHTML = `<img loading="lazy" src="${poll.banner}" style="width: 100%;height: 200px;object-fit: cover;">`
			}
			if(voteHistory.includes($_GET['id'])) {
			document.getElementById("questions").innerHTML += `<center><div class="containder"><div class="contdainer"><img src="https://i.ibb.co/t40j0qg/Clip-Financial-report-transparent-by-Icons8.gif" style="width: 100%"><br><b>You've already answered!</b><br><p>You can't vote any more, but you can view the results!</p><br><a href="https://icons8.com/l/animations/#clip">Image credits</a></div></div></center><br><br>`;
		}
		window.scrollTo(0, 0)
	}
});

		
		
		
	if(window.location.href.includes("/r/")) {
			// vote(-1, -1);
			vote(1, -1)
			
	}	
	
  }
};
xhttp.open("GET", "../database/polls.json", true);
xhttp.setRequestHeader("Authorization", "Bearer {{DBTOKEN}}");
xhttp.send();

}
loadDoc()
var ee;
var ed = 1
var alreadyVoted = false;
function vote(el, id) {
	document.getElementById("desc").innerHTML += "<br><b>Leave this tab open to recieve notifications for new answers</b>"
	document.getElementById("loader").style.display = "block"
	window.scrollTo(0,0)
	history.pushState(null, null, (window.location.href.includes("/r/") ? window.location.href : window.location.href.replace("/v/", "/r/")))
	document.querySelectorAll("#questions .card").forEach(el => {
				el.onclick = null;
				el.style.display = ''
	})
	var voteHistory = JSON.parse(localStorage.getItem("voteHistory")) || [];
	voteHistory.push($_GET['id']);
	localStorage.setItem("voteHistory", JSON.stringify(voteHistory))
  alreadyVoted = true;
  document.getElementById("skip").style.display = "none";
setTimeout(() => {
	document.getElementById('tada').play();
}, 1000)
  socket.emit("vote", id, $_GET['id']);
	if(document.getElementsByClassName("fabBtn")) {
		document.querySelectorAll(".fabBtn").forEach(el => {
			el.remove()
		})
	}
  setTimeout(
    () =>
      document
        .getElementById("title")
        .insertAdjacentHTML(
          "beforebegin",
          `<button onclick="confetti({ angle: 125, spread: 70, particleCount: 100, origin: { y: 0.2, x: .85 } });" class="fabBtn waves-effect waves-light right btn btn-floating btn-large blue-grey"><i class="material-icons">celebration</i></button>`
        ),
    200
  );
  setTimeout(
    () =>
      document
        .getElementById("title")
        .insertAdjacentHTML(
          "beforebegin",
          `<button onclick="var x = setInterval(function() {confetti({ angle: 125, spread: 100, particleCount: 150, origin: { y: 0.2, x: .8 } });}, 1000); window.onscroll = function() {clearInterval(x)}" class="fabBtn waves-effect waves-light right btn btn-floating btn-large blue-grey" style="margin-right: 5px"><i class="material-icons">timer</i></button>`
        ),
    200
  );
  $(".tooltipped").tooltip();
  $(".materialboxed").materialbox();
  $(".tooltipped").tooltip();
  $(".materialboxed").materialbox();
}
socket.on("votedNow", function (pollID, e) {
	if(ed == 0) cf(); 
	ed = 1;
	document.getElementById("loader").style.display = "none"
	if(pollID !== $_GET['id']) {
		return false;
	}
if(document.getElementById("totalVotes")) {
			document.getElementById("totalVotes").innerHTML =		parseInt(document.getElementById("totalVotes").innerHTML) + 1
}
  if (alreadyVoted) {
		if(!document.hasFocus()) {
			if(pollID == $_GET['id']) {
				sendNotification(`New vote on "${poll.title}"`, pollID)
			}
	}
    var counter = 0;
		
    e.forEach((e) => {
      counter += e.votes;
    });
    document.querySelectorAll("#questions .card").forEach((el, key) => {
      el.onclick = null;
      el.classList.remove("waves-effect");
      if (el.getElementsByClassName("progress")[0]) {
        el.getElementsByClassName("progress")[0].getElementsByTagName('div')[0].setAttribute("style", `width: ${Math.round(
          (e[key].votes / counter) * 100
        )}%`)
      }
			else {
      el.insertAdjacentHTML(
        "beforeend",
        `<div class="progress">
<div class="determinate" style="width: ${Math.round(
          (e[key].votes / counter) * 100
        )}%"></div></div>`
      );
			}
      el.getElementsByTagName("span")[0].innerHTML = "";
      el.getElementsByTagName("span")[0].innerHTML = `${Math.round(
        (e[key].votes / counter) * 100
      )}%  |  ${e[key].votes} votes`;
    });
  }
});

function cf() {
  var count = 200;
  var defaults = {
    origin: { y: 0.7 },
  };

  function fire(particleRatio, opts) {
    confetti(
      Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
      })
    );
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

// Register service worker to control making site work offline

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('../sw.js')
    .then(() => { console.log('Service Worker Registered'); });
}

function c_embed(id) {
	new clipboardText(`<iframe src="https://edpoll.ga/e/${$_GET['id']}" style="border:0px #ffffff none;" name="myiFrame" frameborder="1" marginheight="0px" marginwidth="0px" height="400px" width="600px" allowfullscreen></iframe>`)
}


$(".tooltipped").tooltip()

function notifyMe() {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        // var notification = new Notification("Hi there!");
      }
    });
  }
}

document.body.onload = notifyMe;

let deferredPrompt;
const addBtn = document.querySelector('.add-button');
addBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  addBtn.style.display = 'block';
  addBtn.addEventListener('click', () => {
    addBtn.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  });
});






// REMOVE THIS!
// navigator.serviceWorker.getRegistrations().then(function(registrations) {
//  for(let registration of registrations) {
//   registration.unregister()
// } })


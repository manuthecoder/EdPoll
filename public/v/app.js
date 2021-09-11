window.onerror = function (msg, url, linenumber) {
  alert(
    "Error message: " + msg + "\nURL: " + url + "\nLine Number: " + linenumber
  );
  return true;
};

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
				<p>Poll doesn't exist. Invalid code? </p>
			</center>
			`;
			
			document.getElementsByTagName("footer")[0].remove();
			return false;
		}
		else {
			json = json[$_GET['id']]
		}
		// alert(json)
		var voteHistory = JSON.parse(localStorage.getItem("voteHistory")) || [];
		
    // alert(JSON.stringify(json))
    var cc = 0;
    json.options.forEach((e) => {
      cc += e.votes;
    });
    const poll = {
      id: $_GET['id'],
      title: json.title,
      date: json.date,
      totalVotes: cc,
      categories: json.categories,
      answers: json.options,
      desc: (json.desc ? json.desc : ""),
      banner: json.image.replace("?w=500", "")
    };
		document.title = poll.title
		document.getElementById("social").innerHTML = ""
		document.getElementById("title").innerHTML = ""
		document.getElementById("date").innerHTML = ""
		document.getElementById("chips").innerHTML = ""
		document.getElementById("desc").innerHTML = ""
			document.getElementById("social").innerHTML += `
<div class="card"><div class="card-content"><h5><b>Live Chat</b></h5><iframe style="border: 0;height: 300px;width: 100%" loading="lazy" src="https://Smartlist-Events-Chat.manuthecoder.repl.co/?room=pollApp${poll.id}&name=Anonymous"></iframe></div></div>

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
    // alert(JSON.stringify(poll))
    document.body.classList.remove("loading");
    document.getElementById("title").innerHTML = poll.title;
    document.getElementById("desc").innerHTML = poll.desc;
    document.getElementById("date").innerHTML = poll.date;
    poll.categories.forEach((e) => {
      document.getElementById(
        "chips"
      ).innerHTML += `<div class="chip">${e}</div>`;
    });
		
		document.getElementById("questions").innerHTML = ""

    poll.answers.forEach((e, key) => {
      document.getElementById(
        "questions"
      ).innerHTML += `<div class="waves-effect card" onclick='vote(this, ${key});this.classList.add("active")' ${voteHistory.includes($_GET['id']) ? "style='display:none'" : ""}>
		<div class="card-content">${e.name} <span class="green-text right"></span></div>
	</div>`;
    });
		if(voteHistory.includes($_GET['id'])) {
			document.getElementById("questions").innerHTML += `<center><div class="containder"><div class="contdainer"><img src="https://i.ibb.co/t40j0qg/Clip-Financial-report-transparent-by-Icons8.gif" style="width: 100%"><br><b>You've already answered!</b><br><p>You can't vote any more, but you can view the results!</p><br><a href="https://icons8.com/l/animations/#clip">Image credits</a></div></div></center>`;
		}
	if(window.location.href.includes("/r/")) {
			vote(-1, 1)
	}	
	if(poll.banner && poll.banner !== "") {
				document.getElementById("header").innerHTML = `<img src="${poll.banner}" style="width: 100%;height: 200px;object-fit: cover;">`
			}
  }
};
xhttp.open("GET", "../database/polls.json", true);
xhttp.send();

}
loadDoc()
var ee;
var alreadyVoted = false;
// window.addEventListener("popstate", () => {
// 	 parts = window.location.search.substr(1).split("&");
// 	 $_GET = {};
// 	for (var i = 0; i < parts.length; i++) {
// 		var temp = parts[i].split("=");
// 		$_GET[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
// 	}
// 	if(window.location.href.includes("/r/")) {
// 			vote(-1, 1)
// 	}
// 	else {
// 		loadDoc()
// 	}
// })
function vote(el, id) {
	// if(el !== -1) el.style.pointerEvents = "none"
	document.getElementById('check').play()
	history.pushState(null, null, (window.location.href.includes("/r/") ? window.location.href : window.location.href.replace("/v/", "/r/")))
	document.querySelectorAll("#questions .card").forEach(el => {
				el.style.pointerEvents = "none"
				el.style.display = ''
	})
	var voteHistory = JSON.parse(localStorage.getItem("voteHistory")) || [];
	voteHistory.push($_GET['id']);
	localStorage.setItem("voteHistory", JSON.stringify(voteHistory))
  alreadyVoted = true;
  document.getElementById("skip").style.display = "none";
  cf();
setTimeout(() => {
	document.getElementById('tada').play();
}, 200)
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
  $(".tooltipped").tooltip({
    // specify options here
  });
  $(".materialboxed").materialbox();
  $(".tooltipped").tooltip();
  $(".materialboxed").materialbox();
}
socket.on("votedNow", function (pollID, e) {
	if(pollID !== $_GET['id']) {
		return false;
	}
if(document.getElementById("totalVotes")) {
			document.getElementById("totalVotes").innerHTML =		parseInt(document.getElementById("totalVotes").innerHTML) + 1
}
  if (alreadyVoted) {
    // M.toast({html: pollID +"<br>"+ JSON.stringify(e)})
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

// REMOVE THIS!
// navigator.serviceWorker.getRegistrations().then(function(registrations) {
//  for(let registration of registrations) {
//   registration.unregister()
// } })

$(".tooltipped").tooltip()
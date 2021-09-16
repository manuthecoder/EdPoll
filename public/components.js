class clipboardText {
  constructor(e) {
    this.e = e;
    document.body.insertAdjacentHTML(
      "beforeend",
      `
<input id="copyContainer" type="text">
`
    );
    const copyText = document.getElementById("copyContainer");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    copyText.value = e;
    navigator.clipboard.writeText(copyText.value);
    document.getElementById("copyContainer").remove();
    M.toast({
      html: "Copied to clipboard!",
    });
  }
}

function dark_mode() {
	if (document.documentElement.classList.contains("dark_mode")) {
		document.documentElement.classList.remove("dark_mode");
		document.querySelector('meta[name="theme-color"]').setAttribute('content',  '#fff');
		localStorage.setItem("dark_mode", "false");
	} else {
		document.querySelector('meta[name="theme-color"]').setAttribute('content',  '#1a1a1a');
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


function sendNotification(data, id) {
	Notification.requestPermission(function(result) {
    if (result === 'granted') {
      navigator.serviceWorker.ready.then(function(registration) {
        	var __nt = registration.showNotification('EdPoll', {
          body: data,
	data: data,
	image: (poll.banner ? poll.banner : null),
  icon: "https://image.flaticon.com/icons/png/512/5455/5455405.png",
          vibrate: [200, 100, 200],
					data: {
          dateOfArrival: Date.now()
        },
				actions: [
          {action: `view_${id}`, title: 'View updated results',
            // icon: 'images/checkmark.png'
					},
        ]
        });

				__nt.onclick = function() {
	window.open(`https://${window.location.hostname}/r/${id}`)
}

      });
    }
  });
}
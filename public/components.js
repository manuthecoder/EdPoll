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
		localStorage.setItem("dark_mode", "false");
	} else {
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
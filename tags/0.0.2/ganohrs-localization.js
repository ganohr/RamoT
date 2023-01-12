if (chrome !== undefined) {
	browser = chrome; // Chromium (Chrome / EDGE)
} else {
	// maybe firefox
}

function ganohrsLocalizeHtmlPage() {
	const lang = browser.i18n.getUILanguage();
	document.documentElement.lang = lang;
	document.querySelectorAll("[data-msg]").forEach(
		(element) => {
			const key = element.getAttribute("data-msg");
			const message = browser.i18n.getMessage(key);
			setTimeout(()=>{
				if (element.value === undefined) {
					element.textContent = message;
				} else {
					element.value = message;
				}
				element.lang = lang;
			}, 1);
		}
	);
}

document.addEventListener('DOMContentLoaded', ganohrsLocalizeHtmlPage);

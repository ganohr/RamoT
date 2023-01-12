if (chrome !== undefined) {
	browser = chrome; // Chromium (Chrome / EDGE)
} else {
	// maybe firefox
}

function saveOptions() {
	let options = {};
	document.querySelectorAll(
		"form input[id*='option']"
	).forEach(
		(element) => {
			if (
				false
				|| element.type === 'checkbox'
				|| element.type === 'radio'
			) {
				options[element.id] = element.checked;
			} else {
				options[element.id] = element.value;
			}
		}
	);
	browser.storage.local.set({ 'options': options }, () => { });
}

function getDefaultOptions() {
	return {
		"optionEnabled": true,
		"optionRemoveBlueMark": true,
		"optionRemoveFavs": true,
		"optionRemoveFollowed": true,
		"optionRemoveRecivedReply": true,
		"optionInsertCss": true,
	};
}

function loadOptions() {
	const updator = (items) => {
		let initialized = false;
		if (
			false
			|| items === null
			|| items === undefined
			|| items['optionEnabled'] === undefined
		) {
			items = getDefaultOptions();
			initialized = true;
		}
		Object.keys(items).forEach(
			(key) => {
				let element = document.getElementById(key);
				if (
					false
					|| element.type === 'checkbox'
					|| element.type === 'radio'
				) {
					element.checked = items[key];
				} else {
					element.value = items[key];
				}
			}
		);
		if (initialized) {
			saveOptions();
		}
	};
	browser.storage.local.get(
		'options',
		(items) => {
			updator(items.options)
		}
	);
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('optionSave').addEventListener('click', saveOptions);

if (chrome !== undefined) {
	browser = chrome; // Chromium (Chrome / EDGE)
} else {
	// maybe firefox
}

let domCalcKey = (key) => {
	return `ganohrs-ramot-${key}`;
};
let domKeyValuePairUpdate = (key, val) => {
	let elem = document.getElementById(domCalcKey(key));
	if (val === null) {
		if (elem !== null) {
			elem.remove();
		}
		return true;
	} else if(elem === null) {
		elem = document.createElement('hidden');
		elem.id = domCalcKey(key);
		document.body.appendChild(elem);
	}
	elem.value = val;
	return true;
};
let domGetValueWithKey = (key) => {
	const elem = document.getElementById(domCalcKey(key));
	if (elem === null) {
		return null;
	}
	return elem.value;
}

let options = null;
const optionUpdator = () => {
	try {
		browser.storage.local.get(
			'options',
			(items) => {
				options = items.options;
			}
		);
	} catch(e) {
		console.log(e);
	}
};

let contentCss = null;
async function loadCss() {
	const res = await fetch(browser.runtime.getURL('content.css'), { method: "GET" });
	contentCss = await res.text();
}
loadCss();

const parentRemoverWithDepth = (node, depth) => {
	let nowNode = node;
	if (nowNode === null) {
		return;
	}
	for (let i = 0; i < depth; i++) {
		if (nowNode.parentNode !== null) {
			nowNode = nowNode.parentNode;
		}
	}
	if (nowNode !== null) {
		nowNode.remove();
	}
};

const snapshotRemover = (snaps) => {
	for (let i = 0; i < snaps.snapshotLength; i++) {
		snaps.snapshotItem(i).remove();
	}
};
const evaluateRemover = (evaluatePart) => {
	snapshotRemover(
		document.evaluate(
			`//div[@data-testid='cellInnerDiv']//span[${evaluatePart}]/ancestor::div[@data-testid='cellInnerDiv']/div`,
			document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null
		)
	);
};

const cosmeticRemover = () => {
	if (options.optionRemoveBlueMark) {
		document.querySelectorAll(
			'svg.r-1cvl2hr.r-4qtqp9.r-yyyyoo.r-1xvli5t.r-f9ja8p.r-og9te1.r-bnwqim.r-1plcrui.r-lrvibr'
		).forEach(
			e => e.remove()
		);
	}
	if (options.optionRemoveViewCounts) {
		document.querySelectorAll(
			'svg path[d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"]'
		).forEach(
			e => parentRemoverWithDepth(e, 4)
		);
	}
	if (options.optionRemoveAuthorFavedTweets) {
		document.querySelectorAll(
			'div[aria-label="作成者がいいねしました"]'
		).forEach(
			e => parentRemoverWithDepth(e, 1)
		);
	}
	if (options.optionRemoveFollowed) {
		document.querySelectorAll(
			'a[aria-label="知り合いのフォロワー"]'
		).forEach(
			e => parentRemoverWithDepth(e, 10)
		);
	}
	if (options.optionRemovePromotedAccount) {
		snapshotRemover(
			document.evaluate(
				'//span[text()="あなたがフォローしているユーザーにフォローされています"]'
				+ '/ancestor::div[@class="css-1dbjc4n"]//div[@class="css-1dbjc4n r-1iusvr4 r-16y2uox r-ttdzmv"]',
				document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null
			)
		)
		snapshotRemover(
			document.evaluate(
				'//span[text()="あなたとこのユーザーには同じ相互フォローがいます"]'
				+ '/ancestor::div[@class="css-1dbjc4n"]//div[@class="css-1dbjc4n r-1iusvr4 r-16y2uox r-ttdzmv"]',
				document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null
			)
		)
	}
};

const timelineRemover = () => {
	if (options.optionRemoveRT) {
		evaluateRemover("text()='さんがリツイートしました'");
	}
	if (options.optionRemoveFavs) {
		evaluateRemover("contains(text(),'さんがいいねしました')");
	}
	if (options.optionRemoveFollowed) {
		evaluateRemover("contains(text(),'人がフォローしています')");
		evaluateRemover("contains(text(),'さんがフォローしています')");
		evaluateRemover("contains(text(),'さんがフォロー')");
	}
	if (options.optionRemoveRecivedReply) {
		evaluateRemover("contains(text(),'新しい返信を受け取りました')");
		evaluateRemover("contains(text(),'さんが返信を受け取りました')");
		evaluateRemover("contains(text(),'さんが返信しました')");
	}
	if (options.optionRemovePromotion) {
		evaluateRemover("text()='プロモーション'");
	}
	if (options.optionRemovePromotedAccount) {
		evaluateRemover("text()='おすすめユーザー'");
		evaluateRemover("text()='さらに表示'");
	}
	if (options.optionRemovePushNotifications) {
		evaluateRemover("text()='プッシュ通知'");
	}
	if (options.optionRemovePromoteForYou) {
		evaluateRemover("text()='あなたへのおすすめ'");
		evaluateRemover("text()='このツイートはありません。'");
	}
};

const cssLoader = () => {
	const specialCss = document.getElementById('ganohrs-ramot-style');
	if (specialCss !== null && options.optionInsertCss === false) {
		specialCss.remove();
	}
	if (contentCss === null || options.optionInsertCss === false) {
		return;
	}
	if (specialCss === null) {
		const elem = document.createElement('style');
		elem.id = domCalcKey('style');
		elem.innerText = contentCss;
		document.body.appendChild(elem);
	}
};

const followedClicker = () => {
	if (false
		|| domGetValueWithKey('followed-clicker') === 'runned'
		|| options === null || options === undefined
		|| ! options.optionAutoClickIfNotFollowed
	) {
		return;
	}
	domKeyValuePairUpdate('followed-clicker', 'running');
	let elem = document.evaluate(
		'//a[@href="/home"]//span[text()="フォロー中" or text()="おすすめ"]',
		document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null
	);
	if (elem === null || elem.snapshotLength !== 2) {
		return;
	}
	let snaps = document.evaluate(
		'//a[@href="/home"]//span[text()="フォロー中"]/following-sibling::div[@class="css-1dbjc4n r-xoduu5"]/preceding-sibling::span',
		document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null
	);
	if (snaps === null || snaps.snapshotLength === 0) {
		return;
	}
	snaps.snapshotItem(0).click();
	domKeyValuePairUpdate('followed-clicker', 'runned');
}

const main = () => {
	optionUpdator(); // this is not async, but it's ok.
	if (options === null || options.optionEnabled === false) {
		return;
	}

	followedClicker();

	cosmeticRemover();
	timelineRemover();
	cssLoader();
};

let scrollTimer = null;
window.addEventListener("scroll", () => {
	if (scrollTimer != null) {
		clearTimeout(scrollTimer);
	}
	optionUpdator();
	if (options === null || options.optionEnabled === false) {
		return;
	}
	const timming = options.optionHighPerformanceMode ? 100 : 300;
	scrollTimer = setTimeout(main, timming);
});

let mutationTimer = null;
document.addEventListener(
	'DOMContentLoaded',
	(event) => {
		const mo = new MutationObserver(
			(mutations) => {
				if (mutationTimer != null) {
					clearTimeout(mutationTimer);
				}
				optionUpdator();
				if (options === null || options.optionEnabled === false) {
					return;
				}
				const timming = options.optionHighPerformanceMode ? 100 : 300;
				mutationTimer = setTimeout(main, timming);
			}
		);
		const element = document.body;
		const config = {
			childList: true,
			subtree: true
		};
		mo.observe(element, config);
	}
);

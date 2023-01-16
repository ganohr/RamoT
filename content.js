if (chrome !== undefined) {
	browser = chrome; // Chromium (Chrome / EDGE)
} else {
	// maybe firefox
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
		evaluateRemover("text()='さんがフォローしています'");
		evaluateRemover("text()='さんがフォロー'");
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
		elem.id = 'ganohrs-ramot-style';
		elem.innerText = contentCss;
		document.body.appendChild(elem);
	}
};

const main = () => {
	optionUpdator(); // this is not async, but it's ok.
	if (options === null || options.optionEnabled === false) {
		return;
	}

	setTimeout(cosmeticRemover, 100);
	setTimeout(timelineRemover, 100);
	setTimeout(cssLoader, 100);
};

let scrolling = false;
let scrollTimer = null;
window.addEventListener("scroll", () => {
	if (scrollTimer != null) {
		clearTimeout(scrollTimer) ;
	}
	scrollTimer = setTimeout(main, 500) ;
});

document.addEventListener(
	'DOMContentLoaded',
	(event) => {
		const mo = new MutationObserver(
			(mutations) => {
				main();
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

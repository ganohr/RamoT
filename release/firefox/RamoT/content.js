if (chrome !== undefined) {
	browser = chrome; // Chromium (Chrome / EDGE)
} else {
	// maybe firefox
}

let options = null;
let optionUpdator = () => {
	try {
		browser.storage.local.get(
			'options',
			(items) => {
				options = items.options;
			}
		);
	} catch {
		if (runner !== null) {
			clearInterval(runner);
		}
	}
};

let contentCss = null;
async function loadCss() {
	const res = await fetch(browser.runtime.getURL('content.css'), { method: "GET" });
	contentCss = await res.text();
}
loadCss();

let parentRemoverWithDepth = (node, depth) => {
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

let snapshotRemover = (snaps) => {
	for (let i = 0; i < snaps.snapshotLength; i++) {
		setTimeout(() => snaps.snapshotItem(i).remove(), 1);
	}
};
let evaluateRmover = (evaluatePart) => {
	snapshotRemover(
		document.evaluate(
			`//div[@data-testid='cellInnerDiv']//span[${evaluatePart}]/ancestor::div[@data-testid='cellInnerDiv']/div`,
			document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null
		)
	);
};

let cosmeticRemover = () => {
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
}

let timelineRemover = () => {
	if (options.optionRemoveRT) {
		evaluateRmover("text()='さんがリツイートしました'");
	}
	if (options.optionRemoveFavs) {
		evaluateRmover("contains(text(),'さんがいいねしました')");
	}
	if (options.optionRemoveFollowed) {
		evaluateRmover("text()='さんがフォローしています'");
		evaluateRmover("text()='さんがフォロー'");
	}
	if (options.optionRemoveRecivedReply) {
		evaluateRmover("contains(text(),'新しい返信を受け取りました')");
		evaluateRmover("contains(text(),'さんが返信を受け取りました')");
	}
	if (options.optionRemovePromotion) {
		evaluateRmover("text()='プロモーション'");
	}
	if (options.optionRemovePromotedAccount) {
		evaluateRmover("text()='おすすめユーザー'");
		evaluateRmover("text()='さらに表示'");
	}
	if (options.optionRemovePushNotifications) {
		evaluateRmover("text()='プッシュ通知'");
	}
	if (options.optionRemovePromoteForYou) {
		evaluateRmover("text()='あなたへのおすすめ'");
	}
}

let cssLoader = () => {
	let specialCss = document.getElementById('ganohrs-ramot-style');
	if (specialCss !== null && options.optionInsertCss === false) {
		specialCss.remove();
	}
	if (contentCss === null || options.optionInsertCss === false) {
		return;
	}
	if (specialCss === null) {
		specialCss = document.createElement('style');
		specialCss.id = 'ganohrs-ramot-style';
		specialCss.innerText = contentCss;
		document.body.appendChild(specialCss);
	}
}

let runner = setInterval(() => {
	optionUpdator(); // this is not async, but it's ok.
	if (options === null || options.optionEnabled === false) {
		return;
	}

	setTimeout(cosmeticRemover, 100);
	setTimeout(timelineRemover, 100);
	setTimeout(cssLoader, 100);

}, 100);

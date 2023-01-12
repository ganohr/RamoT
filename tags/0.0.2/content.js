if (chrome !== undefined) {
	browser = chrome; // Chromium (Chrome / EDGE)
} else {
	// maybe firefox
}

let runner = null;

let options = null;
function optionUpdator() {
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
}

let contentCss = null;
async function loadCss() {
	const res = await fetch(browser.runtime.getURL('content.css'), { method: "GET" });
	contentCss = await res.text();
}

let already_running = document.getElementById('ganohrs-ramot');
if (already_running === null) {
	let dummy = document.createElement('hidden');
	dummy.id = 'ganohrs-ramot';
	document.body.appendChild(dummy);
	loadCss();
	runner = setInterval(() => {
		optionUpdator(); // this is not async, but it's ok.
		if (options === null || options.optionEnabled === false) {
			return;
		}
		/*
		document.querySelectorAll(
			'svg[aria-label="認証済みアカウント"] g path:first-child'
		).forEach(
			e => e.getAttribute("clip-rule") !== "evenodd"
				&& e.parentNode.parentNode.remove()
		);*/
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
				e => e.parentNode.parentNode.parentNode.parentNode.remove()
			);
		}
		if (options.optionRemoveAuthorFavedTweets) {
			document.querySelectorAll(
				'div[aria-label="作成者がいいねしました"]'
			).forEach(
				e => e.parentNode.remove()
			);
		}
		let snapshotRemover = (snaps) => {
			for (let i = 0; i < snaps.snapshotLength; i++) {
				snaps.snapshotItem(i).remove();
			}
		};
		let evOpts = [];
		if (options.optionRemoveRT) {
			evOpts.push("text()='さんがリツイートしました'");
		}
		if (options.optionRemoveFavs) {
			evOpts.push("contains(text(),'さんがいいねしました')");
		}
		if (options.optionRemoveFollowed) {
			evOpts.push("text()='さんがフォローしています'");
			evOpts.push("text()='フォロー'");
		}
		if (options.optionRemoveRecivedReply) {
			evOpts.push("contains(text(),'さんが新しい返信を受け取りました')");
			evOpts.push("contains(text(),'さんが返信を受け取りました')");
		}
		if (options.optionRemovePromotion) {
			evOpts.push("text()='プロモーション'");
		}
		if (options.optionRemovePromotedAccount) {
			evOpts.push("text()='おすすめユーザー'");
		}
		if (options.optionRemovePushNotifications) {
			evOpts.push("text()='プッシュ通知'");
		}
		let evOptions = "";
		for (let i = 0; i < evOpts.length; i++) {
			evOptions += evOpts[i];
			if (i < (evOpts.length - 1)) {
				evOptions += " or ";
			}
		}
		snapshotRemover(
			document.evaluate(
				"//div[@data-testid='cellInnerDiv']//span["
				+ evOptions
				+ "]/ancestor::div[@data-testid='cellInnerDiv']/div"
				, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null
			)
		);

		/*
		snapshotRemover(
			document.evaluate(
				"//div[@data-testid='cellInnerDiv']//span["
				+ "text()='さんがリツイートしました' or "
				+ "text()='さらに表示' or "
				+ "text()='さんがフォローしています' or "
				+ "text()='フォロー' or "
				+ "text()='おすすめユーザー' or "
				+ "text()='プロモーション' or "
				+ "contains(text(),'さんがフォロー') or "
				+ "contains(text(),'さんが新しい返信を受け取りました') or "
				+ "contains(text(),'さんが返信を受け取りました') or "
				+ "contains(text(),'さんが返信しました') or "
				+ "contains(text(),'さんがいいねしました')"
				+ "]/ancestor::div[@data-testid='cellInnerDiv']/div",
				document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null
			)
		);
		*/
		/*
		const remover =
			(ele, c) => ele.dataset.testid === "cellInnerDiv"
				? ele.remove()
				: (ele.parentNode.getAttribute("aria-label") !== "ホームタイムライン" && ele.parentNode !== null)
					? console.log(c, ele, setTimeout(()=>remover(ele.parentNode, c + 1), 2000))
					: void(0);
		document.querySelectorAll(".css-901oao.css-16my406.r-1tl8opc.r-bcqeeo.r-qvutc0").forEach(
			e => /(さんが|新しい)(返信|フォロー|いいね|リツイート)/.test(e.innerHTML)
				? setTimeout(()=>remover(e, 0), 2000)
				: void(0)
		);
		*/
		/*
		document.querySelectorAll(".css-901oao.css-16my406.r-1tl8opc.r-bcqeeo.r-qvutc0").forEach(
			e => /(さんが|新しい)(返信|フォロー|いいね)/.test(e.innerHTML)
				? e.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.remove()
				: void(0)
		);
		*/
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
	}, 1);
}

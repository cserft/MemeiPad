var Bookmarklet = function() {
	var previous = null;
	
	var check = function(callback) {
		if (Ti.App.oAuthAdapter.isLoggedIn()) {

			if (Ti.App.getArguments().url) {
				// Retrieves the data from the Bookmarklet
				var bookmarkletLink = Ti.App.getArguments().url.split("memeapp:")[1];
				Ti.API.info("Arguments URL: BookmarkletLink [" + bookmarkletLink + "], Previous [" + previous + "]");
				if (bookmarkletLink != previous) {

					if (Ti.App.newpostIsOpen == false) {
						callback(bookmarkletLink);
						previous = bookmarkletLink;

					} else {
						//Alert if the NewPost Screen is open
						var alertPaste = Titanium.UI.createAlertDialog({
							title: L('meme_paste_alert_title'),
							message: String.format(L("meme_paste_alert_message"), bookmarkletLink),
							buttonNames: [L('btn_alert_CANCEL'),L('btn_alert_YES')],
							cancel: 0
						});	
						alertPaste.show();

						alertPaste.addEventListener('click',function(e)	{
							if (e.index == 1){
								Ti.App.fireEvent("bookmarklet_link", {link: bookmarkletLink});
								previous = bookmarkletLink;
							}	
						});
					}
				}
			}
		} else {
			// Not Logged In
			Ti.API.debug("Not LoggedIn, not going to paste this Link on New Post");
		}	
	}
	
	return {
		check: check
	}
}();
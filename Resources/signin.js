var win = Ti.UI.currentWindow;

var continuation = win.continuation;

var signinView = Ti.UI.createView({
	backgroundColor:'white',
	width: 500,
	height: 400,
	borderRadius: 5
});
win.add(signinView);

var logoMeme = Titanium.UI.createImageView({
	image:'images/meme_logo_en.png',
	top:50,
	left:150,
	width:'auto',
	height:'auto'
});
signinView.add(logoMeme);

var btn_signin = Titanium.UI.createButton({
	backgroundImage:'images/btn_signin.png',
	top: 250,
	width:260,
	height:57,
	opacity:1
});
signinView.add(btn_signin);

// Sign In Button Listener
btn_signin.addEventListener("click",continuation);

// YQL 2-leg Oauth Request using native Titanium Support for YQL
Ti.Yahoo.setOAuthParameters(acessor.consumerKey,acessor.consumerSecret);

var queryYQL = 'SELECT * FROM meme.popular(17) WHERE locale="en"';

Ti.Yahoo.yql(queryYQL,function(e) {

	Ti.API.debug('Found YQL results data? ' + e.success);

	if (e.message) {
		Ti.API.error('Error Message getPopular(): ' + e.message);
	}

	// var posts = [];
	// var data = e.data;
	// var randomnumber = Math.floor(Math.random()*16);
	// var post = data.post[randomnumber];
});

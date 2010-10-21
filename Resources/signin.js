var win = Ti.UI.currentWindow;

var continuation = win.continuation;

// win.orientationModes = [
// 	Titanium.UI.LANDSCAPE_LEFT,
// 	Titanium.UI.LANDSCAPE_RIGHT
// ];

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


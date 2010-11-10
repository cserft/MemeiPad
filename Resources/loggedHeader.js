// ==========================================
// = THIS WINDOW SHOWS THE LOGGED IN HEADER =
// ==========================================

var win = Ti.UI.currentWindow;

var yql = win.yql; // retrieving YQL Object from previous Window

var yqlMemeInfo = yql.query("SELECT * FROM meme.info where owner_guid=me | meme.functions.thumbs(width=22,height=22)");

// ========================
// = retrieving yql data =
// ========================

if (yqlMemeInfo){
	//var dataMeme = JSON.parse(yqlMemeInfo);
	var meme = yqlMemeInfo.query.results.meme;	
}

var miniAvatarView = Titanium.UI.createImageView({
	image: meme.avatar_url.thumb,
	borderColor: 'black',
	border: 2,
	top:30,
	left:810,
	width:22,
	height:22
});
win.add(miniAvatarView);

//
// create base UI tab and root window
//	


var hiYahooUserLabel = Titanium.UI.createLabel({
	color:'#999999',
	text: 'Hi, ' + meme.name + '    |',
	font:{fontSize:12,fontFamily:'Helvetica Neue'},
    textAlign:'right',
	top:27,
	left:590,
	height:30,
	width:'150'
});
win.add(hiYahooUserLabel);

var signoutLabel = Titanium.UI.createLabel({
	color:'#999999',
	text: 'signout',
	font:{fontSize:12,fontFamily:'Helvetica Neue'},
    textAlign:'right',
	top:27,
	left:690,
	height:30,	
	width:'100'
});
win.add(signoutLabel);


var memeTitleLabel = Titanium.UI.createLabel({
	color:'#ffffff',
	text: meme.title,
	// text: 'Antonio Carlos Silveira',
	font:{fontSize:14,fontFamily:'Helvetica Neue',fontWeight:'bold'},
	textAlign:'left',
	top:27,
	left:840,
	height:30,
	width:150
});
win.add(memeTitleLabel);

signoutLabel.addEventListener("click", function(e) {

	Ti.API.info("Signout Link clicked");

	// Ti.UI.createAlertDialog({
	// 	        title: 'Signout',
	// 	        message: "Signout link clicked"
	// 	    }).show();

	oAuthAdapter.logout('meme');
	oAuthAdapter.login(showSignIn, showDashboard);
	
});
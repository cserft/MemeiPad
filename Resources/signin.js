var win = Ti.UI.currentWindow;
Ti.include('lib/secrets.js');

var continuation = win.continuation;

// var signinView = Ti.UI.createView({
// 	backgroundColor:'white',
// 	width: 500,
// 	height: 400,
// 	borderRadius: 5
// });
// win.add(signinView);
// 
// var logoMeme = Titanium.UI.createImageView({
// 	image:'images/meme_logo_en.png',
// 	top:50,
// 	left:150,
// 	width:'auto',
// 	height:'auto'
// });
// signinView.add(logoMeme);

// var btn_signin = Titanium.UI.createButton({
// 	backgroundImage:'images/btn_signin.png',
// 	top: 250,
// 	width:260,
// 	height:57,
// 	opacity:1
// });
// signinView.add(btn_signin);




// var yqlMemeInfo = yql.query("SELECT * FROM meme.info where owner_guid=me | meme.functions.thumbs(width=22,height=22)");
// 
// // ========================
// // = retrieving yql data =
// // ========================
// 
// if (yqlMemeInfo){
// 	//var dataMeme = JSON.parse(yqlMemeInfo);
// 	var meme = yqlMemeInfo.query.results.meme;	
// }
// 
// 
// var miniAvatarView = Titanium.UI.createImageView({
// 	image: meme.avatar_url.thumb,
// 	borderColor: 'black',
// 	border: 2,
// 	top:30,
// 	left:810,
// 	width:22,
// 	height:22
// });
// win1.add(miniAvatarView);
// 
// //
// // create base UI tab and root window
// //	


// 
// var hiYahooUserLabel = Titanium.UI.createLabel({
// 	color:'#999999',
// 	text: 'Hi, ' + meme.name + '    |',
// 	font:{fontSize:12,fontFamily:'Helvetica Neue'},
//     textAlign:'right',
// 	top:27,
// 	left:590,
// 	height:30,
// 	width:'150'
// });
// win1.add(hiYahooUserLabel);
// 
// var signoutLabel = Titanium.UI.createLabel({
// 	color:'#999999',
// 	text: 'signout',
// 	font:{fontSize:12,fontFamily:'Helvetica Neue'},
//     textAlign:'right',
// 	top:27,
// 	left:690,
// 	height:30,	
// 	width:'100'
// });
// win1.add(signoutLabel);
// 
// 
// signoutLabel.addEventListener("click", function(e) {
// 
// 	Ti.API.info("Signout Link clicked");
// 
// 	// Ti.UI.createAlertDialog({
// 	// 	        title: 'Signout',
// 	// 	        message: "Signout link clicked"
// 	// 	    }).show();
// 
// 	oAuthAdapter.logout('meme');
// 	oAuthAdapter.login(showSignIn, showDashboard);
// 	
// });


// 
// var memeTitleLabel = Titanium.UI.createLabel({
// 	color:'#ffffff',
// 	text: meme.title,
// 	// text: 'Antonio Carlos Silveira',
// 	font:{fontSize:14,fontFamily:'Helvetica Neue',fontWeight:'bold'},
// 	textAlign:'left',
// 	top:27,
// 	left:840,
// 	height:30,
// 	width:150
// });
// win1.add(memeTitleLabel);





// 
// // YQL 2-leg Oauth Request using native Titanium Support for YQL
// Ti.Yahoo.setOAuthParameters(consumerKey,consumerSecret);
// 
// var queryYQL = 'SELECT * FROM meme.popular(17) WHERE locale="en"';
// 
// Ti.Yahoo.yql(queryYQL,function(e) {
// 
// 	Ti.API.debug('Found YQL results data? ' + e.success);
// 
// 	if (e.message) {
// 		Ti.API.error('Error Message getPopular(): ' + e.message);
// 	}
// 
// 	// var posts = [];
// 	// var data = e.data;
// 	// var randomnumber = Math.floor(Math.random()*16);
// 	// var post = data.post[randomnumber];
// });

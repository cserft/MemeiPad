// =====================================================
// = presents the comments view from a given permalink =
// =====================================================

var commentView = Titanium.UI.createView({
	backgroundColor: 	'white',
	bottom: 			81,
	left: 				50,
	width: 				924,
	height: 			1, //555,
	zIndex: 			10,
	visible: 			true
});

var commentBoxView = Titanium.UI.createView({
	backgroundImage: 	'images/bg_comment_field_permalink.png',
	top: 				55,
	left: 				53,
	width: 				811,
	height: 			80,
	zIndex: 			2,
	opacity: 			0,
	visible: 			true
});
commentView.add(commentBoxView);

var commentField = Titanium.UI.createTextField({
	value: 			'',
	backgroundColor: 'transparent',
	hintText: 		L('repostCommentField_hint_text'),
	color: 			'#666',
	textAlign: 		'left',
	font: 			{fontSize:14,fontFamily:'Georgia', fontStyle:'italic'},
	width: 			560,
	height: 		44,
	top: 			18,
	left: 			50,
	zIndex: 		1,
	borderStyle: 	Titanium.UI.INPUT_BORDERSTYLE_NONE,
	keyboardType: 	Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType: 	Titanium.UI.RETURNKEY_DONE,
	clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS
});
commentBoxView.add(commentField);

// SEND COMMENT BUTTON
var btn_send_comment2 = Titanium.UI.createButton({
	backgroundImage: 	L('path_btn_send_commentbackground_image'),
	title: 				L('btn_send_comment_title'),
	color: 				'white',
	textAlign: 			'center',
	font: 				{fontSize:14, fontFamily:'Helvetica', fontWeight:'bold'},
	width: 				125,
	height: 			34,
	top: 				19,
	left: 				659,
	zIndex: 			1
});
commentBoxView.add(btn_send_comment2);


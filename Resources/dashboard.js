var win = Ti.UI.currentWindow;

var scrollView = Ti.UI.createScrollView({
	backgroundColor:'transparent',
	contentWidth:1024,
	contentHeight:1000,
	top:0,
	showVerticalScrollIndicator:true,
	showHorizontalScrollIndicator:false
});
win.add(scrollView);

var label1 = Titanium.UI.createLabel({
	color:'black',
	text:'Dashboard Window',
	font:{fontSize:35,fontFamily:'Helvetica Neue'},
	textAlign:'left',
	left:10,
	width:'auto',
	zIndex:1
});
scrollView.add(label1);

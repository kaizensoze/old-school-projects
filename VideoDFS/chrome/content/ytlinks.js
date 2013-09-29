/******************************************************************************
 *            Copyright (c) 2006 Michel Gutierrez. All Rights Reserved.
 ******************************************************************************/

YTLinks={
	currentPage: null,
	pageQueue: []/*,
	parser: Components.classes["@mozilla.org/xmlextras/domparser;1"]
               .createInstance(Components.interfaces.nsIDOMParser),
    youTubeControl: new YouTubeControl()
    */
}

YTLinks.popupShowing=function() {
	DWHelper.ytLinksMenuItem.setAttribute("hidden","true");
	var popupNode=document.popupNode;
	if(popupNode==null)
		popupNode=DWHelper_getPopupNode(content);
	if(popupNode==null)
		return;
	try {
	var links=YTLinks.getYTLinks(popupNode);
	if(links.length>0)
		DWHelper.ytLinksMenuItem.setAttribute("hidden","false");
	} catch(e) { }
}

YTLinks.getYTLinks=function(popupNode) {
	var doc=popupNode.ownerDocument;
	var baseUri=Components.classes["@mozilla.org/network/io-service;1"]
               .getService(Components.interfaces.nsIIOService)
               .newURI(doc.URL, null, null);
	var links=[];
	var seln=doc.defaultView.getSelection();
	if(seln.rangeCount>0) {
		var range=seln.getRangeAt(0);
		if(!range.collapsed) {
			var linksMap={};
			var firstLink=YTLinks.getLinkInAncestors(range.startContainer,baseUri);
			if(firstLink!=null)
				linksMap[firstLink]="";
			var ancestor=range.commonAncestorContainer;
			var url0=YTLinks.getLinkInAncestors(ancestor, baseUri);
			if(url0!=null) {
				links.push(url0);
			} else {
				YTLinks.getLinks(ancestor, linksMap, baseUri, { 
					inRange: false, 
					startContainer: range.startContainer,
					endContainer: range.endContainer
					});
				for(var url in linksMap) {
					links.push(url);
				}
			}
			return links;
		}
	} 
	
	if(popupNode) {
		var url=YTLinks.getLinkInAncestors(popupNode, baseUri);
		if(url!=null)
			links.push(url);
	}
	
	return links;
}

YTLinks.getLinks=function(node,linksMap, baseUri, scanData) {
	try {
	
	if(scanData.inRange==false && node==scanData.startContainer)
		scanData.inRange=true;

	if(node.nodeType==Node.ELEMENT_NODE) {
		if(scanData.inRange==true) {
			if(node.tagName.toLowerCase()=="a") {
				var href=node.getAttribute("href");
				if(href!=null && href.length>0) {
					var url=baseUri.resolve(href);
					if(YTLinks.acceptLink(url)) {
						linksMap[url]="";
					}
				}
			}
		}
		var node0=node.firstChild;
		while(node0) {
			YTLinks.getLinks(node0,linksMap,baseUri,scanData);
			node0=node0.nextSibling;
		}
	}

	if(scanData.inRange==true && node==scanData.endContainer)
		scanData.inRange=false;

	} catch(e) {
		return [];
	}
}

YTLinks.acceptLink=function(url) {
	if(url.match(/^http\:\/\/(?:[^\/\.]+\.)?youtube\.com\/watch\?/))
		return true;
	return false;
}

YTLinks.getLinkInAncestors=function(node,baseUri) {
	while(node!=null) {
		if(node.nodeType==Node.ELEMENT_NODE) {
			if(node.tagName.toLowerCase()=="a") {
				var href=node.getAttribute("href");
				if(href!=null && href.length>0) {
					var url=baseUri.resolve(href);
					if(YTLinks.acceptLink(url))
						return url;
				}
			}
		}
		node=node.parentNode;
	}
	return null;
}

YTLinks.menuClicked=function(event) {
	var popupNode=document.popupNode;
	if(popupNode==null)
		popupNode=DWHelper_getPopupNode(content);
	if(popupNode==null)
		return;
	var links=YTLinks.getYTLinks(popupNode);
	for(var i=0;i<links.length;i++) {
		YTLinks.queuePage(links[i]);
	}
	
}

YTLinks.getYTPage=function(url) {
	var cb=function(status, request) {
		if(status) {
			try {
				var title=null;
				var videoId=null;
				var tParam=null;
				var text=request.responseText;
				var m=/meta name="title" content="(.*)"/.exec(text);
				if(m!=null && m.length==2)
					title=m[1];
				m=/video_id=([^&]+)(?:&.*)&t=([^&]+)/.exec(text);
				if(m!=null && m.length==3) {
					videoId=m[1];
					tParam=m[2];
				}
				if(title!=null && videoId!=null & tParam!=null) {
					var url="http://www.youtube.com/get_video?video_id=";
					url+=videoId;
					url+="&t=";
					url+=tParam;
					var fileName=title+".flv";
					fileName=fileName.replace(/[^a-zA-Z0-9\.\-]/g,"_");
					DWHelper_downloadFileBlind(fileName,url);
				}
			} catch(e) {
			}
		} else {
		}
		YTLinks.currentPage=null;
		YTLinks.checkQueue();
	}
	DWHUtil.loadAsync(url,cb,{_this:this,url:url},null,"GET",{});
}


YTLinks.getYTPage1=function(url) {
	var frameVBox=document.getElementById("dwhelper_browser_vbox");
	dump("VBox="+frameVBox+"\n");
	if(frameVBox.firstChild!=null) {
		frameVBox.removeChild(frameVBox.firstChild);
	}
	var iframe=document.createElementNS("http://www.w3.org/1999/xhtml", "iframe");
	var cb=function() {
		var iframe=document.getElementById("dwhelper_browser_vbox").firstChild;
		if(iframe!=null) {
			var doc=iframe.contentDocument;
			var data=YTLinks.youTubeControl.getDataFromPage(doc);
			if(data!=null) {
				var url="http://www.youtube.com/get_video?video_id=";
				url+=data.videoId;
				url+="&t=";
				url+=data.tParam;
				var fileName=data.title+".flv";
				fileName=fileName.replace(/[^a-zA-Z0-9\.\-]/g,"_");
				DWHelper_downloadFile("youtube",fileName,url);
			}
		}
		YTLinks.currentPage=null;
		YTLinks.checkQueue();
	}
	frameVBox.appendChild(iframe);
	iframe.addEventListener("load",cb,true);
	iframe.setAttribute("src",url);
}

YTLinks.queuePage=function(url) {
	YTLinks.pageQueue.push(url);
	YTLinks.checkQueue();
}

YTLinks.checkQueue=function() {
	if(YTLinks.currentPage!=null)
		return;
	if(YTLinks.pageQueue.length>0) {
		YTLinks.currentPage=YTLinks.pageQueue.shift();
		YTLinks.getYTPage(YTLinks.currentPage);
	}
}


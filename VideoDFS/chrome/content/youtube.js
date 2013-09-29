/******************************************************************************
 *            Copyright (c) 2006 Michel Gutierrez. All Rights Reserved.
 ******************************************************************************/

function YouTubeControl() {
}

YouTubeControl.prototype.getDataFromPage=function(doc) {
	if(/^http:\/\/[^\/]*\.?youtube\.[^\/\.]+/.test(doc.URL)) {
		var dom=doc.documentElement;
		var scripts=DWHUtil.xpGetStrings(dom,".//script/text()");
		var videoId=null;
		var t=null;
		for(var i=0;i<scripts.length;i++) {
			var script=scripts[i];
			var match=/video_id=([^&]+)(?:&.*)&t=([^&]+)/m.exec(script);
			if(match!=null && match.length==3) {
				videoId=match[1];
				t=match[2];
				break;
			}
		}
		if(videoId==null || t==null) {
			var embeds=DWHUtil.xpGetStrings(dom,".//embed/@src");
			for(var i=0;i<embeds.length;i++) {
				var embed=embeds[i];
				var match=/video_id=(.*?)&.*t=(.*?)(?:&|")/m.exec(embed);
				if(match!=null && match.length==3) {
					videoId=match[1];
					t=match[2];
					break;
				}
			}
			if(videoId==null || t==null) {
				return;
			}
		}
		var title=DWHUtil.xpGetString(dom,"/html/head/meta[@name='title']/@content");
		return {
			videoId: videoId,
			tParam: t,
			title: title
		}
	} else {
		return null;
	}
}

YouTubeControl.prototype.updateMenu=function(menu) {
	try {
		var data=this.getDataFromPage(content.document);
		dump("YouTubeControl added these items to menu: ");
		if(data!=null) {
		    dump(data.title + "  ");
			menu.push({label:data.title, src:"http://www.youtube.com/favicon.ico",
				value: data.videoId+"|"+data.tParam+"|"+data.title, controler: "youtube" });
		}
		dump("\n");
	} catch(e) { }
}

YouTubeControl.prototype.download=function(value,copyLink) {
	var url="http://www.youtube.com/get_video?video_id=";
	var values=value.split("|");
	url+=values[0];
	url+="&t=";
	url+=values[1];
	var title=values[2];
	var fileName=title+".flv";
	var unmodifiedFilename=false;
	try {
		unmodifiedFilename=DWHelper.pref.getBoolPref("yt-unmodified-filename");		
	} catch(e) {}
	if(unmodifiedFilename==false) {
		var keepSpaces=false;
		try {
			keepSpaces=DWHelper.pref.getBoolPref("yt-keep-spaces");
		} catch(e) {}
		if(keepSpaces)
			fileName=fileName.replace(/[^a-zA-Z0-9\.\- ]/g,"_");
		else
			fileName=fileName.replace(/[^a-zA-Z0-9\.\-]/g,"_");
	} else {
		fileName=fileName.replace(/[\/"]/g,"_");
	}
	if(DWHelper_canChooseName()) {
		try {
			if(copyLink==true)
				DWHUtil.toClipboard(url);
			else
				DWHelper_downloadFileAs(fileName,url);
		} catch(e) {}
	} else {
		try {
			DWHelper_downloadFile("youtube",fileName,url);
		} catch(e) { }
	}
}

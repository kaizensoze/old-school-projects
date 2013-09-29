/******************************************************************************
 *            Copyright (c) 2006 Michel Gutierrez. All Rights Reserved.
 ******************************************************************************/

function MediaWeight() {
	this.entries={};
	this.updateDone=false;
}

MediaWeight.prototype.cleanEntries=function() {
	var entries={};
	var timeNow=new Date().getTime();
	for(var i in this.entries) {
		var entry=this.entries[i];
		if(timeNow-entry.time<DWHelper_getMenuHttpExpiration()) {
			entries[i]=entry;
		}
	}
	this.entries=entries;
}

MediaWeight.prototype.updateMenu=function(menu) {
	this.cleanEntries();
    dump("MediaWeight added these items to menu: ");	
	for(var i in this.entries) {
		var entry=this.entries[i];
		dump(entry.filename + "  ");
		menu.push({
			controler: "mediaweight", 
			src: "chrome://dwhelper/skin/mediaweight.gif",
			label: entry.filename,
			value: ""+i
		});
		DWHUtil.insertVideo(i, "MediaWeight");
	}
	dump("\n");	
	this.updateDone=true;
}

// This is called when you select a menu entry that is a get_video (?) (basket icon)
MediaWeight.prototype.download=function(value,copyLink) {
    dump("MediaWeight.download\n");
	var entry=this.entries[value];
	if(entry!=null) {
		if(copyLink==true) {
			DWHUtil.toClipboard(entry.url);
		} else {
			var filename=DWHelper_getUniqueFile("mediaweight",entry.filename);
			if(DWHelper_canChooseName()) {
				try {
					DWHelper_downloadFileAs(filename,entry.url);
				} catch(e) {}
			} else {
				try {
					DWHelper_downloadFile("mediaweight",filename,entry.url);
				} catch(e) { }
			}
		}
   	}
}

MediaWeight.prototype.reset=function() {
}

MediaWeight.prototype.newResponse=function(subject) {

	var enabled=false;
	try {
		enabled=DWHelper.pref.getBoolPref("mediaweight-enabled");
	} catch(e) {}
	if(enabled==false)
		return;

    var request=subject.QueryInterface(Components.interfaces.nsIRequest);
    var httpChannel=subject.QueryInterface(Components.interfaces.nsIHttpChannel);
    
	var contentSize;
	try {
		contentSize=parseInt(httpChannel.getResponseHeader("content-length"));
	} catch(e) {
		return;
	}

	var threshold=1048576;
	try {
		threshold=DWHelper.pref.getBoolPref("mediaweight-threshold");
	} catch(e) {}
	if(threshold==false)
		return;
	
	var contentType="video/x-flv";
	try {
		contentType=httpChannel.getResponseHeader("content-type");
	} catch(e) {
	}
	
	if(contentSize!=null && isNaN(contentSize)==false && contentSize>=threshold) {
		var filename=null;
		
		try {
			var wnd=httpChannel.notificationCallbacks.getInterface(Components.interfaces.nsIDOMWindow);
			//dump("Found wnd: "+wnd.document.URL+"\n");
		} catch(e) {
			//dump("window not found\n");
		}

		var contentDisp=null;
		try {
			contentDisp=httpChannel.getResponseHeader("content-disposition");
		} catch(e) {
		}
		if(contentDisp!=null) {
			if(/filename=/.test(contentDisp)) {
				filename=/filename=([^; ]*)/.exec(contentDisp)[1];
			}
		}

		if(filename==null) {
			var parts=/^.*\/([^\/]+)\.([^\.\/]{1,5})$/.exec(request.name);
			if(parts!=null && parts.length==3) {
				filename=parts[1]+"."+parts[2];
			} else {
				parts=/^.*\/(?:x-)?(.+?)(?:;.*)?$/.exec(contentType);
				if(parts!=null && parts.length==2)
					filename="wfile-"+Math.floor(Math.random()*1000000000)+"."+parts[1];
				else
					filename="wfile-"+Math.floor(Math.random()*1000000000);
			}
		}
		this.entries[request.name]={url: request.name, filename: filename,
			time: new Date().getTime() };
		if(this.updateDone==true) {
			DWHelper_loadMenu();
		}
		
		var dontChangeCache=true;
		try {
			dontChangeCache=DWHelper.pref.getBoolPref("dont-change-cache");
		} catch(e) {
		}
		if(dontChangeCache==false) {
			if(httpChannel.isNoCacheResponse() || httpChannel.isNoStoreResponse()) {
				httpChannel.setResponseHeader("cache-control","public",false);
			}
		}
	}
}

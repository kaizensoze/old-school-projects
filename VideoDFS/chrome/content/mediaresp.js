/******************************************************************************
 *            Copyright (c) 2006 Michel Gutierrez. All Rights Reserved.
 ******************************************************************************/

function MediaResp() {
	this.entries={};
	this.updateDone=false;
}

MediaResp.prototype.cleanEntries=function() {
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

MediaResp.prototype.updateMenu=function(menu) {
	this.cleanEntries();
	dump("MediaResp added these items to menu: ");
	for(var i in this.entries) {
		var entry=this.entries[i];
		dump(entry.filename + "  ");
		menu.push({
			controler: "mediaresp", 
			src: "chrome://dwhelper/skin/mediaresp.gif",
			label: entry.filename,
			value: ""+i
		});
		DWHUtil.insertVideo(i, "MediaResp");
	}
	dump("\n");	
	this.updateDone=true;
}

// This is called when you select a menu entry that is directly the file.
MediaResp.prototype.download=function(value,copyLink) {
    dump("MediaResp.download\n");
	var entry=this.entries[value];
	if(entry!=null) {
		if(copyLink==true) {
			DWHUtil.toClipboard(entry.url);
		} else {
			var filename=DWHelper_getUniqueFile("mediaresp",entry.filename);
			if(DWHelper_canChooseName()) {
				try {
					DWHelper_downloadFileAs(filename,entry.url);
				} catch(e) {}
			} else {
				try {
					DWHelper_downloadFile("mediaresp",filename,entry.url);
				} catch(e) { }
			}
		}
   	}
}

MediaResp.prototype.reset=function() {
}

MediaResp.prototype.newResponse=function(subject) {
    var request=subject.QueryInterface(Components.interfaces.nsIRequest);
    var httpChannel=subject.QueryInterface(Components.interfaces.nsIHttpChannel);
    
	var contentType;
	try {
		contentType=httpChannel.getResponseHeader("content-type");
		//dump("=>"+contentType+" "+request.name+"\n");
	} catch(e) {
		return;
	}
	
	if(contentType!=null && (DWHUtil.startsWith(contentType,"video/") || DWHUtil.startsWith(contentType,"audio/") ||
		(contentType=="application/octet-stream" && 
		(/http:\/\/[^\/]*\.megarotic\.com/.test(request.name) || /http:\/\/[^\/]*\.megavideo\.com/.test(request.name)))) && 
		this.entries[request.name]==null) {
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
			if(/^video\/x-.*$/.test(contentType)) {
				filename="afile-"+Math.floor(Math.random()*1000000000)+"."+
					(/video\/x-([^;]*)/.exec(contentType)[1]);
			} else if(DWHUtil.startsWith(contentType,"video/")) {
				filename="file-"+Math.floor(Math.random()*1000000000)+"."+
					(/video\/([^ ,]*).*$/.exec(contentType)[1]);
			} else if(DWHUtil.startsWith(contentType,"audio/")) {
				filename="file-"+Math.floor(Math.random()*1000000000)+"."+
					(/audio\/(?:x-)?([^ ,]*).*?$/.exec(contentType)[1]);
			} else {
				filename="file-"+Math.floor(Math.random()*1000000000)+".flv";
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

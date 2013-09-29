/******************************************************************************
 *            Copyright (c) 2006 Michel Gutierrez. All Rights Reserved.
 ******************************************************************************/

function MediaReq() {
	this.entries={};
	this.updateDone=false;
}

MediaReq.prototype.cleanEntries=function() {
	var entries={};
	var timeNow=new Date().getTime();
	for(var i in this.entries) {
		var entry=this.entries[i];
		if(timeNow-entry.time < DWHelper_getMenuHttpExpiration()) {
			entries[i]=entry;
		}
	}
	this.entries=entries;
}

MediaReq.prototype.updateMenu=function(menu) {
	this.cleanEntries();
	dump("MediaReq added these items to menu: ");
	for(var i in this.entries) {
		var entry=this.entries[i];
		dump(entry.filename + "  ");
		menu.push({
			controler: "mediareq", 
			src: "chrome://dwhelper/skin/mediareq.gif",
			label: entry.filename,
			value: ""+i
		});
		DWHUtil.insertVideo(i, "MediaReq");
	}
	dump("\n");
	this.updateDone=true;
}

MediaReq.prototype.download=function(value,copyLink) {
    dump("MediaReq.download\n");
	var entry=this.entries[value];
	if(entry!=null) {
		if(copyLink==true) {
			DWHUtil.toClipboard(entry.url);
		} else {
			var filename=DWHelper_getUniqueFile("mediareq",entry.filename);
			if(DWHelper_canChooseName()) {
				try {
					DWHelper_downloadFileAs(filename,entry.url);
				} catch(e) {}
			} else {
				try {
					DWHelper_downloadFile("mediareq",filename,entry.url);
				} catch(e) { }
		   	}
		}
	}
}

MediaReq.prototype.reset=function() {
}

MediaReq.prototype.newRequest=function(req) {
	//dump("Request: "+req+"\n");
	var patt="flv|ram|mpg|mpeg|avi|rm|wmv|mov|asf";
	try {
		patt=DWHelper.pref.getCharPref("mediareq-extensions");
	} catch(e) {}
	var mPatt=new RegExp("^.*/([^\\/\\?]*\\.(?:"+patt+"))(?:\\?|$)","i");
	var m=mPatt.exec(req);
	if(m!=null && m.length==2 && this.entries[req]==null) {
		this.entries[req]={url: req, filename: m[1], time: new Date().getTime() };
		if(this.updateDone==true) {
			DWHelper_loadMenu();
		}
	}	
}

MediaReq.prototype.newResponse=function(subject) {
    var request=subject.QueryInterface(Components.interfaces.nsIRequest);
	//dump("Response: "+request.name+"\n");
    var httpChannel=subject.QueryInterface(Components.interfaces.nsIHttpChannel);
    if(httpChannel.responseStatus<200 || httpChannel.responseStatus>=300) {
    	if(this.entries[request.name]!=null) {
    		delete this.entries[request.name];
			if(this.updateDone==true) {
				DWHelper_loadMenu();
			}    		
    	}
    }
}

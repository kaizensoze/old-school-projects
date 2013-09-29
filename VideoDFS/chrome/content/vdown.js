/******************************************************************************
 *            Copyright (c) 2006 Michel Gutierrez. All Rights Reserved.
 ******************************************************************************/

function VDownControler() {
	this.processed={};
	this.updateDone=false;
	this.entries=[];
}

VDownControler.prototype.updateMenu=function(menu) {
    dump("VDownControler added these items to menu: ");	
	for(var i=0;i<this.entries.length;i++) {
        dump(this.entries[i].filename + "  ");
		menu.push(this.entries[i]);
	}
	dump("\n");
	this.updateDone=true;
}

VDownControler.prototype.manualCheck=function() {
	try {
		var url=content.location.href;
		var dwUrl=this.processed[url];
		if(dwUrl!=null) {
			if(dwUrl!="") {
				this.entries.push({
					controler: "vdown", 
					src: "http://javimoya.com/blog/favicon.ico",
					label: "VideoDownloader",
					value: dwUrl
				});
				if(this.updateDone==true) {
					DWHelper_loadMenu();
				}
			}
			return;
		}
		this.processed[url]="";
		var cb=function(status, request) {
			if(status) {
				request.userArgs._this.response(request.responseText,request.userArgs.url);
			} else {
				dump("Callback error: "+request+"\n");
			}
		}
		var vdUrl="http://videodownloader.net/get/?url="+escape(url)+"&orig=ffp&ver=1";
		DWHUtil.loadAsync(vdUrl,cb,{_this:this,url:url});
	} catch(e) {
	}
}

VDownControler.prototype.reset=function() {
	this.entries=[];
	this.updateDone=false;
}

VDownControler.prototype.download=function(value,copyLink) {
	var url=value;
	if(copyLink==true) {
		DWHUtil.toClipboard(url);
	} else {
		var fileName="file-"+Math.floor(Math.random()*1000000000);
		if(DWHelper_canChooseName()) {
			try {
				DWHelper_downloadFileAs(fileName,url);
			} catch(e) {}
		} else {
			try {
				DWHelper_downloadFile("videodownloader",fileName,url);
			} catch(e) { }
		}
	}
}

VDownControler.prototype.response=function(text,url) {
	var dwUrl=/<a href=\"(.*?)\".*?><img src=\"\.\/vd\/botdl.gif/.exec(text)[1];
	this.processed[url]=dwUrl;
	this.entries.push({
		controler: "vdown", 
		src: "http://javimoya.com/blog/favicon.ico",
		label: "VideoDownloader",
		value: dwUrl
	});
	if(this.updateDone==true) {
		DWHelper_loadMenu();
	}
}


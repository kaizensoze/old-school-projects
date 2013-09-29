/******************************************************************************
 *            Copyright (c) 2006 Michel Gutierrez. All Rights Reserved.
 ******************************************************************************/

function KeepVidControler() {
	this.processed={};
	this.updateDone=false;
	this.entries=[];
}

KeepVidControler.prototype.updateMenu=function(menu) {
    dump("KeepVidControler added these items to menu: ");
	for(var i=0;i<this.entries.length;i++) {
	    dump(this.entries[i].filename + "  ");
		menu.push(this.entries[i]);
	}
	dump("\n");
	this.updateDone=true;
}

KeepVidControler.prototype.manualCheck=function() {
	try {
		var url=content.location.href;
		var dwUrl=this.processed[url];
		if(dwUrl!=null) {
			if(dwUrl!="") {
				this.entries.push({
					controler: "keepvid", 
					src: "http://keepvid.com/favicon.ico",
					label: "KeepVid",
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
		var kvUrl="http://keepvid.com/index_p/";
		var kvBody="url="+escape(url)+"&site=aa";
		var options={
			contentType: "application/x-www-form-urlencoded"
		}
		DWHUtil.loadAsync(kvUrl,cb,{_this:this,url:url},kvBody,"POST",options);
	} catch(e) {
	}
}

KeepVidControler.prototype.reset=function() {
	this.entries=[];
	this.updateDone=false;
}

KeepVidControler.prototype.download=function(value,copyLink) {
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
				DWHelper_downloadFile("keepvid",fileName,url);
			} catch(e) { }
		}
	}
}

KeepVidControler.prototype.response=function(text,url) {
	var dwUrl=/<a href=\"(.*?)\"/.exec(text)[1];
	this.processed[url]=dwUrl;
	this.entries.push({
		controler: "keepvid", 
		src: "http://keepvid.com/favicon.ico",
		label: "KeepVid",
		value: dwUrl
	});
	if(this.updateDone==true) {
		DWHelper_loadMenu();
	}
}


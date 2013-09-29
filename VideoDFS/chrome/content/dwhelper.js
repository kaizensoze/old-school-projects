/******************************************************************************
 *            Copyright (c) 2006 Michel Gutierrez. All Rights Reserved.
 ******************************************************************************/

var DWHelper={
	queue: [],
	current: null
};

DWHelper.baseMenu=[
	{ 
		label: DWHUtil.getText("menu.preferences"),
		oncommand: "DWHelper_preferences()"
	},
	{ 
		label: DWHUtil.getText("menu.sites"),
		oncommand: "DWHelper_openSites()"
	},
	{ 
		label: DWHUtil.getText("menu.help"),
		oncommand: "DWHelper_help()"
	},
/*
	{ 
		label: DWHUtil.getText("menu.showhttp"),
		oncommand: "DWHelper_showHttp()"
	},
*/
	{ menuseparator: true },
	{ 
		label: DWHUtil.getText("menu.manual-check"),
		oncommand: "DWHelper_manualCheck()"
	},
	{ menuseparator: true },
	{ 
		label: DWHUtil.getText("menu.subtile.extension"),
		menu: [
			{
				label: DWHUtil.getText("menu.subtile.install"),
				oncommand: "DWHelper_gotoSubtile('dh-st-install')"
			},
			{
				label: DWHUtil.getText("menu.subtile.monitor-video-sites"),
				oncommand: "DWHelper_gotoSubtile('dh-monitor-vsites')"
			},
			{
				label: DWHUtil.getText("menu.subtile.cust-monitor-video-sites"),
				oncommand: "DWHelper_gotoSubtile('dh-st-build')"
			},
			{
				label: DWHUtil.getText("menu.subtile.monitor-extension-review"),
				oncommand: "DWHelper_gotoSubtile('dh-fxext')"
			},
			{
				label: DWHUtil.getText("menu.subtile.create-menu"),
				oncommand: "DWHelper_gotoSubtile('dh-create')"
			},
		]
	},
/*	{ 
		label: DWHUtil.getText("menu.to-sumo"),
		oncommand: "DWHelper_gotoSumo()"
	},*/
	{ menuseparator: true },
	{ 
		label: DWHUtil.getText("menu.about"),
		oncommand: "DWHelper_about()"
	}
];


DWHelper.prefService=Components.classes["@mozilla.org/preferences-service;1"]
	.getService(Components.interfaces.nsIPrefService);
DWHelper.pref=DWHelper.prefService.getBranch("dwhelper.");

DWHelper.controlers= {
		"youtube": new YouTubeControl(),
		"medialink": new MediaLink(),
		"mediareq": new MediaReq(),
		"mediaresp": new MediaResp(),
		"vdown": new VDownControler(),
		"keepvid": new KeepVidControler(),
		"plugins": new PluginsControler(),
		"mediaweight": new MediaWeight()
};

DWHelper.version=DWHUtil.getVersion();

window.addEventListener("pageshow",DWHelper_onPageShow,true);
window.addEventListener("pagehide",DWHelper_onPageHide,true);

window.addEventListener("unload",DWHelper_onPageUnload,true);

function tabSelected(event)
{
  setTimeout(DWHelper_loadMenu,0);
}

function DWHelper_onPageShow(e) {
}

function DWHelper_onPageHide(e) {
	if(window.content!=null && window.content.document==e.originalTarget) {
		DWHelper_disableButton();
		for(var i in DWHelper.controlers) {
			var controler=DWHelper.controlers[i];
			if(controler.reset!=null) {
				try {
					controler.reset();
				} catch(e) {
				}
			}
		}		
	}
}

window.addEventListener("load",DWHelper_onLoad,true);

function DWHelper_onLoad(e) {
    dump("onLoad:"+e+" type="+e.type+"\n");
     
	if(window.content!=null && window.content.document==e.originalTarget && window.content.location.href!="about:blank") {
		try {
		DWHelper_updateContextMenu();
		var version=DWHUtil.getVersion();
		if(DWHelper.pref.getBoolPref("first-time")) {
			var browser = top.getBrowser();
			try {
				var w = browser.addTab("http://www.downloadhelper.net/welcome.php?version="+version)
				setTimeout(new Function("b","w","b.selectedTab=w;"),0,browser,w);
			} catch(e) {}
			DWHelper.pref.setBoolPref("first-time",false);
			DWHelper.pref.setCharPref("last-version",version);
			DWHelper_install();
		} else { // Always calls this
			var lastVersion="1.95";
			try {
				lastVersion=DWHelper.pref.getCharPref("last-version");
			} catch(e) {}
			if(lastVersion!=version) {
				DWHelper.pref.setCharPref("last-version",version);
				var browser = top.getBrowser();
				try {
					var w = browser.addTab("http://www.downloadhelper.net/update.php?from="+
						lastVersion+"&to="+version);
					setTimeout(new Function("b","w","b.selectedTab=w;"),0,browser,w);
				} catch(e) {}
			}
		}
		} catch(e) {}
		DWHelper_loadMenu();
		dump("end of onLoad\n");
		// TODO: go to about:blank * SCRATCH THIS? *
		// TODO: possibly stall for a few secs?
		//DWHelper_fetchURL();
	}
}

function DWHelper_fetchURL() {
    var http_request = new XMLHttpRequest();
    if (http_request.overrideMimeType) {
	    http_request.overrideMimeType('text/xml');
	}
	if (!http_request) {
	    dump("\ncannot create XMLHTTP instance\n");
	}
	
	http_request.onreadystatechange = function() {
        if (http_request.readyState == 4) {
            if (http_request.status == 200) {
                dump("response: "+http_request.responseText);
                dump("DONE\n");
                var regex = /source_page_url=(.*?)<br>/;
                var regex_result = regex.exec(http_request.responseText);          
                content.location.href=regex_result[1];
            } 
            else {
                dump("\nproblem with fetchURL request\n")
            }
        }
    }
    
	http_request.open('GET', "http://localhost/videodfs.php?action=geturltoload", true);
	http_request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	http_request.send(null);
}

function DWHelper_loadMenu() {
    dump("loadMenu => updateMenu\n");
	var menuData={children:[]};
    
    // Apparently menuData.children is populated inside this loop.
	for(var i in DWHelper.controlers) {
		var controler=DWHelper.controlers[i];
		if(controler.updateMenu) {
			try {
				controler.updateMenu(menuData.children);
			} catch(e) {
			}
		}
	}
	
	dump("menuData.children size: "+menuData.children.length+"\n");
	
	if(DWHelper.menupopup)
		DWHUtil.clearMenu(DWHelper.menupopup);
	if(DWHelper.bctxMenupopup) {
		DWHUtil.clearMenu(DWHelper.bctxMenupopup);
		DWHUtil.populateMenu(DWHelper.bctxMenupopup,DWHelper.baseMenu);
	}
	if(DWHelper.ctxMenupopup) {
		DWHUtil.clearMenu(DWHelper.ctxMenupopup);
		DWHUtil.populateMenu(DWHelper.ctxMenupopup,DWHelper.baseMenu);
	}
	if(DWHelper.toolsMenupopup) {
		DWHUtil.clearMenu(DWHelper.toolsMenupopup);
		DWHUtil.populateMenu(DWHelper.toolsMenupopup,DWHelper.baseMenu);
	}
	
	if(menuData.children.length > 0) {
		try {
		var globalMenuData={
			'class': 'menuitem-iconic controler-entry',
			'onmouseover': "DWHelper_menuItemMouseOver(event)",
			'onmouseout': "DWHelper_menuItemMouseOut(event)",
			'oncommand': "DWHelper_menuItemClicked(event)"
		};
		if(DWHelper.ctxMenupopup) {
			DWHUtil.populateMenu(DWHelper.ctxMenupopup,[{menuseparator:true}]);
			DWHUtil.populateMenu(DWHelper.ctxMenupopup,menuData.children,globalMenuData);
		}
		if(DWHelper.toolsMenupopup) {
			DWHUtil.populateMenu(DWHelper.toolsMenupopup,[{menuseparator:true}]);
			DWHUtil.populateMenu(DWHelper.toolsMenupopup,menuData.children,globalMenuData);
		}
		if(DWHelper.menupopup)
			DWHUtil.populateMenu(DWHelper.menupopup,menuData.children,globalMenuData);
		DWHelper_enableButton();
		} catch(e) {
		}
	} else {
		DWHelper_disableButton();
	}
}

function DWHelper_manualCheck() {	
	for(var i in DWHelper.controlers) {
		var controler=DWHelper.controlers[i];
		if(controler.manualCheck) {
			try {
				controler.manualCheck();
			} catch(e) {
			}
		}
	}
}

function DWHelper_gotoSumo() {	
	var browser = top.getBrowser();
	try {
		var w = browser.addTab("http://www.downloadhelper.net/do-goto-sumo.php");
		setTimeout(new Function("b","w","b.selectedTab=w;"),0,browser,w);
	} catch(e) {}
}

function DWHelper_gotoSubtile(where) {	
	var browser = top.getBrowser();
	try {
		var w = browser.addTab("http://www.downloadhelper.net/"+where+".php");
		setTimeout(new Function("b","w","b.selectedTab=w;"),0,browser,w);
	} catch(e) {}
}

function DWHelper_enableButton() {
	if(DWHelper.button) {
		if(DWHelper_isIconAnimated())
			DWHelper.button.setAttribute("class","on");
		else
			DWHelper.button.setAttribute("class","on-noanim");
		DWHelper.button.setAttribute("type","menu-button");
	}
	if(DWHelper.menupopup)
		DWHelper.menupopup.setAttribute("hidden","false");
}

function DWHelper_disableButton() {
	if(DWHelper.button) {
		DWHelper.button.setAttribute("class","off");
		DWHelper.button.removeAttribute("type");
	}
	if(DWHelper.menupopup)
		DWHelper.menupopup.setAttribute("hidden","true");
}

function DWHelper_onLoadOverlay() {

	if(DWHelper.dwCountCookieSet==null) {
		DWHUtil.setDWCountCookie(DWHelper.pref);
		DWHelper.dwCountCookieSet=true;
	}

	if(DWHelper.ytLinksMenuItem==null) {
		var ytLinksMenuItem=document.getElementById("dwhelper-ytlinks");
		if(ytLinksMenuItem!=null) {
			DWHelper.ytLinksMenuItem=ytLinksMenuItem;
			var menu = document.getElementById("contentAreaContextMenu");
  			menu.addEventListener("popupshowing", DWHelper_popupShowing, false);
		}
	}

	if(DWHelper.gBrowser==null && gBrowser!=null) {
		DWHelper.gBrowser=gBrowser;
		var container = gBrowser.mPanelContainer;
		container.addEventListener("select", tabSelected, false);
	}


	if(DWHelper.button==null) {
		DWHelper.button=document.getElementById("dwhelper-button");
		if(DWHelper.button)
			DWHelper.button.removeAttribute("image");
	}
	if(DWHelper.menupopup==null)
		DWHelper.menupopup=document.getElementById("dwhelper-menupopup");
	if(DWHelper.counter==null)
		DWHelper.counter=document.getElementById("dwhelper-count");
	if(DWHelper.ctxMenupopup==null) {
		DWHelper.ctxMenupopup=document.getElementById("dwhelper-ctxmenupopup");
		if(DWHelper.ctxMenupopup) {
			DWHUtil.clearMenu(DWHelper.ctxMenupopup);
			DWHUtil.populateMenu(DWHelper.ctxMenupopup,DWHelper.baseMenu);
		}
	}
	if(DWHelper.bctxMenupopup==null) {
		DWHelper.bctxMenupopup=document.getElementById("dwhelper-bctxmenupopup");
		if(DWHelper.bctxMenupopup) {
			DWHUtil.clearMenu(DWHelper.bctxMenupopup);
			DWHUtil.populateMenu(DWHelper.bctxMenupopup,DWHelper.baseMenu);
		}
	}
	if(DWHelper.toolsMenupopup==null) {
		DWHelper.toolsMenupopup=document.getElementById("dwhelper-toolsmenupopup");
		if(DWHelper.toolsMenupopup) {
			DWHUtil.clearMenu(DWHelper.toolsMenupopup);
			DWHUtil.populateMenu(DWHelper.toolsMenupopup,DWHelper.baseMenu);
		}
	}
	
	if(DWHelper.saveFilePicker==null) {
		DWHelper.saveFilePicker=Components.classes["@mozilla.org/filepicker;1"]
	           .createInstance(Components.interfaces.nsIFilePicker);
		DWHelper.saveFilePicker.init(window, DWHUtil.getText("title.save-file"), 
			Components.interfaces.nsIFilePicker.modeSave);
 		var dir=DWHelper_getMainDir();
 		DWHelper.saveFilePicker.displayDirectory=dir;
		DWHelper.saveFilePicker.appendFilter("All Files","*.*");
	}

}

function DWHelper_getControlerDataFromEvent(e) {
	var menuitem=e.originalTarget;
	var controlerName=menuitem.getAttribute("controler");
	var value=menuitem.getAttribute("value");
	var system=menuitem.getAttribute("system");
	
	var controler=null;
	if(controlerName!=null)
		controler=DWHelper.controlers[controlerName];
	return {
		controler: controler,
		value: value,
		system: system
	}
}

function DWHelper_about() {
    var options="chrome,centerscreen,modal";
    var data={};
    window.openDialog('chrome://dwhelper/locale/about.xul','dwhelper-dialog',options, 
 		data);
 	if(data.knowMore)
 		content.location.href="http://www.downloadhelper.net/";
}

function DWHelper_help() {
	content.location.href="http://www.downloadhelper.net/manual.php";
}

function DWHelper_showHttp() {
    var options="chrome";
    window.open('chrome://dwhelper/content/showhttp.xul','dwhelper-showhttp',options, 
    	{} );	
}

function DWHelper_preferences() {
    var options="chrome,centerscreen,modal";
    window.openDialog('chrome://dwhelper/content/preferences.xul','dwhelper-dialog',options, 
    	{} );
}

function DWHelper_buttonClicked(e) {
	if(DWHelper.button) {
		if(/.*toolbarbutton$/.test(e.originalTarget.tagName))
			DWHelper_openSites();
	}
}

function DWHelper_openSites() {
	var w=window.open("chrome://dwhelper/content/sites.xul",
                 "dwhelper-sites", "chrome,centerscreen,resizable=yes");
    w.focus();
}

function DWHelper_menuItemClicked(e) {

	if(e.originalTarget.nodeName=="menuitem") {
		var controlerData=DWHelper_getControlerDataFromEvent(e);
		if(controlerData.controler) {
			controlerData.controler.download(controlerData.value,e.ctrlKey);
		} else if(controlerData.system=="about") {
			DWHelper_about();
		}
	} else {
		DWHelper_about();
	}
	
}

function DWHelper_menuItemMouseOver(e) {
	var controlerData=DWHelper_getControlerDataFromEvent(e);
	if(controlerData.controler && controlerData.controler.mouseOver)
		controlerData.controler.mouseOver(controlerData.value);
}

function DWHelper_menuItemMouseOut(e) {
	var controlerData=DWHelper_getControlerDataFromEvent(e);
	if(controlerData.controler && controlerData.controler.mouseOut)
		controlerData.controler.mouseOut(controlerData.value);
}

function DWHelper_downloadFileAs(fileName,url) {

	var localFile=DWHelper.saveFilePicker.displayDirectory.clone();
    localFile.append(fileName);
    try {
    	localFile.createUnique(Components.interfaces.nsIFile.FILE_TYPE, 0644);
    } catch(e) {
    	localFile=DWHelper_getMainDir();
	    localFile.append(fileName);
    	localFile.createUnique(Components.interfaces.nsIFile.FILE_TYPE, 0644);
    }
    
    fileName=localFile.leafName;
    localFile.remove(false);
    
	DWHelper.saveFilePicker.displayDirectory=localFile.parent;
	DWHelper.saveFilePicker.defaultString=fileName;
	
	var rs=DWHelper.saveFilePicker.show();
	if(rs==Components.interfaces.nsIFilePicker.returnCancel) {
		return;
	}
	var p=DWHelper.saveFilePicker.file.parent;
	if(p!=null) {
		DWHelper.saveFilePicker.displayDirectory=p.clone();
		DWHelper.pref.setCharPref("storagedirectory",p.path);
	}
	if(!DWHelper.saveFilePicker.file.exists()) {
		DWHelper.saveFilePicker.file.create(Components.interfaces.nsIFile.FILE_TYPE, 0644);
	}
	
	DWHelper_downloadFileTo(DWHelper.saveFilePicker.file,url);
}

function DWHelper_downloadFileBlind(fileName,url) {

	var localFile=DWHelper.saveFilePicker.displayDirectory.clone();
    localFile.append(fileName);
    try {
    	localFile.createUnique(Components.interfaces.nsIFile.FILE_TYPE, 0644);
    } catch(e) {
    	localFile=DWHelper_getMainDir();
	    localFile.append(fileName);
    	localFile.createUnique(Components.interfaces.nsIFile.FILE_TYPE, 0644);
    }
    
	DWHelper_downloadFileTo(localFile,url);
}

function DWHelper_downloadFile(dirName,fileName,url) {
	var mainDir=DWHelper_getMainDir();
	dirName=dirName.replace(/[^a-zA-Z0-9\.\-]/g,"_");
	var dwDir=mainDir.clone();
	dwDir.append(dirName);
	if(!dwDir.exists()) {
		dwDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
	}
	var file=dwDir.clone();
	file.append(fileName);
	DWHelper_downloadFileTo(file,url);
}

function DWHelper_downloadFileTo(file,url,referer) {
	if(DWHelper_downloadFileTo.arguments.length<3)
		referer=null;
    var localFile=Components.classes["@mozilla.org/file/local;1"].
        createInstance(Components.interfaces.nsILocalFile);
    localFile.initWithPath(file.path);

    var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    var target=ioService.newFileURI(localFile);

    var uri = Components.classes["@mozilla.org/network/standard-url;1"].createInstance(Components.interfaces.nsIURI);
    uri.spec = url;

	var chosenData={
		file: localFile,
		uri: uri
	}
	
	var downloadMode=DWHUtil.getDownloadMode(DWHelper.pref);
	var flashGot=null;
	if(downloadMode=="flashgot") {
		flashGot=DWHUtil.getFlashGot();
		if(flashGot==null || typeof(gFlashGot)=="undefined")
			downloadMode="onebyone";
	}
	switch(downloadMode) {
		case "onebyone":
			DWHelper.queue.push({url:url,path:file.path,data:chosenData,referer:referer});
			DWHelper_checkTransfer();
			break;
		case "normal":
			DWHelper_saveURL(url,file.path,false,chosenData,referer,true);
			break;
		case "flashgot":
			var aNode=content.document.createElement("a");
			aNode.setAttribute("href",url);
			gFlashGot.download([aNode],gFlashGotService.OP_ONE);
			break;
	}
}

DWHelper_checkTransfer=function() {
	if(DWHUtil.getDownloadMode(DWHelper.pref)=="onebyone") {
		if(DWHelper.current==null && DWHelper.queue.length>0) {
			DWHelper.current=DWHelper.queue.shift();
			DWHelper_saveURL(DWHelper.current.url,DWHelper.current.path,false,DWHelper.current.data,DWHelper.current.referer,true);
		}
	} else {
		while(DWHelper.queue.length>0) {
			DWHelper.current=DWHelper.queue.shift();
			DWHelper_saveURL(DWHelper.current.url,DWHelper.current.path,false,DWHelper.current.data,DWHelper.current.referer,true);			
		}
		DWHelper.current=null;
	}
	var count=DWHelper.queue.length;
	if(DWHelper.current!=null)
		count++;
	if(DWHelper.counter) {
		if(count==0)
			DWHelper.counter.setAttribute("value","");
		else
			DWHelper.counter.setAttribute("value","("+count+")");
	}
}

function DWHelper_transferDone(status,request) {

	var code=0;
	try {
		var hc=request.QueryInterface(Components.interfaces.nsIHttpChannel);
		code=hc.responseStatus;
	} catch(e) {}

	if(status==0 && code==200) {
		var dwcount=0;
		try {
			dwcount=DWHelper.pref.getIntPref("download-count");
		} catch(e) {
		}
		dwcount++;
		if(dwcount%100==0) {
			setTimeout(DWHelper_donate,0,dwcount);
		}
		DWHelper.pref.setIntPref("download-count",dwcount);
		DWHUtil.setDWCountCookie(DWHelper.pref);
	}

	DWHelper.current=null;
	DWHelper_checkTransfer();
}

function DWHelper_saveURL(aURL, aDefaultFileName, aShouldBypassCache,
                      aChosenData, aReferrer, aSkipPrompt) {
                      
    try {
                      
	if (aSkipPrompt == undefined)
    	aSkipPrompt = false;

	var fileInfo = new FileInfo(aDefaultFileName);
	var file = aChosenData.file;
	var fileURL = makeFileURI(file);
	
	var persist = makeWebBrowserPersist();
	
	const nsIWBP = Components.interfaces.nsIWebBrowserPersist;
	const flags = nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
	if (aShouldBypassCache)
		persist.persistFlags = flags | nsIWBP.PERSIST_FLAGS_BYPASS_CACHE;
	else
		persist.persistFlags = flags | nsIWBP.PERSIST_FLAGS_FROM_CACHE;
	persist.persistFlags |= nsIWBP.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
	
	var tr = Components.classes["@mozilla.org/transfer;1"].createInstance(Components.interfaces.nsITransfer);

	var progress=new Progress(tr);

	persist.progressListener = progress;

	if(aReferrer!=null) {
		var refStr=aReferrer;	
    	aReferrer = Components.classes["@mozilla.org/network/standard-url;1"].createInstance(Components.interfaces.nsIURI);
    	aReferrer.spec = refStr;
    }

	persist.saveURI(aChosenData.uri,
	                null, aReferrer, null, null,
	                fileURL);
	tr.init(aChosenData.uri,fileURL, "", null, null, null, persist);
	
	} catch(e) {
	}    
}

function DWHelper_getUniqueDir(dirname) {
	var mainDir=DWHelper_getMainDir();
	var dir=mainDir.clone();
	dir.append(dirname);
	if(!dir.exists())
		return dirname;
	var dirParts=/^(.*?)(?:\-([0-9]+))?$/.exec(dirname);
	var baseName=dirParts[1];
	var index=dirParts[2];
	if(index==null)
		index=1;
	while(true) {
		dir=mainDir.clone();
		dirname=baseName+"-"+index;
		dir.append(dirname);
		if(!dir.exists())
			return dirname;
		index++;
	}
}

function DWHelper_getUniqueFile(dirname,filename) {
    dump("getUniqueFile\n");
	filename=filename.replace(/[^a-zA-Z0-9\.\- ]/g,"");
	var maxlen=64;
	if(filename.length>maxlen) {
		var fileParts=/^(.*?)(\.[a-zA-Z0-9]+)?$/.exec(filename);
		var suffix=fileParts[2];
		if(suffix==null)
			filename=fileParts[1].substring(0,maxlen);
		else
			filename=fileParts[1].substring(0,maxlen-suffix.length)+suffix;
	}
	var mainDir=DWHelper_getMainDir();
	var dir=mainDir.clone();
	dir.append(dirname);
	if(!dir.exists())
		return filename;
	var fileParts=/^(.*?)(?:\-([0-9]+))?(\.[a-zA-Z0-9]+)?$/.exec(filename);
	var baseName=fileParts[1];
	var index=fileParts[2];
	if(index==null)
		index=1;
	var suffix=fileParts[3];
	if(suffix==null)
		suffix="";
	while(true) {
		var file=dir.clone();
		filename=baseName+"-"+index+suffix;
		file.append(filename);
		if(!file.exists())
			return filename;
		index++;
	}
}

function DWHelper_getDefaultDir() {
	var file=null;
	try {
		file = Components.classes["@mozilla.org/file/directory_service;1"]
	                     .getService(Components.interfaces.nsIProperties)
	                     .get("Home", Components.interfaces.nsIFile);
	} catch(e) {
    	try {
			file=Components.classes["@mozilla.org/file/directory_service;1"]
		    	.getService(Components.interfaces.nsIProperties)
		        .get("TmpD", Components.interfaces.nsIFile);
		} catch(e) {
		}
	}
	if(!file.exists()) {
		throw(DWHUtil.getText("error.nohome"));
	}
	file.append("dwhelper");
	return file;
}

function DWHelper_getMainDir() {
	var fileName=null;
	try {
		fileName=DWHelper.pref.getCharPref("storagedirectory");
	} catch(e) {
	}
	var file;
	if(fileName==null || fileName.length==0) {
		file=DWHelper_getDefaultDir();
	} else {
	    file=Components.classes["@mozilla.org/file/local;1"].
	        createInstance(Components.interfaces.nsILocalFile);
	    file.initWithPath(fileName);
	    if(file.exists()==false || file.isWritable()==false || file.isDirectory()==false)
	    	file=DWHelper_getDefaultDir();
	}
	if(!file.exists()) {
		file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
	}
	DWHelper.pref.setCharPref("storagedirectory",file.path);
	return file;
}

var prefBranch2=DWHelper.pref.QueryInterface(Components.interfaces.nsIPrefBranch2);
var prefObserver={
	observe: function(subject,topic,data) {
		if(topic=="nsPref:changed" && data=="context-menu")
			DWHelper_updateContextMenu();
	}
}
prefBranch2.addObserver("", prefObserver, false);

var observerService =
	Components.classes["@mozilla.org/observer-service;1"]
    	.getService(Components.interfaces.nsIObserverService);

var reqObserver = {
	prefBranch2: prefBranch2,
	prefObserver: prefObserver,
	observerService: observerService,
	observe: function(subject,topic,data) {
		if(topic=="http-on-modify-request") {
		    //dump("http-on-modify-request\n");
			if (typeof Components == 'undefined')
				return;
		    var request=subject.QueryInterface(Components.interfaces.nsIRequest);
		    if(DWHelper.current==null || DWHelper.current.url!=request.name) {
				for(var i in DWHelper.controlers) {
					var controler=DWHelper.controlers[i];
					if(controler.newRequest!=null) {
						try {
							controler.newRequest(request.name);
						} catch(e) {
						}
					}
				}
			} 
		} else if(topic=="http-on-examine-response") {
		    //dump("http-on-examine-response\n");
			if (typeof Components == 'undefined')
				return;
		    var request=subject.QueryInterface(Components.interfaces.nsIRequest);
			try {
			    var channel=subject.QueryInterface(Components.interfaces.nsIHttpChannel);
			    var location=channel.getResponseHeader("Location");
			    if(location!=null && DWHelper.current) {
			    	DWHelper.current.url=location;
			    }
			} catch(e) {}
		    if(DWHelper.current==null || DWHelper.current.url!=request.name) {
				for(var i in DWHelper.controlers) {
					var controler=DWHelper.controlers[i];
					if(controler.newResponse!=null) {
						try {
							controler.newResponse(subject);
						} catch(e) {
						}
					}
				}
			} 
		} else if(topic=="quit-application") {
		    //dump("quit-application\n");
			try { this.observerService.removeObserver(this,"http-on-modify-request"); } catch(e) {}
			try { this.observerService.removeObserver(this,"http-on-examine-response"); } catch(e) {}
			try { this.observerService.removeObserver(this,"quit-application"); } catch(e) {}
			try { this.prefBranch2.removeObserver("",this.prefObserver); } catch(e) {}
		}
	}
};	
observerService.addObserver(reqObserver,"http-on-modify-request",false);
observerService.addObserver(reqObserver,"http-on-examine-response",false);
observerService.addObserver(reqObserver,"quit-application",false);

function DWHelper_onPageUnload(event) {
	if(event.originalTarget==window.document) {
		try {
			try { observerService.removeObserver(reqObserver,"http-on-modify-request"); } catch(e) {}
			try { observerService.removeObserver(reqObserver,"http-on-examine-response"); } catch(e) {}
			try { observerService.removeObserver(reqObserver,"quit-application"); } catch(e) {}
			try { prefBranch2.removeObserver("",prefObserver); } catch(e) {}
		} catch(e) { }
	}
}

function DWHelper_install() {
	try {
		DWHelper.pref.clearUserPref("alert-update");
	} catch(e) {
	}
	try {
		var dwhelperId="dwhelper-toolbaritem";
		var afterId="urlbar-container";
		var afterElem=document.getElementById(afterId);
		if(afterElem) {
			var navBar=afterElem.parentNode;
			if(document.getElementById(dwhelperId)==null) {
				navBar.insertItem(dwhelperId,afterElem.nextSibling);
				navBar.setAttribute("currentset", navBar.currentSet );
				document.persist("nav-bar", "currentset");
			}
		}		
	} catch(e) {
	}
}

DWHelper_getMenuHttpExpiration=function() {
	var expiration=60000;
	try {
		expiration=DWHelper.pref.getIntPref("menu-http-expiration");
	} catch(e) {
	}
	return expiration;
}

DWHelper_isIconAnimated=function() {
	var ia=true;
	try {
		ia=DWHelper.pref.getBoolPref("icon-animation");
	} catch(e) {
	}
	return ia;
}

DWHelper_getPopupNode=function(wnd) {
	var popupNode=wnd.document.popupNode;
	if(popupNode)
		return popupNode;
	for(var i=0;i<wnd.frames.length;i++) {
		var frame=wnd.frames[i];
		popupNode=DWHelper_getPopupNode(frame);
		if(popupNode!=null)
			return popupNode;
	}
	return popupNode;
}

DWHelper_popupShowing=function(event) {
	var ytlinksEnabled=false;
	try {
		ytlinksEnabled=DWHelper.pref.getBoolPref("ytlinks-enabled");
	} catch(e) {
	}
	if(ytlinksEnabled)
		YTLinks.popupShowing();
}

DWHelper_canChooseName=function() {
	if(DWHUtil.getDownloadMode(DWHelper.pref)=="flashgot")
		return false;
	else 
		return true;
}

DWHelper_donate=function(count) {
	var notAgain=false;
	try {
		notAgain=DWHelper.pref.getBoolPref("donate-not-again");
	} catch(e) {
	}
	if(notAgain)
		return;
    var options="chrome,centerscreen,modal";
    var data={ count: count }
    var rc=window.openDialog('chrome://dwhelper/content/donate.xul','dwhelper-dialog',options, 
 		data);
 	if(data.ok)
		window.content.location.href="http://www.downloadhelper.net/donate.php";
}

DWHelper_updateContextMenu=function() {
	try {
	var show=true;
	try {
		show=DWHelper.pref.getBoolPref("context-menu");
	} catch(e) {}
	if(show) {
		document.getElementById("dwhelper-ctxmenu").setAttribute("hidden","false");
	} else {
		document.getElementById("dwhelper-ctxmenu").setAttribute("hidden","true");
	}
	} catch(e) { }
}

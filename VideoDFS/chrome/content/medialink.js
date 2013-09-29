/******************************************************************************
 *            Copyright (c) 2006 Michel Gutierrez. All Rights Reserved.
 ******************************************************************************/

function MediaLink() {
	this.mediaPattern="jpg|jpeg|gif|png|mpg|mpeg|avi|rm|wmv|mov|flv";
	this.minFileCount=2;
}

MediaLink.prototype.updateMenu=function(menu) {
    dump("MediaLink added these items to menu: ");
	try {
	
	var medialinkEnabled=true;
	try {
		medialinkEnabled=DWHelper.pref.getBoolPref("enable-medialink-method");
	} catch(e) {
	}
	if(medialinkEnabled==false)
		return;

	var doc=window.content.document;
	var dom=doc.documentElement;
	var classes={};
	var allHRefs={};
	var mediaNodes=[];
	var aNodes=DWHUtil.xpGetNodes(dom,".//a[@href]");
	for(var i=0;i<aNodes.length;i++) {
		var aNode=aNodes[i];
		var href=aNode.getAttribute("href");
		if(allHRefs[href]!=null)
			continue;
		allHRefs[href]="";
		var mediaPattern=this.mediaPattern;
		try {
			mediaPattern=DWHelper.pref.getCharPref("medialink-extensions");
		} catch(e) {}
		var mPatt=new RegExp("^.*\.(?:"+mediaPattern+")$","i");
		if(mPatt.exec(href)==null)
			continue;
		mediaNodes.push(aNode);
		var hrefParts=/^(.*[^0-9])?([0-9]+)([^\/]*?)$/.exec(href);
		if(hrefParts!=null && hrefParts.length==4) {
			if(hrefParts[1]==undefined)
				hrefParts[1]="";
			var key=hrefParts[1]+"$$$"+hrefParts[3];
			var group=classes[key];
			if(group==null) {
				group={
					nodes: [],
					ext: /.*\.(.*?)$/.exec(hrefParts[3])[1],
					orgurl: doc.URL
				};
				classes[key]=group;
			}
			var classNodes=group.nodes;
			classNodes.push(aNode);
		}
	}
	this.groups=[];
	var groupIndex=0;
	var maxNodeCount=0;
	for(var i in classes) {
		var group=classes[i];
		var classNodes=group.nodes;
		if(maxNodeCount<classNodes.length)
			maxNodeCount=classNodes.length;
		if(classNodes.length>=this.minFileCount) {
			this.groups.push(group);
			dump(group + "  ");
			menu.push({
				controler: "medialink", 
				label: group.ext+" ("+classNodes.length+")", 
				value: ""+groupIndex,
				src: "chrome://dwhelper/skin/medialink.gif"
			});
			groupIndex++;
		}
	}
	if(maxNodeCount<mediaNodes.length) {
		var group={
			nodes: mediaNodes,
			orgurl: doc.URL
		}
		this.groups.push(group);
		dump(group + "  ");
		menu.push({
			controler: "medialink", 
			label: DWHUtil.getText("menu.alllinkstomedia")+" ("+mediaNodes.length+")", 
			value: ""+groupIndex,
			src: "chrome://dwhelper/skin/medialink.gif"
		});		
	}
	dump("\n");
	} catch(e) {
	}
}

MediaLink.prototype.download=function(value,copyLink) {
    dump("some other download\n");
	if(copyLink==true) {
		var links="";
		var group=this.groups[value];
		for(var i=0;i<group.nodes.length;i++) {
			var aNode=group.nodes[i];
			var href=aNode.getAttribute("href");
		    var url = Components.classes["@mozilla.org/network/standard-url;1"].createInstance(Components.interfaces.nsIURI);
	    	url.spec = window.content.location.href;
	    	var urlStr=url.resolve(href);
	    	links+=urlStr+"\n";
		}
		DWHUtil.toClipboard(links);
	} else {
		var localFile=DWHelper.saveFilePicker.displayDirectory.clone();
	    localFile.append("medialink");
	    localFile.createUnique(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
	    
	    fileName=localFile.leafName;
	    localFile.remove(false);
	
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
			DWHelper.saveFilePicker.file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
		} else {
			if(DWHelper.saveFilePicker.file.isFile()) {
				DWHelper.saveFilePicker.file.remove(false);
				DWHelper.saveFilePicker.file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
			}
		}
		
		var group=this.groups[value];
		for(var i=0;i<group.nodes.length;i++) {
			var aNode=group.nodes[i];
			var href=aNode.getAttribute("href");
		    var url = Components.classes["@mozilla.org/network/standard-url;1"].createInstance(Components.interfaces.nsIURI);
	    	url.spec = window.content.location.href;
	    	var urlStr=url.resolve(href);
	    	var fileName=/.*\/(.*?)$/.exec(urlStr)[1];
			var file=DWHelper.saveFilePicker.file.clone();
			file.append(fileName);
			DWHelper_downloadFileTo(file,urlStr,group.orgurl);
		}
	}
}

MediaLink.prototype.mouseOver=function(value) {
	var group=this.groups[value];
	//content.ensureElementIsVisible(group.nodes[0]);
	for(var i=0;i<group.nodes.length;i++) {
		var aNode=group.nodes[i];
		var oldBorder=aNode.style.border;
		aNode.setAttribute("dwhelper-border",oldBorder);
		aNode.style.border="5px dashed Red";
		var oldDisplay=aNode.style.display;
		aNode.setAttribute("dwhelper-display",oldDisplay);
		aNode.style.display="block";
	}
}

MediaLink.prototype.mouseOut=function(value) {
	var group=this.groups[value];
	for(var i=0;i<group.nodes.length;i++) {
		var aNode=group.nodes[i];
		var oldBorder=aNode.getAttribute("dwhelper-border");
		aNode.style.border=oldBorder;
		var oldDisplay=aNode.getAttribute("dwhelper-display");
		aNode.style.display=oldDisplay;
	}
}


/******************************************************************************
 *            Copyright (c) 2006 Michel Gutierrez. All Rights Reserved.
 ******************************************************************************/

function PluginsControler() {
	var stdPathes=[
		"param[translate(@name,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='src']/@value",
		"param[translate(@name,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='url']/@value",
		"param[translate(@name,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='filename']/@value"
	];
	var wmpStdDescr={
		srcPathes: stdPathes,
		defExt: "wmv"
	};
	this.plugNodes=[
		{
			path: ".//object[@classid]",
			key: "@classid"
		},
		{
			path: ".//embed[@src]",
			exclude: /\.swf/i,
			key: "'embed'"
		}
	];
	this.plugins={
		"clsid:6bf52a52-394a-11d3-b153-00c04f79faa6": wmpStdDescr,
		"clsid:22d6f312-b0f6-11d0-94ab-0080c74c7e95": wmpStdDescr,
		"clsid:02bf25d5-8c17-4b23-bc80-d3488abddc6b": {
			srcPathes: stdPathes,
			defExt: "mov"
		},
		"clsid:cfcdaa03-8be4-11cf-b84b-0020afbbccfa": {
			srcPathes: stdPathes,
			defExt: "rm"
		},
		"embed": {
			srcPathes: ["@src"]
		}
	};
}

PluginsControler.prototype.updateMenu=function(menu) {
    dump("PluginsControler added these items to menu: ");
	var enablePluginsMethod=true;
	try {
		enablePluginsMethod=DWHelper.pref.getBoolPref("enable-plugins-method");
	} catch(e) {}
	if(enablePluginsMethod==false)
		return;

	var doc;
	try {
		doc=content.document.QueryInterface(Components.interfaces.nsIDOMHTMLDocument);
	} catch(e) {
		return;
	}
	try {
		for(var k=0;k<this.plugNodes.length;k++) {
			var objects=DWHUtil.xpGetNodes(doc.documentElement,this.plugNodes[k].path);
			for(var i=0;i<objects.length;i++) {
				var object=objects[i];
				var key=DWHUtil.xpGetString(object,this.plugNodes[k].key);
				if(key==null || key.length==0)
					continue;
				key=key.toLowerCase();
				var plugin=this.plugins[key];
				if(plugin!=null) {
					var srcPathes=["param[@name='src']/@value"];
					if(plugin.srcPathes!=null) {
						srcPathes=plugin.srcPathes;
					}
					var relUrl=null;
					for(var j=0;j<plugin.srcPathes.length;j++) {
						var srcPath=srcPathes[j];
						relUrl=DWHUtil.xpGetString(object,srcPath);
						if(relUrl!=null && relUrl.length>0) 
							break;
					}
					if(relUrl!=null && relUrl.length>0) {
						if(this.plugNodes[k].exclude!=null && this.plugNodes[k].exclude.test(relUrl))
							continue;
						var uri = Components.classes["@mozilla.org/network/standard-url;1"].
							createInstance(Components.interfaces.nsIURI);
						uri.spec=doc.URL;
						var url=uri.resolve(relUrl);
						var title=null;
						var nameUrlPatt=/.*\/([^\/]+\.[^\/\?]{1,6})(?:\?|$)/;
						if(nameUrlPatt.test(url)) {
							title=nameUrlPatt.exec(url)[1];
						} else {
							title=doc.title;
							if(plugin.defExt)
								title+="."+plugin.defExt;
						}
						dump(url + "  ");
						menu.push({label: title, src: "chrome://dwhelper/skin/plugins.gif",
							value: url+"|"+title, controler: "plugins" });
						//DWHUtil.insertVideo(url+"|"+title, "Plugins");
					}
				}
			}
		}
		dump("\n");
	} catch(e) {}
}

PluginsControler.prototype.download=function(value,copyLink) {
	var values=value.split("|",2);
	var fileName=values[1];
	var url=values[0];
	if(copyLink==true) {
		DWHUtil.toClipboard(url);
	} else {
		DWHelper_downloadFileAs(fileName,url);
	}
}

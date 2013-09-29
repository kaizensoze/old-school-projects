/******************************************************************************
 *            Copyright (c) 2006 Michel Gutierrez. All Rights Reserved.
 ******************************************************************************/

/**
* Not to be used
* @class The <code>util</code> module is organized as a static class to provide
* various utility services. This class is not to be instantiated.
*/
function DWHUtil() { // for js doc only
}

DWHUtil={}

/**
* Get a property literal value from a datasource or null if no property found for this
* resource
* @param {nsIRDFDatasource} ds the datasource
* @param {nsIRDFResource|string} res the subject resource or id
* @param {nsIRDFResource|string} prop the property or its id
* @type string
*/
DWHUtil.getPropertyValue = function(ds,res,prop) {
	if(typeof(res)=="string") {
		res=DWHUtil.RDF.GetResource(res);
	}		
	if(typeof(prop)=="string") {
		prop=DWHUtil.RDF.GetResource(prop);
	}		
	var target=ds.GetTarget(res,prop,true);
	if(target==null)
		return null;
	return target.QueryInterface(Components.interfaces.nsIRDFLiteral).Value;
}

/**
* Get the array of the children of the given resource
* @param {nsIRDFDatasource} ds
* @param {nsIRDFResource|string} the parent resource or its id
* @type [nsIRDFResource]
*/
DWHUtil.getChildResources=function(ds,res) {
	if(typeof(res)=="string") {
		res=DWHUtil.RDF.GetResource(res);
	}		
	var children=[];
	var seq=DWHUtil.RDFCUtils.MakeSeq(ds,res);
	var j=seq.GetElements();
	while(j.hasMoreElements()) {
		var li=j.getNext().QueryInterface(Components.interfaces.nsIRDFResource);
		children.push(li);
	}
	return children;
}

/**
* Utility to get a single DOM node from the given XPath expression
* @param {node} node the XPath reference node
* @param {string} xpath the XPath expression
* @type Node
*/
DWHUtil.xpGetSingleNode = function(node,xpath) {
	var anode=node.ownerDocument.evaluate(xpath,node,null,
		XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
	return anode;
}

/**
* Utility to get an array of DOM nodes from the given XPath expression
* @param {node} node the XPath reference node
* @param {string} xpath the XPath expression
* @type [Node]
*/
DWHUtil.xpGetNodes = function(node,xpath) {
	var nodes=[];
    var xpr=node.ownerDocument.evaluate(xpath,
        node,null,
        XPathResult.ORDERED_NODE_ITERATOR_TYPE,
        null);
    var node0=xpr.iterateNext();
    while(node0!=null) {
    	nodes.push(node0);
        node0=xpr.iterateNext();
    }
	return nodes;
}

/**
* Utility to get an array of strings from the given XPath expression
* @param {node} node the XPath reference node
* @param {string} xpath the XPath expression
* @type [string]
*/
DWHUtil.xpGetStrings = function(node,xpath) {
	var strings=[];
    var xpr=node.ownerDocument.evaluate(xpath,
        node,null,
        XPathResult.ORDERED_NODE_ITERATOR_TYPE,
        null);
    var node0=xpr.iterateNext();
    while(node0!=null) {
    	if(node0.nodeType==Node.TEXT_NODE)
    		strings.push(node0.nodeValue);
    	else if(node0.firstChild!=null && node0.firstChild.nodeType==Node.TEXT_NODE)
    		strings.push(node0.firstChild.nodeValue);
        node0=xpr.iterateNext();
    }
	return strings;
}

/**
* Utility to get a single string value from the given XPath expression
* @param {node} node the XPath reference node
* @param {string} xpath the XPath expression
* @type string
*/
DWHUtil.xpGetString = function(node,xpath) {
	var text=node.ownerDocument.evaluate(xpath,node,null,
		XPathResult.STRING_TYPE,null).stringValue;
	return text;
}

/**
* Determines a strign starts with the given substring
*/
DWHUtil.startsWith = function(str,substr) {
	if(str.substring(0,substr.length)==substr)
		return true;
	else
		return false;
}

DWHUtil.clearMenu=function(menupopup) {
	while(menupopup.firstChild) {
		menupopup.removeChild(menupopup.firstChild);
	}
}

DWHUtil.populateMenu=function(menupopup,data,global) {
	if(global==null)
		global={};
	for(var i=0;i<data.length;i++) {
		if(data[i].menuseparator==true) {
			var menusep=menupopup.ownerDocument.createElement("menuseparator");
			menupopup.appendChild(menusep);
		} else if(data[i].menu!=null) {
			var menu=menupopup.ownerDocument.createElement("menu");
			menu.setAttribute("label",data[i].label);
			var menupopup0=menupopup.ownerDocument.createElement("menupopup");
			menu.appendChild(menupopup0);
			DWHUtil.populateMenu(menupopup0,data[i].menu,global);
			menupopup.appendChild(menu);
		} else {
			var menuitem=menupopup.ownerDocument.createElement("menuitem");
			for(var attr in data[i]) {
				var value=data[i][attr];
				menuitem.setAttribute(attr,value);
			}
			for(var attr in global) {
				var value=global[attr];
				menuitem.setAttribute(attr,value);
			}
			menupopup.appendChild(menuitem);
		}
	}
}

/**
* RDF service
* @type nsIRDFService
*/
DWHUtil.RDF = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService().QueryInterface(Components.interfaces.nsIRDFService);
/**
* RDF container utility service
* @type nsIRDFContainerUtils
*/
DWHUtil.RDFCUtils = Components.classes["@mozilla.org/rdf/container-utils;1"].getService().QueryInterface(Components.interfaces.nsIRDFContainerUtils);

DWHUtil.DWHELPER_NS="http://dwhelper.xxx/1.0#";

DWHUtil.stringBundle=Components.classes["@mozilla.org/intl/stringbundle;1"].getService().
	QueryInterface(Components.interfaces.nsIStringBundleService).createBundle("chrome://dwhelper/locale/strings.properties");

DWHUtil.promptService=Components.classes["@mozilla.org/embedcomp/prompt-service;1"].
		getService(Components.interfaces.nsIPromptService);


DWHUtil.getText=function(name) {
	try {
		return DWHUtil.stringBundle.GetStringFromName(name);
	} catch(e) {
		return name;
	}
}

DWHUtil.getFText=function(name,params) {
	if(params==null)
		params=[];
	try {
		return DWHUtil.stringBundle.formatStringFromName(name,params,params.length);
	} catch(e) {
		return name;
	}
}

DWHUtil.loadAsync = function(url,callback,args,body,method,options) {
	if(DWHUtil.loadAsync.arguments.length<2)
		callback=null;
	if(DWHUtil.loadAsync.arguments.length<3)
		args={};
	if(DWHUtil.loadAsync.arguments.length<6)
		options={};
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.userCallback=callback;
	xmlhttp.userUrl=url;
	xmlhttp.userArgs=args;
	if(DWHUtil.loadAsync.arguments.length<=4)
		method="GET";
	else
		method=method.toUpperCase();
	xmlhttp.requestedUrl = url;
	xmlhttp.open (method, url);
	if(options.contentType!=null)
		xmlhttp.setRequestHeader("content-type",options.contentType);
	if(options.referer!=null) 
		xmlhttp.setRequestHeader("referer",options.referer);
	xmlhttp.onerror=function(ev) {
	    var req = ev.target.channel.QueryInterface(Components.interfaces.nsIRequest);
	    var msg="Connection error: ";
	    switch(req.status) {
	    	case 2152398861:
		        msg+="Connection refused";
		        break;
				default:
				 	msg+=" "+req.status;
	    }
		if(this.userCallback!=null) {
			try {
				msg="Error on url "+this.requestedUrl+"\n"+msg;
				this.userCallback(false,msg,this.userArgs);
			} catch(e) {
			}
		}
	}
	xmlhttp.onload=function(ev) {
		if(this.userCallback!=null) {
			try {
				if(this.status==200) {
					this.userCallback(true,this,this.userArgs);
				}
				else {
					var msg = "Error on url "+this.requestedUrl+"\n"+this.status+": "+this.statusText;
					this.userCallback(false,msg,this.userArgs);
				}
			} catch(e) {
			}
		}
	}
	xmlhttp.onreadystatechange=function() {
	}
  	//xmlhttp.setRequestHeader('Content-Type','text/xml; charset=utf-8');
  	var data="";
  	if(DWHUtil.loadAsync.arguments.length>3 && body!=null)
		data=body;
   	xmlhttp.send(body);
}

DWHUtil.getVersion=function() {
	var extMgr=Components.classes["@mozilla.org/extensions/manager;1"].
		getService(Components.interfaces.nsIExtensionManager);
	var extId="{b9db16a4-6edc-47ec-a1f4-b86292ed211d}";
	var version=DWHUtil.getPropertyValue(extMgr.datasource,
		DWHUtil.RDF.GetResource("urn:mozilla:item:"+extId),
		DWHUtil.RDF.GetResource("http://www.mozilla.org/2004/em-rdf#version")
	);
	return version;
}

DWHUtil.getFlashGot=function() {
	var flashGot=null;
	try {
		flashGot=Components.classes["@maone.net/flashgot-service;1"].
			getService(Components.interfaces.nsISupports).wrappedJSObject;
	} catch(e) {
	}
	return flashGot;
}

DWHUtil.getDownloadMode=function(pref) {
	var downloadMode="onebyone";
	try {
		downloadMode=pref.getCharPref("download-mode");
	} catch(e) {
	}
	if(downloadMode=="flashgot" && DWHUtil.getFlashGot()==null)
		downloadMode="onebyone";
	return downloadMode;
}

DWHUtil.getTopWindow=function() {
	var wwatch = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService().
		QueryInterface(Components.interfaces.nsIWindowWatcher);
	var i=wwatch.getWindowEnumerator();
	while(i.hasMoreElements()) {
		var w=i.getNext().QueryInterface(Components.interfaces.nsIDOMWindow);
		try {
			var w0=w.QueryInterface(Components.interfaces.nsIDOMWindowInternal);
			if(w0.location.href=="chrome://browser/content/browser.xul")
				return w0;
		} catch(e) {}
	}
	return null;
}

DWHUtil.urlEncodeObject=function(obj) {

	var Util=Components.classes["@downloadhelper.net/util-service;1"]
		.getService(Components.interfaces.dhIUtilService);
	
	var enc="";
	for(var k in obj) {
		if(enc.length>0)
			enc+="&";
		enc+=k+"=";
		enc+=Util.encodeURL(obj[k]);
	}
	return enc;
}

DWHUtil.serializeNode=function(node) {
	var str="";
	if(node.nodeType==Node.ELEMENT_NODE) {
		str+="<"+node.nodeName+">\n";
		var node0=node.firstChild;
		while(node0!=null) {
			str+=DWHUtil.serializeNode(node0);
			node0=node0.nextSibling;
		}
		str+="</"+node.nodeName+">\n";
	}
	return str;
}

DWHUtil.toClipboard=function(text) {
	var str = Components.classes["@mozilla.org/supports-string;1"].
		createInstance(Components.interfaces.nsISupportsString); 
	if (!str) return; 
	str.data = text; 
	var trans = Components.classes["@mozilla.org/widget/transferable;1"].
		createInstance(Components.interfaces.nsITransferable);
	if (!trans) return; 
	trans.addDataFlavor("text/unicode"); 
	trans.setTransferData("text/unicode",str,text.length * 2); 
	var clipid = Components.interfaces.nsIClipboard; 
	var clip = Components.classes["@mozilla.org/widget/clipboard;1"].
		getService(clipid); 
	if (!clip) return; 
	clip.setData(trans,null,clipid.kGlobalClipboard);
}

DWHUtil.setCookie=function(cname,cvalue) {
	try {
		var cMgr = Components.classes["@mozilla.org/cookiemanager;1"].
           getService(Components.interfaces.nsICookieManager2);
		cMgr.add(".downloadhelper.net","/",cname,""+cvalue,false,true,new Date().getTime()/1000+10000000);
	} catch(e) {
	}
}

DWHUtil.removeCookie=function(cname) {
	try {
		var cMgr = Components.classes["@mozilla.org/cookiemanager;1"].
           getService(Components.interfaces.nsICookieManager);
		cMgr.remove(".downloadhelper.net",cname,"/",false);
	} catch(e) {
	}
}

DWHUtil.setDWCountCookie=function(pref) {
	try {
		var dcc=pref.getBoolPref("disable-dwcount-cookie");
		if(dcc==true)
			return;
	} catch(e) {
	}	
	try {
		var dwcount=pref.getIntPref("download-count");
		DWHUtil.setCookie("dwcount",dwcount);
	} catch(e) {
	}	
}

DWHUtil.insertVideo=function(video, controler) {
    //dump("\ninsertVideo("+video+", "+window.content.location.href+")");
    var params = "&action=insertvideourl&video="+escape(video)+"&url="+escape(window.content.location.href);
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
                dump("controler: "+controler+"\nresponse: "+http_request.responseText);
                dump("DONE\n");
            } 
            else {
                dump("\nproblem with insertvideo request\n")
            }
        }
    }
    
	http_request.open('POST', "http://localhost/videodfs.php", true);  // does it matter if it's POST or GET?
	http_request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	http_request.send(params);
}

function dumpDatasource(ds) {
	if(ds==null)
		return;
	var i = ds.GetAllResources();
	while(i.hasMoreElements()) {
		var source = i.getNext();
		var j = ds.ArcLabelsOut(source);
		while(j.hasMoreElements()) {
			var predicate = j.getNext();
			var k = ds.GetTargets(source,predicate,true);
			while(k.hasMoreElements()) {
				var target = k.getNext();
				source=source.QueryInterface(Components.interfaces.nsIRDFResource);
				predicate=predicate.QueryInterface(Components.interfaces.nsIRDFResource);
				try {
					target=target.QueryInterface(Components.interfaces.nsIRDFResource);
				} catch(e) {
					target=target.QueryInterface(Components.interfaces.nsIRDFLiteral);
				}
				dump(source.Value+" - "+predicate.Value+" - "+target.Value+"\n");
			}
		}
	}
}


/******************************************************************************
 *            Copyright (c) 2006 Michel Gutierrez. All Rights Reserved.
 ******************************************************************************/

function Progress(tr) {
	this.tr=tr;
}

Progress.prototype.onLocationChange=function(webProgress, request, location ) {
	this.tr.onLocationChange(webProgress, request, location);
}

Progress.prototype.onProgressChange=function(webProgress, request, curSelfProgress, maxSelfProgress, curTotalProgress, maxTotalProgress ) {
	this.tr.onProgressChange(webProgress, request, curSelfProgress, maxSelfProgress, curTotalProgress, maxTotalProgress );
}

Progress.prototype.onSecurityChange=function(webProgress, request, state ) {
	this.tr.onSecurityChange(webProgress, request, state );
}

Progress.prototype.onStateChange=function(webProgress, request, stateFlags, status ) {
	this.tr.onStateChange(webProgress, request, stateFlags, status );
	if(stateFlags & Components.interfaces.nsIWebProgressListener.STATE_STOP) {
		DWHelper_transferDone(status,request);
	}
}

Progress.prototype.onStatusChange=function(webProgress, request, status, message ) {
	this.tr.onStatusChange(webProgress, request, status, message );
}

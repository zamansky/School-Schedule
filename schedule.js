
/*-------------------- Class related stuff -------------------------*/

/*
 * Override the toLocaleString function in the javascript Date 
 * class so that it returns am/pm time instead of 24hour.
 */
Date.prototype.toLocaleTimeString=function(){
    var hours=this.getHours();
    var minutes =this.getMinutes();
    var seconds = this.getSeconds();
    var suffix = "am";
    if (hours > 12){
	hours = hours - 12;
	suffix = "pm";
    }
    if (hours==12)
	suffix="pm";
    var h,m,s;
    h=""+hours;
    if (hours<10)
	h="0"+hours;
    m=""+minutes;
    if (minutes < 10)
	m="0"+minutes;
    s=""+seconds;
    if (seconds<10)
	s="0"+seconds;
    var retval = ""+h+":"+m+":"+s+suffix;    
    return retval;
}


/*----------------------------------------------------------------------*/
/*
 * Schedule
 * 
 * Prototype for a schedule -- get's the raw data from spreadsheet
 * and a string. 
 *
 *  holds three parallel arrays indexed by "period"
 *  labels, start, and stop 
 */
function Schedule(name,data) {
    var hr,min,sec,tmp;
    var a2,d;
    this.name = name;
    this.labels = new Array();
    this.start = new Array();
    this.stop = new Array();


    var d_array = data.split('\n');

    for (l in  d_array) {
	var a = d_array[l].split(',');
	// if we're at a "labels" line for the schedule, parse it
	if (a[0] == name && a[1] == "labels") {
	    // process the labels
	    a2 = a.slice(2);
	    for (item in a2) {
		this.labels.push(a2[item]);
	    }
	}
	// if we're at a "start" line of the schedule, parse it
	if (a[0] == name && a[1] == "start") {
	    // process the starts
	    a2 = a.slice(2); 
	    for (item in a2) {
		tmp =  a2[item].split(':');
		hr = tmp[0]; min = tmp[1];
		d = new Date();
		d.setHours(hr);
		d.setMinutes(min);
		d.setSeconds(0);
		this.start.push(d);
	    }
	}
	// if we're at the "stop" line of the schedule, parse it
	if (a[0] == name && a[1] == "stop") {
	    // process the stops
	    a2 = a.slice(2); 
	    for (item in a2) {
		tmp =  a2[item].split(':');
		hr = tmp[0]; min = tmp[1];
		d = new Date();
		d.setHours(hr);
		d.setMinutes(min);
		d.setSeconds(0);
		this.stop.push(d);
	    }
	}
    }
}

/*----------------------------------------------------------------------*/
/*
 * Updates the right side (current period) of the web page
 * Uses the global "sched" variable
 * 
*/
function updatePeriod() {
    var d = new Date();
    var newtime=d.toLocaleTimeString();
    var i;
    var len = sched.labels.length;
    var isinperiod = true;

    /* determine if we're in a period or between */
    for (i=0;i<len;i++) {
	if ( d>=sched.start[i] && d<=sched.stop[i]) {
	    pd = i;
	    isinperiod = true;
	    break;
	}
	if (d>=sched.stop[len-1] || 
	    (d>=sched.stop[i] && d<=sched.start[(i+1)%len])){
	    pd = i;
	    isinperiod = false;
	    break;
	}
    }

    // Now calc how many minutes left and update the html;
    var l;
    if (isinperiod) {
	var current=d.getTime();
	var start = sched.start[i].getTime();
	var stop = sched.stop[i].getTime();
	var into=(current-start) / 1000 / 60 ;
	var left=(stop-current) / 1000 / 60 + 1 ; 
	$("#into").html(parseInt(into));
	$("#left").html(parseInt(left));
	$("#into").addClass("inperiod");
	$("#left").addClass("betweenperiod");
	$("period").html(sched.labels[i]);
	l = sched.labels[i];
	$("#periodlabel").html(l);
    }
    if (!isinperiod) {
	var current=d.getTime();
	var start = sched.stop[i].getTime();
	var stop = sched.start[(i+1)%len].getTime();
	var into=(current-start) / 1000 / 60 ;
	var left=(stop-current) / 1000 / 60 + 1 ; 
	$("#into").html(parseInt(into));
	$("#left").html(parseInt(left));
	$("#into").addClass("betweenperiod");
	$("#left").addClass("inperiod");
	l = "Before pd "+sched.labels[(i+1)%len];
	$("#periodlabel").html(l);
	}

    /* Always update the time on the html */
    $("#time").html(newtime);
}

/*----------------------------------------------------------------------*/
/*
 * Recolors the schedule on the right hand side of the web page
 */
function updateSchedule() {
    var d = new Date();
    var i;
    // Remove the old class names (remove the color via css)
    $(".inperiod").removeClass("inperiod");
    $(".inperiod").removeClass("betweenperiod");
    $(".betweenperiod").removeClass("inperiod");
    $(".betweenperiod").removeClass("betweenperiod");

    /* set the colors via css */
    var len = sched.labels.length;
    for (i=0;i<len;i++){
	// see if we're in a period - if so add the css clas
	if ( d>=sched.start[i] && d<=sched.stop[i]) {
	    $("#"+sched.labels[i]).addClass("inperiod");
	}
	// see if we're between periods - add classes to current and next
	if (d>=sched.stop[i] && d<=sched.start[(i+1)%len])
	{
	    $("#"+sched.labels[i]).addClass("betweenperiod");
	    $("#"+sched.labels[(i+1)%len]).addClass("betweenperiod");
	}
    }
}

/*----------------------------------------------------------------------*/
/*
 * 
 */
function updateDisplay() {
    updateSchedule();
    updatePeriod();
}

	 
/*----------------------------------------------------------------------*/
/*
 * Build a table for the schedule and places it on the right hand side
 * of the web page
 * 
 * Later we will only have to update the colors as the period changes
 */
function displaySchedule(sched) {
    var i;
    var s="";
    var tr;
    var t = $("<table class=medium border=1></table>");
    t.append("<tr><th class=large colspan=3>"+sched.name+"</th></tr>");
    t.append("<tr><th>Period</th><th>Start</th><th>End</th></tr");

    for (i=0;i<sched.labels.length;i++){
	tr="<tr id="+sched.labels[i]+">";
	tr = tr + "<td>"+sched.labels[i]+"</td>";
	tr = tr + "<td>"+sched.start[i].toLocaleTimeString()+"</td><td>"+
	    sched.stop[i].toLocaleTimeString()+"</td>";
	tr = tr + "</tr>";	
//	alert(tr);
	t.append(tr);
    } 
$("#schedule").html(t);
}




/*----------------------------------------------------------------------*/
/*
 * Build the period table and display time left, time into, etc.
 */
function displayPeriod(sched) {
    var i;
    var len=sched.labels.length;
 
    // figure out the period we're in
    var d = new Date();
    var pd=0;
    for (i=0;i<len;i++){
	if (d>=sched.start[i] && d<=sched.stop[i])
	{
	    pd = i;
	    break;
	}
	if (d>=sched.stop[i] && d<=sched.start[(i+1)%len])
	{
	    pd = i;
	    break;
	}
    }
    $("#periodlabel").html(sched.labels[pd]);
    $("#time").html(d.tolocaleTimeString);

}

/*----------------------------------------------------------------------*/
/*
 * Global variables  
 */
// current schedule
var sched;
// all the rawdata from the remote spreadsheet (or localStorage
var rawdata;
// All the schedules
var schedules = new Array();
// which one is the default
var defaultsched;


/*----------------------------------------------------------------------*/
/*
 * sets the above global variables
 */
function setGlobals(data) {
    rawdata = data;
    var a = rawdata.split('\n');
    for (l in a) {
	var line = a[l].split(',');
	if ((!defaultsched || defaultsched=="web") &&  line[0] == "default") {
	    defaultsched=line[1];
	}
	if (line[0] == "schedules") {
	    var schednames = line.slice(1);
	    for (l in schednames) {
		schedules.push(schednames[l]);
	    }
	}
    }
    
}




/*----------------------------------------------------------------------*/
/*
 * Makes the initial web page and displays it
 * also sets the interval timer to update display
 */
function makePage(data) {

    var d = new Date();
    var today = localStorage['today'];
    // If we stored today and it's still today
    // we should use the stored schedule (revert back to 
    // the default tomorrow)
    if (today && today == d.toLocaleDateString())
	{
	    defaultsched = localStorage['schedule'];
	}

    // If the select box changes, save todays date for the above
    // if and change and redisplay the new schedule
    var s = $("<select id=\"selection\"></select>");
    s.change(function(){
		 var val = $(this).find('option:selected').text();
		 sched = new Schedule(val,data);
		 displaySchedule(sched);
		 displayPeriod(sched);
		 localStorage['schedule']=sched.name;
		 var dd = new Date();
		 localStorage['today']=dd.toLocaleDateString();
	     })

    // Make the schedule selection box
    for (l in schedules) {
	var b = $("<option></option>");
	b.text(schedules[l]);
        if (b.text()==defaultsched) {
	    //	    console.log(defaultsched);
	    b.attr('selected',true);
	}
	b.attr("id",schedules[l]);
	s.append(b);
    }
    $("#buttons").append(s);

    /* check localstorage to see if we have to change
     * defaultsched
     */
    sched = new Schedule(defaultsched,data);
    displaySchedule(sched);
    displayPeriod(sched);
    setInterval(updateDisplay,1000);
}  


/*----------------------------------------------------------------------*/
/*
 * when the spreadsheet call comes back, save the new data in local storage
 * and reset the globals
 */
function webSetup(data) {
    if (!rawdata){
	// if we don't have data, save it and then conitnue
	// this is for a first time run
	localStorage["rawdata"]=data;
	setGlobals(data);
	makePage(rawdata);
    }
    else
    {
	// normally we will already have saved rawdata in localStorage
	// so wwe can just reset the globals (the page will already
	// have been made
	localStorage['rawdata']=data;
	setGlobals(data);
    }
    
}

/*----------------------------------------------------------------------*/
/*
 * This starts it all off
 */
function loadSchedules() {

    //set the configure button
    $("#configure").click(function() {window.location.replace("options.html");})
    // if we haven't set up yet, redirect to options page
    var url;
    url = localStorage['url'];
    defaultsched = localStorage['default'];
    if (!url) {
	window.location.replace("options.html");
    }

    // try to load rawdata from localstorage
    rawdata = localStorage['rawdata'];
    if (rawdata) {
	// load the initial schedules
	setGlobals(rawdata);
	makePage(rawdata);
    }

    // replace it from web spreadsheet if the spreadsheet's active
    $.get(url,webSetup);
}


/*----------------------------------------------------------------------*/

window.onload = loadSchedules


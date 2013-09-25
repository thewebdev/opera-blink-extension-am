/*  This file is part of Google Adsense Monitor. Google Adsense Monitor
	is an Opera 15+ extension that lets you view updates to your latest 
	adsense earnings in an Opera Speed Dial.
	
    Copyright (C) 2013 M Shabeer Ali

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
	
	Website: http://adsensemonitor.tumblr.com/
	Source code: https://github.com/thewebdev/opera-blink-extension-am.git
	Email: thewebdev@myopera.com 
*/

function $(v) {
	if (document.getElementById(v)) {
		return document.getElementById(v);
	}
}

function hide(id) {
	$(id).style.display = 'none';
}

function show(id) {
	$(id).style.display = 'block';
}	

function status(msg) {
	/* Used to display messages
	   to the user */
	   
	var hangTimer;
	
	$("msg").firstChild.nodeValue = msg;
	show("msg");
	
	/* show status update for 7 seconds */
	clearTimeout(hangTimer);
	hangTimer = setTimeout(function () {
		hide("msg");
	}, 7000);	
}

function apply() {
	/* Saves the changes permanently */
	
	var checketo, checkemo, checketu, checkass;
	var i, d;
	
	checketo = document.input.eto.checked;
	checketo = checketo ? 1 : 0;
	
	checkemo = document.input.emo.checked;
	checkemo = checkemo ? 1 : 0;
	
	checketu = document.input.etu.checked;
	checketu = checketu ? 1 : 0;
	
	checkass = document.input.ass.checked;
	checkass = checkass ? 1 : 0;	

	/* Validate - Atleast one item 
	   needs to be displayed. */
	
	if ((checketo == 0) && (checkemo == 0) && (checketu == 0)) {
		status("Error: Atleast ONE type of earnings should be selected.");
		return;
	}
	
	i = document.input.interval.value;
	i = parseInt(i, 10);		

	if (!i) { 
		/* Validation - interval should be a number */
		status("Error: Update interval should be a number");
		return;
	} else {
		document.input.interval.value = i;
	}
	
	if (i < 15) {
		/* Validation - interval cannot be less than 15 */
		status("Error: Update interval should be more than 15 minutes.");
		return;			
	}

	d = document.input.delay.value;
	d = parseInt(d, 10);
	
	if ((!d) && (d != 0)) { 
		/* Validation - delay should be a number */
		status("Error: Display delay should be a number");
		return;
	} else {
		document.input.delay.value = d;
	}
	
	if (d <= 0) {
		/* Validation - delay cannot be less than 1 */
		status("Error: Display delay can't be less than 1 second.");
		return;			
	}	
	
	/* save changes */
	if (localStorage) {
		localStorage.setItem('edaily', checketo);
		localStorage.setItem('emonthly', checkemo);
		localStorage.setItem('etotal', checketu);
		localStorage.setItem('slideshow', checkass);
		if (checkass) {
			localStorage.setItem('showfor', d);
		}
		
		localStorage.setItem('interval', i);
		
		status("All changes saved.");
	} else {
		status("Error 202: Couldn't save changes.");
	}
	
	return;
}

function load() {
	/* Loads the saved values and displays 
	   it to the user for making changes. */ 
	
	if (localStorage) {
		if (localStorage.getItem('edaily')) {
			var edaily = parseInt((localStorage.getItem('edaily')), 10);
		}
		
		if (localStorage.getItem('emonthly')) {
			var emonthly = parseInt((localStorage.getItem('emonthly')), 10);
		}
		
		if (localStorage.getItem('etotal')) {
			var etotal = parseInt((localStorage.getItem('etotal')), 10);
		}
		
		if (localStorage.getItem('interval')) {
			var interval = parseInt((localStorage.getItem('interval')), 10);
		}
		
		if (localStorage.getItem('showfor')) {
			var showfor = parseInt((localStorage.getItem('showfor')), 10);
		}
		
		if (localStorage.getItem('slideshow')) {
			var slideshow = parseInt((localStorage.getItem('slideshow')), 10);
		}		
	} else {
		status("Error 201: Couldn't load default values.");
		return;	
	}
	
	if (edaily) { document.input.eto.checked = true; } 
	if (emonthly) { document.input.emo.checked = true; } 
	if (etotal) {document.input.etu.checked = true;	} 
	
	if (slideshow) {document.input.ass.checked = true;	}	
	
	if (interval) {document.input.interval.value = interval; } 
	if (showfor) {document.input.delay.value = showfor; } 
}

function disable() {
	var checked;
	
	checked = document.input.ass.checked;
	checked = checked ? 1 : 0;
	
	if (!checked) {
		document.input.delay.disabled = true;
	} else {
		document.input.delay.disabled = false;
	}
}

function submit() {
	return false;
}

function init() {
	/* some basic settings intialised here */
	
	/* monitor for button clicks */
	$('input').addEventListener('submit', submit, false);
	$('apply').addEventListener('click', apply, false);
	$('ass').addEventListener('click', disable, false);	
	
	load();
}

/*  monitor and inform when HTML file is ready */
document.addEventListener('DOMContentLoaded', init, false);
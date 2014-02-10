/*  This file is part of Google Adsense Monitor. Google Adsense Monitor
	is an Opera 15+ extension that lets you view updates to your latest 
	adsense earnings in an Opera Speed Dial.

	
    Copyright (C) 2013 - 2014 M Shabeer Ali

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
	Email: thewebdev@yandex.com */

/*jslint plusplus: true, continue: true*/
/*global document: false, clearTimeout: false, clearInterval: false, setTimeout: false, setInterval: false, localStorage: false, XMLHttpRequest: false, window: false, console: false */

"use strict";
var timeIt, slider, data, rate;
	// timeIt - data refresh timer
	// slider - slide time delay
	// data - scraped adsense page
    // parsed currency rate

function $(v) {
	/* DOM: identifies element */
    
	if (document.getElementById(v)) {
		return document.getElementById(v);
	}
}

function e(v) {
	/* DOM: creates new element */
	return document.createElement(v);
}

function txt(v) {
	/* DOM: creates text nodes */
	return document.createTextNode(v);
}

function hide(id) {
	$(id).style.display = 'none';
}

function show(id) {
	$(id).style.display = 'block';
}

function trueRound(value) {
/*  Original code from stackoverflow.com 
	Rounds a float to specified number of decimal places */

	var digits = 2;
    return (Math.round((value * Math.pow(10, digits)).toFixed(digits - 1)) / Math.pow(10, digits)).toFixed(digits);
}

function createDl(kids) {
/*  Creates the definition list used to
	display the data in the speed dial.
	The 'kids' parameter specifies how
	many nodes (dt dd pair) to create.
	Once the definition list is created,
	the function only adds or deletes
	dt dd node pairs as necessary.
	Opera recommends using createDocumentFragment()
	as it is faster to create the elements
	separately and then add to the page. */
	
	var dl, dt, dd, tx, inHtml, list, temp, temp1, z, a, x, i;
	
	inHtml = document.createDocumentFragment();
	list = $("rateSlides");
	
	if ($("rateSlides")) {
		/*  if dl node exists */
		
		$("rateSlides").className = '';
		temp = $("rateSlides").getElementsByTagName('dt');
		
		if (temp.length === kids) {
			return;
		} else if (temp.length < kids) {
			/*  add more dt dd nodes */
			
			z = kids - temp.length;
			
			for (a = 0; a < z; a++) {
				dt = e('dt');
				tx = txt('');
				dt.appendChild(tx);
				
				inHtml.appendChild(dt);
				
				dd = e('dd');
				tx = txt('');
				dd.appendChild(tx);
				
				inHtml.appendChild(dd);
			}
			
			$("rateSlides").appendChild(inHtml);
			return;
			
		} else if (temp.length > kids) {
			/*  delete some dt dd nodes */
			
			temp1 = $("rateSlides").getElementsByTagName('dd');
			
			x = temp.length - kids;
			
			while (x !== 0) {
				$("rateSlides").removeChild(temp[0]);
				$("rateSlides").removeChild(temp1[0]);
				x -= 1;
			}
			
			return;
		}
	}
	
	/*  create the list and add to the DOM */
	dl = e('dl');
	dl.setAttribute('id', 'rateSlides');
	
	for (i = 0; i < kids; i++) {
		dt = e('dt');
		tx = txt('');
		dt.appendChild(tx);
		
		dl.appendChild(dt);
		
		dd = e('dd');
		tx = txt('');
		dd.appendChild(tx);
		
		dl.appendChild(dd);
	}

	inHtml.appendChild(dl);
	$('data').appendChild(inHtml);
	
	return;
}

function startSlide(count) {
	/* Displays the data.
	   Cycles through each dt dd pair
	   and marks it with css class name 
	   'current'. Pairs marked 'current'
	   are displayed, while others stay
	   hidden, using css. */
	
	var cls, dt, dd, done, tempDt, tempDd, e, i, s, t;
	
	done = false;
	tempDt = [];
	tempDd = [];

	dt = $("rateSlides").getElementsByTagName('dt');
	dd = $("rateSlides").getElementsByTagName('dd');

	for (e = 0; e < dt.length; e++) {
		/* Opera recommends making changes to 
		   a copy of the DOM */
		tempDt[tempDt.length] = dt[e];
	}
	
	for (i = 0; i < tempDt.length; i++) {
		if (done) {
			/* Once a dt element has been marked
			   'current', no need to go through
			   the rest of it as we display only
			   one dt element at a time. */
			
			continue;
		}
		
		cls = tempDt[i].className;
		
		if ((cls.indexOf("current")) !== -1) {
			
			/*  unmark the currently displayed dt */
			tempDt[i].className = "";
			
			if (i === (tempDt.length - 1)) {
				/* if we have reached the last 
				   dt, mark the first dt again. */
			
				tempDt[0].className = 'current';
			} else {
				tempDt[i + 1].className = 'current';
			}
			
			done = true;
		}
	}

	tempDt = null;
	done = false;

	/* do the same thing for dd element
	   as we did for the dt element in
	   the code above. */
	
	for (s = 0; s < dd.length; s++) {
		tempDd[tempDd.length] = dd[s];
	}
	
	for (t = 0; t < tempDd.length; t++) {
		if (done) { continue; }
		
		cls = tempDd[t].className;
		
		if ((cls.indexOf("current")) !== -1) {
			
			tempDd[t].className = "";

			if (t === (tempDd.length - 1)) {
				tempDd[0].className = 'current';
			} else {
				tempDd[t + 1].className = 'current';
			}
			
			done = true;
		}
	}
	
	tempDd = null;
}

function refDial(cmd, out) {
	/* Used to show the output
	   in the speed dial. */
	
	var dt, dd, temp, o;
	
	if (cmd === "slides") {
		/* Displays each data individually 
		   in the speed dial as slides
		   in a presentation. */
		
		clearInterval(slider);
		
		/* create the definition list
		   structure used to show the data. */
		createDl(out.length);
		
		dt = $("rateSlides").getElementsByTagName('dt');
		dd = $("rateSlides").getElementsByTagName('dd');
		
		for (o = 0; o < out.length; o++) {
			/*  add data */
			
			if (dt[o]) {
				/*  reset css class */
				dt[o].className = "";
				/*  assign the new data */
				dt[o].innerHTML = '<span class="etype">' + out[o][0] + '</span><br /><span class="' + out[o][1] + '">' +  out[o][2] + '<span>';
			}
			
			if (dd[o]) {
				/*  reset css class */
				dd[o].className = "";
				
				/*  assign the new data */
				temp = '';
				if (out[o][4]) { temp = ': ' + out[o][4]; }
				dd[o].innerHTML = out[o][3] + temp;
			}
		}
		
		dt[0].className = 'current';
		dd[0].className = 'current';
		
		hide("wait");
		show("data");
		
		/* set display delay between pair*/
		slider = setInterval(startSlide, parseInt((localStorage.getItem('showfor')), 10) * 1000);
		
		/*  start displaying the data */
		startSlide(out.length);
		return;
	}

	if (cmd === "showall") {
		/* Displays all the data in a 
		   tabular view. */
		
		clearInterval(slider);
		
		/* create the definition list
		   structure used to show the data. */
		createDl(out.length);
		
		/* set style to display as table */
		$("rateSlides").className = "table-display";
		
		dt = $("rateSlides").getElementsByTagName('dt');
		dd = $("rateSlides").getElementsByTagName('dd');
		
		for (o = 0; o < out.length; o++) {
			/*  add data */
			
			if (dt[o]) {
				/*  reset css class */
				dt[o].className = "current";
				/*  assign the new data */
				switch (out[o][0]) {
				case 'today':
					temp = 'day';
					break;
				case 'this month':
					temp = 'month';
					break;
				case 'total':
					temp = 'total';
					break;
				}
				dt[o].innerHTML = '<span class="ttitle">' + temp + ' </span>';
			}
			
			if (dd[o]) {
				/*  reset css class */
				dd[o].className = "current";
				
				/*  assign the new data */
				temp = '';
				if (out[o][4]) { temp = ' vs ' + out[o][4]; }
				dd[o].innerHTML = '<span class="' + out[o][1] + '">' +  out[o][2] + '</span>' + temp;
			}
		}
		
		hide("wait");
		show("data");

		return;
	}
	
	if (cmd === "login") {
		/* tell the user to login */
			
		$("msg").firstChild.nodeValue = "please login";

		clearInterval(slider);
		
		hide("data");
		show("wait");
		
		return;
	}
	
	if (cmd === "wait") {
		/* used to indicate that an
		   update of data is underway */

		$("msg").firstChild.nodeValue = "updating";

		clearInterval(slider);
		hide("data");
		show("wait");
		
		return;
	}
	
	if (cmd === "hang") {
		/* indicate some error
		   has occured */

		$("msg").firstChild.nodeValue = "Possible network error. Will retry again later.";
		
		clearInterval(slider);
		hide("data");
		show("wait");
		
		return;
	}
	
	if (cmd === "e101") {
		/* indicate some error
		   has occured */
		
		$("msg").firstChild.nodeValue = "Error 101: Couldn't initialize default values.";
		
		clearInterval(slider);
		hide("data");
		show("wait");
		
		return;
	}
}

function setDisplayTimer() {
	clearInterval(slider);
	slider = setInterval(startSlide, parseInt((localStorage.getItem('showfor')), 10) * 1000);
}

function extract(input) {
	/* Checks if user has logged into Google
	   Adsense control panel. If logged in,
	   scrape the earnings data, else ask
	   user to log in. */
	   
	var login, div, gcode, now, y, tm, lm, dComp, mComp, tue, te, eto, emo, etu, out, edaily, emonthly, etotal, slideshow, convert;
	
	out = [];
	edaily = parseInt((localStorage.getItem('edaily')), 10);
	emonthly = parseInt((localStorage.getItem('emonthly')), 10);
	etotal = parseInt((localStorage.getItem('etotal')), 10);
	
	slideshow = parseInt((localStorage.getItem('slideshow')), 10);
	convert = parseInt((localStorage.getItem('convert')), 10);
    
	if (input) {
	/*  parse the scraped page we got from Google */
		
		/* extract <body> element from scraped page */
		gcode = input.substring(input.indexOf("<body>") + 7, input.indexOf("</body>"));
		
		/* We extract data based on the id's. 
		   To do this efficiently, we use
		   querySelector(), which works on DOM, 
		   elements and document fragments. So we
		   create an element, append the elements 
		   from the scraped page and search for
		   known id's using querySelector(). */
		   
		div = e('div');
		div.innerHTML = input;
		
		/* the login form has an id called 'gaia_loginform' */
		login = div.querySelector("#gaia_loginform");
		
		if (login) {
			/* login form detected */
			
			/* inform user to login */
			refDial('login');
			
			/* reset refresh timer to check every 2 
			   minute if user has logged in */
			setRefreshTimer(2);
			
		} else {
			/* user is logged in */
			
			refDial('wait');
			
			/* reset refresh timer to default setting */
			setRefreshTimer(parseInt((localStorage.getItem('interval')), 10));
			
			if (edaily) {
				/* Daily earnings data */
				
				/* extract the earning data using the 
				   obvious id's */
				   
				now = div.querySelector("#earnings-today").firstChild.nodeValue;
				y = div.querySelector("#earnings-yesterday").firstChild.nodeValue;

				/* check if earning data is more or
				   less than previous day's earning */
				if ((parseFloat(now.substr(1))) < (parseFloat(y.substr(1)))) {
					dComp = "down";
				} else {
					dComp = "up";
				}
				
                /* Currency conversion */
				if (convert) {
					now = now.trim();
					y = y.trim();
					
					// remove dollar / euro symbol
					now = now.slice(1);
					y = y.slice(1);
					
					// convert to local currency
					now = parseFloat(now) * rate;
					y = parseFloat(y) * rate;
					
					// roundoff to 2 decimals
					now = trueRound(now);
					y = trueRound(y);
					
					now = String(now);
					y = String(y);
				}
				eto = ['today', dComp, now, 'yesterday', y];
				out.push(eto);
			}
			
			if (emonthly) {
				/* Daily earnings data */
				
				/* extract the earning data using the 
				   obvious id's */
				   
				
				tm = div.querySelector("#earnings-this-month").firstChild.nodeValue;
				lm = div.querySelector("#earnings-last-month").firstChild.nodeValue;
		

				/* check if earning data is more or
				   less than previous month's earning */
				if ((parseFloat(tm.substr(1))) < (parseFloat(lm.substr(1)))) {
					mComp = "down";
				} else {
					mComp = "up";
				}
                
                /* Currency conversion */
				if (convert) {
					tm = tm.trim();
					lm = lm.trim();
					
					// remove dollar / euro symbol
					tm = tm.slice(1);
					lm = lm.slice(1);
					
					// convert to local currency
					tm = parseFloat(tm) * rate;
					lm = parseFloat(lm) * rate;
					
					// roundoff to 2 decimals
					tm = trueRound(tm);
					lm = trueRound(lm);
					
					tm = String(tm);
					lm = String(lm);
				}
				
				emo = ['this month', mComp, tm, 'last month', lm];
				out.push(emo);
			}
			
			if (etotal) {
				/* get total unpaid earnings - this
				   is slightly tricky as there is no
				   obvious id to search for this data */
				
				tue = div.querySelectorAll('ul.metrics-list li:first-of-type span.value');
				te = tue[1].firstChild.nodeValue;
                
				if (convert) {
					te = te.trim();
					
					// remove dollar / euro symbol
					te = te.slice(1);
					
					// convert to local currency
					te = parseFloat(te) * rate;
					
					// roundoff to 2 decimals
					te = trueRound(te);
					
					te = String(te);
				}
                
				etu = ['total', 'up', te, 'unpaid earnings'];
				out.push(etu);
			}
			
			/* check how the user wants data
			   to be displayed. */
			if (slideshow) {
				refDial('slides', out);
			} else {
				refDial('showall', out);
			}
		}
	}
	
	return;
}

function converter(file, arc, luc) {
	/* Currency conversion */
	
	var csv, rates;
    csv = file.split(/\r?\n/);
	
	if (arc === 'USD') {
		rates = csv[0].split(',');
		rate = parseFloat(rates[1]);
	}
	
	if (arc === 'EUR') {
		rates = csv[0].split(',');
		rates = rates.concat(csv[1].split(','));
		rate = parseFloat(rates[3]) / parseFloat(rates[1]);
	}
	
	return;
}

function getRates() {
	/* Get currency rate from Yahoo! */
	
	var csvfile, query, url, arc, luc, ext;
    
    refDial('wait');

    url = 'http://download.finance.yahoo.com/d/quotes.csv?f=sl1&e=.cs&s=';
    arc = localStorage.getItem('arc');
	luc = localStorage.getItem('luc');
	
	if (arc === 'USD') {
		query = arc + luc + '=X';
	}
	
	if (arc === 'EUR') {
		query = 'USDEUR=X&s=USD' + luc + '=X';
	}
	
	url = url + query;
	
	ext = new XMLHttpRequest();

	ext.open('GET', url, true);
	
	ext.onreadystatechange = function (event) {
		if (this.readyState === 4) {
			if (this.status === 200 && this.responseText) {
				csvfile = this.responseText;
				converter(csvfile, arc, luc);
			} else {
				/* possible network error -
				   tell the user. */
				console.log("Yahoo");
				refDial('hang');
			}
		}
	};

	ext.send();
	return;
}

function getReport() {
	/* Scrape the mobile version of 
	   Google Adsense Control Panel. */
	
	var url, ext;
	url = "https://www.google.com/adsense/v3/m/home";
	
	refDial('wait');
	ext = new XMLHttpRequest();

	ext.open('GET', url, true);
	
	ext.onreadystatechange = function (event) {
		if (this.readyState === 4) {
			if (this.status === 200 && this.responseText) {
				data = this.responseText;
				extract(data);
			} else {
				/* possible network error -
				   tell the user. */
				console.log("Google");
				refDial('hang');
			}
		}
	};

	ext.send();
	return data;
}

function scrape() {
	/* get the data */
	
	var convert = parseInt((localStorage.getItem('convert')), 10);
	if (convert) {
		getRates();
	}
	
	getReport();
	return;
}

function setRefreshTimer(time) {
	clearInterval(timeIt);
	timeIt = setInterval(scrape, time * 60 * 1000);
}

function reconfigure(e) {
	/* Updates the speed dial when the 
		user modifies & saves options. */

	var gac = data;
	switch (e.key) {
	case 'interval':
		setRefreshTimer(parseInt((localStorage.getItem('interval')), 10));
		break;
	case 'showfor':
		setDisplayTimer();
		break;
	case 'edaily':
		extract(gac);
		break;
	case 'emonthly':
		extract(gac);
		break;
	case 'etotal':
		extract(gac);
		break;
	case 'slideshow':
		extract(gac);
		break;
	}
}
 
function init() {
	/* some basic settings intialised here
	   to get the extension running */

	if (localStorage) {
	
		/*  1. INTERVAL
			Specifies the time when data 
            should be refreshed and updated.
			
			Default: 20
			Unit: Minute
            Type: Integer
			User Customizable: YES */
		if (!localStorage.getItem('interval')) {
			localStorage.setItem('interval', '15');
		}
		
		/*  2. SHOWFOR
			Specifies the time each slide is shown.
			
			Default: 3
			Unit: Seconds
            Type: Integer
			User Customizable: YES */
		if (!localStorage.getItem('showfor')) {
			localStorage.setItem('showfor', '3');
		}
		
		/*  3. EDAILY
			Indicates whether to display daily 
			earnings.
			
			Default: 1
			Type: Boolean (1 = TRUE, 0 = FALSE)
			User Customizable: YES */
		if (!localStorage.getItem('edaily')) {
			localStorage.setItem('edaily', '1');
		}
		
		/*  4. EMONTHLY
			Indicates whether to display 
			monthly earnings.
			
			Default: 1
			Type: Boolean (1 = TRUE, 0 = FALSE)
			User Customizable: YES */
		if (!localStorage.getItem('emonthly')) {
			localStorage.setItem('emonthly', '1');
		}

		/*  5. ETOTAL
			Indicates whether to display total 
			unpaid earnings.
			
			Default: 1
			Type: Boolean (1 = TRUE, 0 = FALSE)
			User Customizable: YES */
		if (!localStorage.getItem('etotal')) {
			localStorage.setItem('etotal', '1');
		}
		
		/*  6. SLIDESHOW
			Indicates whether to display data 
			as an animated slideshow.
			
			Default: 1
			Type: Boolean (1 = TRUE, 0 = FALSE)
			User Customizable: YES */
		if (!localStorage.getItem('slideshow')) {
			localStorage.setItem('slideshow', '1');
		}
        
		/*  7. CONVERT
			Indicates whether currency conversion
            is required.
			
			Default: 0
			Type: Boolean (1 = TRUE, 0 = FALSE)
			User Customizable: YES */
		if (!localStorage.getItem('convert')) {
			localStorage.setItem('convert', '0');
		}
        
		/*  8. ARC
			Stores 'Adsense Report Currency' when 
            currency conversion is enabled.
			
			Default: "USD"
			Type: String
			User Customizable: YES */
		if (!localStorage.getItem('arc')) {
			localStorage.setItem('arc', 'USD');
		}
        
		/*  9. LUC
			Stores 'Local User Currency' when
            currency conversion is enabled.
			
			Default: "GBP"
			Type: String
			User Customizable: YES */
		if (!localStorage.getItem('luc')) {
			localStorage.setItem('luc', 'GBP');
		}
		
		timeIt = setInterval(scrape, parseInt((localStorage.getItem('interval')), 10) * 60 * 1000);
		scrape();
		
	} else {
		refDial('e101');
	}
	
	/* monitors if options are updated and saved */
	window.addEventListener('storage', reconfigure, false);
}

/*  monitor and inform when HTML file is ready */
document.addEventListener('DOMContentLoaded', init, false);
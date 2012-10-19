var url = '/dmxacl/json/';
var jrpc = new JsonRpc.ServiceProxy(url, {asynchronous: false, methods: ['lightSync.pull', 'lightSync.push']});
var gotlights = '';
var multiForImage = 1.44;


function lightcolors2Hex(red, green, blue){
	color = '#';
	$.each([red, green, blue], function(index, value) { 
		if (value <= '15'){
			color += '0' + value.toString(16);
		} else {
			color += value.toString(16);
		}
	});
	return color;
}
function hex2lightColor(hexcolor){
	// substr
	red = hexcolor.substr(1,2);
	green = hexcolor.substr(3,2);
	blue = hexcolor.substr(5,2);
	// unhex
	red = parseInt(red, 16);
	green = parseInt(green, 16); 
	blue = parseInt(blue, 16);
	if (red < 10){
		red = '0' + red;
	}
	if (green < 10){
		green = '0' + green;
	}
	if (blue < 10){
		blue = '0' + blue;
	}
	lightarray = new Array(red, green, blue);
	return lightarray;
}
function showStatus(lights) {
	$("#main").css('background','none repeat scroll 0 0 transparent');
	statusinfos = '<div id="statusheader">';
	statusinfos += 'imagesize multi: ' + multiForImage + '<br />';
	statusinfos += 'jsonrpc url: ' + url;
	statusinfos += '</div>';
	for (var i in lights) {
		var l = lights[i];
		color = lightcolors2Hex(l.red, l.green, l.blue);
		statusinfos += '<div class="statusbox">';
		statusinfos += '<div style="text-align:center;border-bottom:1px solid silver;">' + l.name + '</div>';
		statusinfos += 'x: ' + l.x + '<br />';
		statusinfos += 'y: ' + l.y + '<br />';
		statusinfos += 'color: <span style="background-color: ' + color + ';color: ' + color + '">' + color + '</span><br />';
		statusinfos += 'channel : ' + l.channel + '<br />';
		statusinfos += 'channelsize : ' + l.channelsize + '<br />';
		statusinfos += 'radius : ' + l.radius + '<br />';
		statusinfos += '</div>';
	}
	$("#main").html(statusinfos);
}
function addSpots(lights){
	// clear main
	$('#main').empty();
	for (var i in lights) {
		var l = lights[i];
		color = lightcolors2Hex(l.red, l.green, l.blue)
		addSpotToDiv(l.name,l.x, l.y, color);
	}
}
function addAllSpotsSameColorButtons(){
	$('#buttons').append('<b>Change all</b><br/>');
	/*
	$.each(['FF', 'AA', '88', '44', '00'], function(index1, topvalue) { 
		$.each(['FF', 'AA', '88', '44', '00'], function(index2, midvalue) { 
			$.each(['FF', 'AA', '88', '44', '00'], function(index3, lowvalue) { 
	*/
	$.each(['FF', '88', '00'], function(index1, topvalue) { 
		$.each(['FF', 'C0', '40', '00'], function(index2, midvalue) { 
			$.each(['FF', 'C0', '40', '00'], function(index3, lowvalue) { 			
				thiscolor = lowvalue + '' + topvalue + '' + midvalue;
// TODO: change to clickable div				
				$('#buttons').append('<input class="colorButton" type="button" onclick="changeAllSpotsToColor(this.value)" value="#' + thiscolor + '" />');
			});
		});
	});
}

function changeAllSpotsToColor(color){
	// color is hex
	light = hex2lightColor(color);
	gotlights = getSpots();
	for (var i in gotlights) {
		spot = gotlights[i];
		spot.red = parseInt(light[0]);
		spot.green = parseInt(light[1]);
		spot.blue = parseInt(light[2]);
	}
	//$("#debug").html(var_dump(gotlights));
	jrpc.lightSync.push(gotlights);
	$('.spot').css('background-color', color);
	$('#infos').text("all spots changed to " + color); 
}

function addSpotToDiv(i,x,y,color){
	// $('#main').append('<div class="spot" id="spot' + i + '">' + i + '</div>');
	$('#main').append('<div class="spot" id="spot' + i + '" onclick="changeSpotColor(' + i + ')"></div>');
	x = parseInt(x * multiForImage);
	y = parseInt(y * multiForImage);
	var cssObj = {
		'background-color' : color,
		'top' : y - 10,
		'left': x - 10
	}
	$('#spot' + i).css(cssObj);
	$('#spot' + i).show();
}
function getSpots(){
	JsonRpc.setAsynchronous(jrpc, false);
	try {
		var gotlights = (jrpc.lightSync.pull());
		$('#infos').text("data loaded");
	} catch(e) {
		$('#infos').text("nope, sry: " + e);
	}
	return gotlights;
}
function newSpotColor(spotid, color){
	$('#spot' + spotid).css('background-color', color);
	light = hex2lightColor(color);
	// push
	jrpc.lightSync.push([{
		"name":  "" + spotid ,
		"red": parseInt(light[0]),
		"blue": parseInt(light[2]),
		"green": parseInt(light[1])
	}]);
	$('#infos').text("spot " + spotid + " changed to " + color); 
	$('#colortable').remove();
}
function test(){
	for ( i in localStorage){
		$('#debug').append('<br />');
		$('#debug').append(i);
	}
}

function savePreset(){
	try {
		var gotlights = (jrpc.lightSync.pull());
		var noNameFound = true;
		do {
			presetname = prompt("Presetname","Preset1");
			if(presetname in localStorage){
				$('#infos').text("preset name " + presetname + " already taken");
			} else {
				noNameFound = false;
			}
		} while (noNameFound);
		gotlightsjson = JSON.stringify(gotlights);
		// $("#debug").html(var_dump(gotlights));
		try {
			presetArray = new Array();
			if('presetlist' in localStorage){
				presetListStr = localStorage.getItem('presetlist');
				presetArray = JSON.parse(presetListStr);
			}
			presetArray.push(presetname);
			presetListStr = JSON.stringify(presetArray);
			localStorage.setItem('presetlist', presetListStr);
			localStorage.setItem(presetname, gotlightsjson);
			$('#infos').text("preset saved as " + presetname);
			$('#presets').append('<div onclick="delPreset(' + presetname + ')">- ' + presetname + ' -</div>');
		} catch (e) {
			$('#infos').text("set preset: nope, sry: " + e);
		}	
	} catch(e) {
		$('#infos').text("get lights: nope, sry: " + e);
	}
}

function loadPresets(){
	presetArray = new Array();
	if('presetlist' in localStorage){
		try {
			presetListStr = localStorage.getItem('presetlist');
			presetArray = JSON.parse(presetListStr);
			$('#infos').text("presets loaded");
		} catch (e) {
			$('#infos').text("load preset: nope, sry: " + e);
		}	
	} else {
		$('#presets').html('no presets yet');
		$('#infos').text("no presets yet");
	}
	return presetArray;
}
function showPresets(){
	presetarray = loadPresets();
	preset = '<input type="button" id="savepreset" onclick="savePreset()" value="Save This" /><br /><hr />';
	for(i in presetarray){
		preset += '<div class="' + presetarray[i] + ' namefield" onclick="sendPresetsToSpots(\'' + presetarray[i] + '\')">- ' + presetarray[i] + ' -</div>';
		preset += '<div class="' + presetarray[i] + ' delfield" onclick="delPreset(\'' + presetarray[i] + '\')">X</div>';
	}
	$('#presets').append(preset);
}
function delPreset(presetname){
	$('#infos').text("no presets yet");
	try {
		localStorage.removeItem(presetname);
		$('#infos').text( presetname + " deleted...");
		if('presetlist' in localStorage){
			presetListStr = localStorage.getItem('presetlist');
			presetArray = JSON.parse(presetListStr);
		}		
		var idx = presetArray.indexOf(presetname);
		if( idx != -1){ 
			presetArray.splice(idx, 1);
		}
		presetListStr = JSON.stringify(presetArray);
		localStorage.setItem('presetlist', presetListStr);
	} catch (e) {
		$('#infos').text("del preset: nope, sry: " + e);
	}
	$('.' + presetname).remove();
}

function sendPresetsToSpots(presetname){
	try {
		presetListStr = localStorage.getItem(presetname);
		presetArray = JSON.parse(presetListStr);
		jrpc.lightSync.push(presetArray);
		// reload divs
		addSpots(presetArray);
	} catch (e) {
		$('#infos').text("sendPresetsToSpots: nope, sry: " + e);
	}
	// getitem
	// push to rpc
}

function changeSpotColor(spotid){
// FF, CC , 99, 66 , 33 , 00
	table = '<div id="colortable">';
	table += '<table cellspacing="0" cellpadding="0" border="0">';
	table += '<tbody>';
	$.each(['FF', 'CC', '99', '66', '33', '00'], function(index1, topvalue) { 
		$.each(['FF', 'CC', '99', '66', '33', '00'], function(index2, midvalue) { 
			table += '<tr>';
			$.each(['FF', 'CC', '99', '66', '33', '00'], function(index3, lowvalue) { 
				thiscolor = '#' + midvalue + '' + lowvalue + '' + topvalue;
				table += '<td bgcolor="' + thiscolor + '">';
// TODO: change to clickable div
				table += '<a style="color:' + thiscolor + '" onclick="newSpotColor(' + spotid + ',\'' + thiscolor + '\')" href="#">XX</a>';
				table += '</td>';
			});
			table += '</tr>';
		});
	});
	table += '</tbody>';
	table += '</table>';
	table += '</div>';
	$('#main').append(table);
}
// testing
function var_dump(element, limit, depth){
	depth =	depth?depth:0;
	limit = limit?limit:1;

	returnString = '<ol>';

	for(property in element){
		//Property domConfig isn't accessable
		if (property != 'domConfig'){
			returnString += '<li><strong>'+ property + '</strong> <small>(' + (typeof element[property]) +')</small>';

			if (typeof element[property] == 'number' || typeof element[property] == 'boolean')
				returnString += ' : <em>' + element[property] + '</em>';
			if (typeof element[property] == 'string' && element[property])
				returnString += ': <div style="background:#C9C9C9;border:1px solid black; overflow:auto;"><code>' +
									element[property].replace(/</g, '&amp;lt;').replace(/>/g, '&amp;gt;') + '</code></div>';

			if ((typeof element[property] == 'object') && (depth < limit))
				returnString += var_dump(element[property], limit, (depth + 1));

			returnString += '</li>';
		}
	}
	returnString += '</ol>';

	return returnString;
}
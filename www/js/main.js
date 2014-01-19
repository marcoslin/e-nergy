var geocoder = null,
	map = null,
	loc = {},
	latlng = null,
	server = "http://172.16.21.70:9000",
	markersArray = [],
	station_details = {},
	markerImage = {
		"private": {
			"green": "/images/GreenMarkerEnergyO.png",
			"red": "/images/GreyMarkerEnergyO.png"
		},
		"public": {
			"green": "/images/RedMarkerEnelO.png",
			"red": "/images/GreyMarkerEnelO.png"
		},
		"unknown": {
			"src": "/images/Unknown.png"
		}
	},
	infowindow = null;
$.ajaxSetup({
	beforeSend: function(xhr) {
		xhr.setRequestHeader("Authorization", "Basic YWRtaW46YWRtaW4=");
		xhr.setRequestHeader("x-baasbox-appcode", "1234567890");
	}
});
maps = {
	init: function() {
		geocoder = new google.maps.Geocoder();
		latlng = new google.maps.LatLng(41.903245, 12.479502);
		maps.drawMap(latlng);
		maps.getLocation();
		$(document).ready(function(){
			
		})
	},
	getLocation: function() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				maps.centerMap(pos);
			}, function(e) {}, {
				timeout: 10000
			});
		} else {}
	},
	centerMap: function(pos) {
		map.setCenter(pos);
	},
	drawMap: function(pos) {
		var mapOptions = {
			zoom: 16,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map(document.getElementById('map'), mapOptions);
		maps.centerMap(pos)
		maps.putPoints();
	},
	setPanorama: function(i) {
		var panorama;
		var place;
		var marker = markersArray[i];
		coords = marker.get("coords");
		place = new google.maps.LatLng(coords[0], coords[1]);
		panorama = map.getStreetView();
		panorama.setPosition(place);
		panorama.setPov({
			heading: 265,
			pitch: 0
		});
		panorama.setVisible(true);
	},
	putPoints: function() {
		google.maps.event.addListenerOnce(map, 'idle', function() {
			$(document).ready(function() {
				$.ajax({
					"url": server + "/document/station_detail",
					"type": "GET",
					"success": function(data) {
						$.each(data.data, function(i, item) {
							station_details[item["cu-code"]] = item;
						});
						$.ajax({
							"url": server + "/document/station",
							"type": "GET",
							"success": function(data) {
								var latlng;
								var lat;
								var lng;
								var state;
								infowindow = new google.maps.InfoWindow();
								$.each(data.data, function(i, item) {
									//for (var i = 0; i < data.data.length; i++) {
									//var item = data.data[i];
									var station_class = "public";
									if (typeof station_details[item["cu-code"]] != "undefined" && station_details[item["cu-code"]]["station_class"] == "private") {
										station_class = "private";
									}
									switch (item["cu-state"]) {
									case "ACTIVE":
										state = markerImage[station_class]["green"];
										break
									case "MAINTENANCE":
										state = markerImage[station_class]["red"];
										break
									case "INSTALLED":
										state = markerImage[station_class]["red"];
										break
									case "PLANNED":
										state = markerImage[station_class]["red"];
										break
									default:
										state = markerImage["unknown"]["src"];
										break
									}
									lat = parseFloat(item["latitudine"]);
									lng = parseFloat(item["longitudine"]);
									latlng = new google.maps.LatLng(lat, lng);
									var marker = new google.maps.Marker({
										map: map,
										position: latlng,
										icon: state,
										animation: google.maps.Animation.DROP
									});
									marker.setValues({
										"id": "marker-" + item["id"],
										"coords": [lat, lng],
										"index": i
									});
									google.maps.event.addListener(marker, 'click', function() {
										if (infowindow) {
											infowindow.close();
										}
										var _streetViewImage = "http://maps.googleapis.com/maps/api/streetview?size=250x50&location=" + item["latitudine"] + "," + item["longitudine"] + "&sensor=false";
										
										var _rates;
										var _notes;
										var _reservation;
										
										
										if(typeof station_details[item["cu-code"]] != "undefined" && typeof station_details[item["cu-code"]]["rates"] != "undefined"){
											_rates = '<div class="gm-basicinfo">'+
													    '<div class="gm-addr"> Parking: '+ station_details[item["cu-code"]]["rates"]["parking"] + '</div>' +
													    '<div class="gm-addr"> Eletricity: '+ station_details[item["cu-code"]]["rates"]["eletricity"] + '</div>' +
													 '</div>';
										}else{
											_rates = '';
										}
										
										if(typeof station_details[item["cu-code"]] != "undefined" && typeof station_details[item["cu-code"]]["note"] != "undefined"){
											_notes = '<div class="gm-basicinfo">'+
													    '<div class="gm-addr"> <b>Note:</b> ' + station_details[item["cu-code"]]["note"] + ' </div>' +
													 '</div>';
										}else{
											_notes = '';
										}
										
										if(typeof station_details[item["cu-code"]] != "undefined" && typeof station_details[item["cu-code"]]["reservation"] != "undefined"){
											_reservation = '<button class="btn btn-xs" disabled="disabled" type="submit">Reserved</button>';
										}else{
											if(station_class == "public"){
												_reservation = '<button class="btn btn-success btn-xs" type="submit">Reserve!</button>';
											}else{
												_reservation = '<div class="btn-group">  <button type="button" class="btn-xs btn btn-primary dropdown-toggle" data-toggle="dropdown">  Duration   <span class="caret"></span>    <span class="sr-only">Toggle Dropdown</span> </button>  <ul class="dropdown-menu" role="menu">    <li><a href="#">1h</a></li>    <li><a href="#">2h</a></li>    <li><a href="#">3h</a></li> <li><a href="#">4h</a></li>  </ul></div>'+
												'<div class="btn-group btn-xs">   <button type="button" class="btn-xs btn btn-primary dropdown-toggle" data-toggle="dropdown">kW  <span class="caret"></span>    <span class="sr-only">Toggle Dropdown</span>  </button>  <ul class="dropdown-menu" role="menu">    <li><a href="#">0.5kW</a></li>    <li><a href="#">1.0kW</a></li>    <li><a href="#">2.0kW</a></li> <li><a href="#">3.0kW</a></li>  </ul></div>'+
												'<button class="btn btn-success btn-xs" type="submit">Reserve!</button>';
											}
										}
										
										var _content = '<div class="energyWindow gm-style-iw">'+
														  '<div class="gm-iw">'+
														     '<div class="gm-title">'+ item["enel-name"] + ' / ' + item["cu-code"] + "</div>" +
														  '</div>'+
														  '<div class="gm-basicinfo">'+
														     '<div class="gm-addr">'+ item["road"] + ", " + item["city"] + ", " + item["post-code"] + '</div>' +
														  '</div>'+
														  _reservation+
														  _rates +
														  _notes +
														  '<div class="gm-photos" style="margin-top:5px;">' +
														     '<div class="gm-wsv" onclick="maps.setPanorama(\'' + i + '\'); return false;">' + 
														        '<img src="' + _streetViewImage + '" width="250" height="50">' +
														     '</div>' + 
														  '</div>' + 
														  '<input type="button"'
														'</div>';
										infowindow = new google.maps.InfoWindow({
											content: _content
										});
										infowindow.open(map, marker);
										$(".dropdown-menu li a").click(function(){
  var selText = $(this).text();
  $(this).parents('.btn-group').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
});
									});
									markersArray.push(marker);
								})
							},
							"error": function(jqXHR, textStatus, errorThrown) {}
						})
					}
				})
			})
		});
	},
	codeAddress: function(a) {
		if (typeof a != "undefined") {
			var address = a;
		} else {
			var address = document.getElementById('address').value;
			var city = document.getElementById('city').value;
			address = address + ", " + city;
		}
		geocoder.geocode({
			'address': address
		}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				map.setCenter(results[0].geometry.location);
				var marker = new google.maps.Marker({
					map: map,
					position: results[0].geometry.location
					//icon: markerImage
				});
			} else {
				//alert('Geocode was not successful for the following reason: ' + status);
			}
		});
	}
}
google.maps.event.addDomListener(window, 'load', maps.init);
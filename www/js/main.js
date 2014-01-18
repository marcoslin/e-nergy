var geocoder;
var map;
var loc = {};
var latlng;
$.ajaxSetup({
	beforeSend: function(xhr) {
		xhr.setRequestHeader("Authorization", "Basic YWRtaW46YWRtaW4=");
		xhr.setRequestHeader("x-baasbox-appcode", "1234567890");
	}
});

maps = {
	init: function() {
		geocoder = new google.maps.Geocoder();
		latlng = new google.maps.LatLng(41.903245,12.479502);
		maps.drawMap(latlng);
		maps.getLocation();
	},
	getLocation: function() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				maps.centerMap(pos);
			}, function(e) {
			}, {
				timeout: 10000
			});
		} else {
		}
	},
	centerMap: function(pos){
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
	putPoints: function() {
		google.maps.event.addListenerOnce(map, 'idle', function() {
			$(document).ready(function() {
				$.ajax({
					"url": "http://172.16.21.14:9000/document/meters",
					"type": "GET",
					"success": function(data) {
						var latlng;
						var lat;
						var lng;
						for (var i = 0; i < data.data.length; i++) {
							lat = parseFloat(data.data[i].latitudine);
							lng = parseFloat(data.data[i].longitudine);
							latlng = new google.maps.LatLng(lat, lng);
							//map.setCenter(latlng);
							var marker = new google.maps.Marker({
								map: map,
								position: latlng
							});
						}
					},
					"error": function(jqXHR, textStatus, errorThrown) {
						console.log(errorThrown);
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
		}
		geocoder.geocode({
			'address': address
		}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				map.setCenter(results[0].geometry.location);
				var marker = new google.maps.Marker({
					map: map,
					position: results[0].geometry.location,
					icon: "http://www.casashare.it/images/maphouseselect.png"
				});
			} else {
				//alert('Geocode was not successful for the following reason: ' + status);
			}
		});
	}
}
google.maps.event.addDomListener(window, 'load', maps.init);
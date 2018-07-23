$(document).ready(initApp);
function initApp() {
    $(".submit").click(userLocation);
}

/***********************Google API calls********************************/
// function getLandingButtonText(){
//     console.log("PDPDFPDPFDFEKJThIS IS THE TEXT");
//     var landingText = $(".landing-page-text").text();
//     console.log("this is the text of the landing page: ", landingText);
//     debugger;
// }
function userLocation() {
    
    resetLocationList();
    var text = $("input").val();
    $.ajax({
        type: 'GET',
        dataType:'JSON',
        url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + text + '&key=AIzaSyAppn1zQQF3qpm3fLCF0kIwUCrLCV54XPg',
        success: function (response) {
            console.log(response);
            var coordinates = {
                lat: response.results[0].geometry.location.lat,
                lng: response.results[0].geometry.location.lng
            }
            climbingLocations(coordinates);
        }
    })
}

function climbingLocations(coordinates) {
    var lat = coordinates.lat;
    var lng = coordinates.lng;

    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: 'https://cors.io/?https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat + ',' + lng + '&radius=30000&keyword=rockclimbing&key=AIzaSyAppn1zQQF3qpm3fLCF0kIwUCrLCV54XPg',
        success: function (response) {
            var climbingLocations = [];
            var climbingInfo=response.results;

            console.log("This is the reponse array: ", response.results);
            for (var i = 0; i < response.results.length; i++) {
                climbingLocations.push(response.results[i].geometry.location);
            }
            initMap(coordinates, climbingLocations);
            displayClimbingInfo(climbingInfo);
            // displayPhotos(photoInfo);

        }
    })
}

function initMap(coordinates, climbingCoordinates) {
    var options = {
        zoom: 11,
        center: coordinates,
        disableDefaultUI: true
    }
    var map = new google.maps.Map(document.getElementById('map-area'), options);
    // directionsDisplay.setMap(map);

    //adds marker to users current position
    var userMarker = new google.maps.Marker({
        position: coordinates,
        map
    })
    
    function callback(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          var place = results[i];
          createMarker(results[i]);
        }
      }
    }
    displayClimbingMarkers(climbingCoordinates, map);
}

function displayClimbingMarkers(markers, map) {
    for (var k = 0; k < markers.length; k++) {
        var climbingMarkers = new google.maps.Marker({
            position: markers[k],
            map
        })
    }
    return climbingMarkers;
}

function displayClimbingInfo(info){
    for(var locationInfo = 0; locationInfo < info.length; locationInfo++){
        var endPoint = info[locationInfo].geometry.location;
        var name = info[locationInfo].name;
        var open = info[locationInfo].opening_hours.open_now;
        var rating = info[locationInfo].rating;
        var address = info[locationInfo].vicinity;
        var divContainer = $("<div>").addClass("list");
        var div = $("<div>").addClass("list-info");
        var h4 = $("<h4>").text(name);
        var span = $("<span>").text(open);
        var h5 = $("<h5>").text(address);
        var directionsBtn = $("<button>",{
            'class': 'get-directions',
            text: 'Directions',
            click: function() {
                console.log("yeahhhh!!! but this doesn't work for me :(", endPoint);
            }
        });
        

        div.append(h4,span,h5, directionsBtn);
        $(divContainer).append(div);
        $(".climbing-list").append(divContainer);

    }
}
function resetLocationList(){
    $(".climbing-list").empty();
}

function directionsToClimbingLocation(origin, destination){
    $.ajax({
        type:'GET',
        dataType: 'json',
        url: 'https://maps.googleapis.com/maps/api/directions/json?origin='+origin+'&destination='+destination+'&key=AIzaSyAppn1zQQF3qpm3fLCF0kIwUCrLCV54XPg'
    })
}

function calcRouteWrapper(origin){

}
  
  function calcRoute(origin ) {
    directionsFlag = true;
    var lat = coordinates.lat;
    var lng = coordinates.lng;
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var origin = new google.maps.LatLng(lat, lng);
    var oceanBeach = new google.maps.LatLng(37.7683909618184, -122.51089453697205);

    var map = new google.maps.Map(document.getElementById('map-area'), mapOptions);
    directionsDisplay.setMap(map);
    var selectedMode = document.getElementById('mode').value;
    var request = {
        origin: origin,
        destination: oceanBeach,
        // Note that Javascript allows us to access the constant
        // using square brackets and a string value as its
        // "property."
        travelMode: google.maps.TravelMode[selectedMode]
    };
    directionsService.route(request, function(response, status) {
      if (status == 'OK') {
        directionsDisplay.setDirections(response);
      }
    });
  }



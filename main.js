$(document).ready(initApp);
function initApp() {
    $(".submit").click(userLocation);
}

/***********************Google API calls********************************/

function userLocation() {
    console.log("userLocation fired");
    var text = $("input").val();
    $.ajax({
        type: 'GET',
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

            console.log("This is the reponse array: ", response.results);
            for (var i = 0; i < response.results.length; i++) {
                climbingLocations.push(response.results[i].geometry.location);
            }
            console.log("these are the climbing locations: ", climbingLocations);
            initMap(coordinates, climbingLocations);

        }
    })
}

function initMap(coordinates, climbingCoordinates) {
    var options = {
        zoom: 11,
        center: coordinates,
        disableDefaultUI: true
    }
    //adds google map to element
    var map = new google.maps.Map(document.getElementById('map-area'), options);
    //adds marker to users current position
    var userMarker = new google.maps.Marker({
        position: coordinates,
        map
    })
    // for (var k = 0; k < climbingCoordinates.length; k++) {
    //     var climbingMarkers = new google.maps.Marker({
    //         position: climbingCoordinates[k],
    //         map
    //     })
    // }
    displayClimbingMarkers(climbingCoordinates, map);
}

function displayClimbingMarkers(markers, map) {
    console.log("this is the markers parameter: ", markers);
    for (var k = 0; k < markers.length; k++) {
        var climbingMarkers = new google.maps.Marker({
            position: markers[k],
            map
        })
    }
    return climbingMarkers;
}
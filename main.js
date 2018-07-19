$(document).ready(initApp);
function initApp(){
    $(".submit").click(userLocation);
}
function userLocation(){
    console.log("userLocation fired");
    var text = $("input").val();
    $.ajax({
        type:'GET',
        url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+text+'&key=AIzaSyAppn1zQQF3qpm3fLCF0kIwUCrLCV54XPg',
        success: function(response){
            console.log(response);
            var coordinates = {
                lat: response.results[0].geometry.location.lat,
                lng: response.results[0].geometry.location.lng
            }
            climbingLocations(coordinates);
            initMap(coordinates);
        }
    })
}
function climbingLocations(coordinates){
    console.log("climbingLocationsNearUserLocation fired");

    var lat = coordinates.lat;
    var lng = coordinates.lng;
    console.log("these are the coordinates for 92703: ", lat,lng);

    $.ajax({
        type:'GET',
        dataType:'json',
        url: 'https://cors.io/?https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+lat+','+lng+'&radius=20000&keyword=rockclimbing&key=AIzaSyAppn1zQQF3qpm3fLCF0kIwUCrLCV54XPg',
        success: function(response){
            console.log(response);
        }
    })
}

function initMap(coordinates){
    console.log("these are the coordinates that are passed through userLocation: ", coordinates);
    var options = {
        zoom:11,
        center: coordinates,
        disableDefaultUI: true
    }
    console.log("this is the options object: ", options);
    var map = new google.maps.Map(document.getElementById('map-area'), options);
}
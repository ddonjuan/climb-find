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
        dataType: 'JSON',
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
            var climbingInfo = response.results;

            console.log("This is the reponse array: ", response.results);
            for (var i = 0; i < response.results.length; i++) {
                climbingLocations.push(response.results[i].geometry.location);
            }
            initMap(coordinates, climbingLocations);
            displayClimbingInfo(climbingInfo, coordinates);
            // displayPhotos(photoInfo);

        }
    })
}

function initMap(coordinates, climbingCoordinates) {
    var options = {
        zoom: 11,
        center: coordinates,
        disableDefaultUI: true,
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

function displayClimbingInfo(info, origin) {
    for (var locationInfo = 0; locationInfo < info.length; locationInfo++) {
        const {name, rating, vicinity, opening_hours, geometry} = info[locationInfo]
        const {lat, lng} = geometry.location;
        var open = null;
        console.log("THIS IS THE OPEN FOR LOCATIONS",opening_hours);
        if(opening_hours === undefined || opening_hours === null){
            span.text("N/A").css("color", "black");
        }

        var nameDisplay = reduceNameLength(name);
        open = opening_hours ? opening_hours.open_now : "N/A";
        var ratingDisplay = rating;
        var divContainer = $("<div>").addClass("list");
        var div = $("<div>").addClass("list-info").attr("data-endpointStart", lat).attr("data-endpointEnd", lng);
        var h4 = $("<h4>").text(nameDisplay);
        var span = $("<span>")
 
        if (open) {
            span.text("Open Now").css("color", "green");
        }
        else {
            span.text("Closed").css("color", "red");
        }
        // var span = $("<span>").text(open);
        var h5 = $("<h5>").text(vicinity);
        var directionsBtn = $("<button>", {
            'class': 'get-directions',
            text: 'Let\'s go climb!'
        });

        div.append(h4, span, h5, directionsBtn);

        $(divContainer).append(div);
        div.on("click", directionsBtn, function () {
            var element = this;
            let start = $(element).attr("data-endpointstart");
            let end = $(element).attr("data-endpointend");
            var endLocation = {
                end,
                start
            };
            console.log("endLocation in dom creation: ", endLocation);
            calcRoute(origin, endLocation);

        })
        $(".climbing-list").append(divContainer);

    }
}
function resetLocationList() {
    $(".climbing-list").empty();
}

function directionsToClimbingLocation(origin, destination) {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: 'https://maps.googleapis.com/maps/api/directions/json?origin=' + origin + '&destination=' + destination + '&key=AIzaSyAppn1zQQF3qpm3fLCF0kIwUCrLCV54XPg'
    })
}

function calcRoute(currentLocation, endLocation) {
    const {lat, lng} = currentLocation;
    const {start, end} = endLocation;

    let directionsService = new google.maps.DirectionsService();
    let directionsDisplay = new google.maps.DirectionsRenderer();

    let origin = new google.maps.LatLng(lat,lng);
    let endPoint = new google.maps.LatLng(start, end);

    let options = {
        zoom: 9,
        center: currentLocation,
        disableDefaultUI: true
    }

    let map = new google.maps.Map(document.getElementById('map-area'), options);

    let request = {
        origin,
        destination: endPoint,
        travelMode: 'DRIVING'
    };
    directionsDisplay.setMap(map);

    directionsService.route(request, function (response, status) {
        if (status == 'OK') {
            directionsDisplay.setDirections(response);
        }
    });
}

function reduceNameLength(name) {
    if(name.includes('-')){
        let positionToCut = name.indexOf('-');
        let newStr = name.substr(0, positionToCut - 1);
        return newStr;
      }
      return name;
}
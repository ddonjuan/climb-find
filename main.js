$(document).ready(initApp);

/*********** INITIALIZING APP AND GLOBALS - START ***********/

// https://jsbin.com/wawezeguju/edit?html,css,output

function initApp() {
    // getLocation();
    // locationsNearUser();
    // locationDetails();
    userDefaultLocation();

    $(".submit").click(function () {
        $(".directions").empty();
        textArr.shift();
        userInputLocation();
    });
    $(".gym-tab").click(showGymInfo);
    $(".directions-tab").click(showDirectionsInfo);
    $(".back").click(backButton);
}
var infoPanelToggle = false;
var submitInfoToggle = false;
var textArr = [];
var saveText = null;



/*********** INITIALIZING APP AND GLOBALS - END ***********/

/***********************GOOGLE API CALLS - START********************************/
function locationsNearUser(userLocation) {
    var myurl = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=rock-climbing&location=92703";

    $.ajax({
        url: myurl,
        headers: {
            'Authorization': 'Bearer rOD-HU7NPXZ34JE9VQwdbOcgD2CcU59b5c9UhFuL4N0eoK97PxhvON13DWbaw6a9H2UwQqPJ4V3R53lKXYyGhR7yEsyfG0uVG6Mhb_6IeeXQ_quaAAEefOh32G1SW3Yx'
        },
        method: 'GET',
        dataType: 'JSON',
        success: function (data) {
            console.log('success: ', data);
        }
    });
}
function locationDetails() {

    var myurl = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/{5tkpswspV1_ibBDpNAqXtw}";

    $.ajax({
        url: myurl,
        headers: {
            'Authorization': 'Bearer rOD-HU7NPXZ34JE9VQwdbOcgD2CcU59b5c9UhFuL4N0eoK97PxhvON13DWbaw6a9H2UwQqPJ4V3R53lKXYyGhR7yEsyfG0uVG6Mhb_6IeeXQ_quaAAEefOh32G1SW3Yx'
        },
        method: 'GET',
        dataType: 'JSON',
        success: function (data) {
            console.log('success buisness details: ', data);
        }
    });

}
function userDefaultLocation() {
    var currentLocation;
    $.ajax({
        type: 'POST',
        dataType: 'JSON',
        url: 'https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyAGQuS3YmAZpYvRguVUHYUSSwExvQqM-Ss',
        success: function (response) {
            let userCoords;
            console.log("THIS IS THE RESPONSE IN GEOLOCATION: ", response.location);
            userCoords = response.location;
            console.log("THIS IS THE USER LOCATION: ", userCoords);
            currentLocation = userCoords.lat + ',' + userCoords.lng;
            saveText = currentLocation;

        }
    })
}

function userInputLocation() {

    resetLocationList();
    maintainLocation();

    var text = $("input").val() ? $("input").val() : saveText;

    textArr.push(text);
    $("input").val("");

    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + text + '&key=AIzaSyAGQuS3YmAZpYvRguVUHYUSSwExvQqM-Ss',
        success: function (response) {
            console.log("This should be my coordinates", response);
            var coordinates = {
                lat: response.results[0].geometry.location.lat,
                lng: response.results[0].geometry.location.lng
            }
            climbingLocations(coordinates);
        }
    });
}

function climbingLocations(userCoordinates) {
    var lat = userCoordinates.lat;
    var lng = userCoordinates.lng;

    var myurl = 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=rock-climbing&latitude=' + lat + '&longitude=' + lng;

    $.ajax({
        url: myurl,
        headers: {
            'Authorization': 'Bearer rOD-HU7NPXZ34JE9VQwdbOcgD2CcU59b5c9UhFuL4N0eoK97PxhvON13DWbaw6a9H2UwQqPJ4V3R53lKXYyGhR7yEsyfG0uVG6Mhb_6IeeXQ_quaAAEefOh32G1SW3Yx'
        },
        method: 'GET',
        dataType: 'JSON',
        success: function (response) {
            var climbingLocations = [];
            var locationInfo = response.businesses;
            console.log('success for YELP CALL: ', response);
            for (var locationDetails = 0; locationDetails < locationInfo.length; locationDetails++) {
                climbingLocations.push({ 'lat': locationInfo[locationDetails].coordinates.latitude, 'lng': locationInfo[locationDetails].coordinates.longitude });
            }
            //    console.log(climbingLocations, ": THESE ARE THE COORDINATES");
            initMap(userCoordinates, climbingLocations);
            displayClimbingList(locationInfo, userCoordinates);


        }
    });

    // $.ajax({
    //     type: 'GET',
    //     dataType: 'json',
    //     url: 'https://cors.io/?https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat + ',' + lng + '&radius=10000&keyword=rockclimbing&key=AIzaSyAGQuS3YmAZpYvRguVUHYUSSwExvQqM-Ss',
    //     success: function (response) {
    //         var climbingLocations = [];
    //         var climbingInfo = response.results;
    //         console.log("response: ", response);

    //         console.log("This is the reponse array: ", response.results);
    //         for (var i = 0; i < response.results.length; i++) {
    //             climbingLocations.push(response.results[i].geometry.location);
    //         }
    //         console.log("THESE ARE GOOGLE CLIMBING LOCATIONS: ", climbingLocations);
    //         initMap(coordinates, climbingLocations);
    //         displayClimbingList(climbingInfo, coordinates);
    //         dipslayLocationInfoTab(climbingInfo);

    //     }
    // })
}

function initMap(coordinates, climbingLocations) {
    var options = {
        zoom: 11.6,
        center: coordinates,
        disableDefaultUI: true,
        styles: mapStyle
    }
    var map = new google.maps.Map(document.getElementById('map-area'), options);

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
    displayClimbingMarkers(climbingLocations, map);
}

function calcRoute(currentLocation, endLocation) {
    const { lat, lng } = currentLocation;
    const { start, end } = endLocation;

    console.log("THESE ARE THE COORDINATES FOR START AND END DESTINATION: ", currentLocation, endLocation);

    directionsToClimbingLocation(currentLocation, endLocation);

    let directionsService = new google.maps.DirectionsService();
    let directionsDisplay = new google.maps.DirectionsRenderer();

    let origin = new google.maps.LatLng(lat, lng);
    let endPoint = new google.maps.LatLng(start, end);

    let options = {
        zoom: 9,
        center: currentLocation,
        disableDefaultUI: true,
        styles: mapStyle
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

function directionsToClimbingLocation(origin, destination) {
    const { lat, lng } = origin;
    const { start, end } = destination;
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: 'https://cors.io/?https://maps.googleapis.com/maps/api/directions/json?origin=' + lat + ',' + lng + '&destination=' + start + ',' + end + '&key=AIzaSyAGQuS3YmAZpYvRguVUHYUSSwExvQqM-Ss',
        success: function (response) {
            console.log("THIS IS THE RESPONSE FOR DRIVING INSTRUCTIONS: ", response);
            let directions = response.routes[0].legs[0];
            displayDirectionsInfo(directions);
        }
    })
}

/***********************GOOGLE API CALLS - END********************************/

/*********** DISPLAYING MARKERS, INFO, AND EDITING INFO - START ***********/

function displayClimbingMarkers(markers, map) {
    var image = {
        url: 'images/mission.png',
        size: new google.maps.Size(32, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 32)
    }
    for (var k = 0; k < markers.length; k++) {
        var climbingMarkers = new google.maps.Marker({
            position: markers[k],
            map,
            icon: image,
            animation: google.maps.Animation.DROP
        })
    }
    return climbingMarkers;
}
function displayClimbingList(info, origin) {
    console.log("THIS IS INFO: FROM YELP: ", info)
    for (var locationInfo = 0; locationInfo < info.length; locationInfo++) {
        const { name, rating, location, is_closed, coordinates, id, image_url } = info[locationInfo]
        const { latitude, longitude } = coordinates;
        var open = null;
        if (is_closed === undefined || is_closed === null) {
            span.text("N/A").css("color", "orange");
        }

        var nameDisplay = reduceNameLength(name);
        open = is_closed ? is_closed.open_now : "N/A";
        var ratingDisplay = rating;
        var divContainer = $("<div>").addClass("list");
        var div = $("<div>").addClass("list-info");
        var h4 = $("<h4>").text(nameDisplay).addClass("location-name");
        var span = $("<div>").addClass("is-closed");
        var pic = image_url ? image_url : 'images/image_not_found.png'
        var image = $("<img>").attr("src", pic).addClass("location-image");

        if (open) {
            span.text("Open Now").css("color", "green");
        }
        else {
            span.text("Closed").css("color", "red");
        }

        var h5Address = $("<h5>").text(`${location.address1} ${location.city}, ${location.state}, ${location.zip_code}`);
        var directionsBtn = $("<button>", {
            'class': 'get-directions',
            text: 'Let\'s go climb!'
        }).attr("data-endpointStart", latitude).attr("data-endpointEnd", longitude).attr("data-id", id);

        div.append(image, h4, h5Address, directionsBtn, span);

        $(divContainer).append(div);
        directionsBtn.on("click", directionsBtn, function () {
            listInfoAndDirectionsInfoToggle();
            var element = this;
            let start = $(element).attr("data-endpointstart");
            let end = $(element).attr("data-endpointend");
            let id = $(element).attr("data-id");
            var endLocation = {
                start,
                end
            };
            console.log("endLocation in dom creation: ", endLocation);
            calcRoute(origin, endLocation);

        })
        $(".climbing-list").append(divContainer);

    }
}

function reduceNameLength(name) {
    if (name.includes('-') && name.length > 30) {
        let positionToCut = name.indexOf('-');
        let newStr = name.substr(0, positionToCut - 1);
        return newStr;
    }
    if (name.length > 36) {
        let positionToCut = name.substr(0, 33);
        positionToCut += "...";
        return positionToCut;
    }
    return name;
}
function displayDirectionsInfo(directions) {
    var startAddress = $("<div>").addClass("start-location");
    var startAddressText = $("<h4>").addClass("a").text("Start: " + directions.start_address);
    startAddress.append(startAddressText);

    var listContainer = $("<div>").addClass("list-container");
    $(".directions").append(startAddress);

    for (var steps = 0; steps < directions.steps.length; steps++) {
        var stepsList = $("<div>").addClass("directions-list").append(directions.steps[steps].html_instructions);
        listContainer.append(stepsList);
    }
    $(".directions").append(listContainer);

    var endAddress = $("<div>").addClass("end-location");
    var endAddressText = $("<h4>").addClass("a").text(directions.end_address);
    endAddress.append(endAddressText);
    $(".directions").append(endAddress);

}
function dipslayLocationInfoTab(locationInfo) {
    console.log(locationInfo, "THIS IS THE CLIMBING INFO!!");
}

/*********** DISPLAYING MARKERS, INFO, AND EDITING INFO - END ***********/


/***********SAVING USER INPUT AND TOGGLING CLASSES - START***********/

function maintainLocation() {
    if (infoPanelToggle) {
        if (submitInfoToggle) {
            saveText = textArr[0];
        }
        listInfoAndDirectionsInfoToggle();
        infoPanelToggle = false;
    }
}

function resetLocationList() {
    $(".climbing-list").empty();
}

function listInfoAndDirectionsInfoToggle() {
    infoPanelToggle = true;
    $(".driving-directions, .climbing-list").toggleClass("hidden");
}

function showGymInfo() {
    $(".info").removeClass("hidden");
    $(".gym-tab").addClass("tabClicked");
    $(".directions").addClass("hidden");
    $(".directions-tab").removeClass("tabClicked");
}

function showDirectionsInfo() {
    $(".directions").removeClass("hidden");
    $(".directions-tab").addClass("tabClicked");
    $(".info").addClass("hidden");
    $(".gym-tab").removeClass("tabClicked");
}

function backButton() {
    submitInfoToggle = true;
    $(".directions").empty();
    userInputLocation()
    textArr.shift();
}


/***********SAVING USER INPUT AND TOGGLING CLASSES - END***********/

var mapStyle = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ebe3cd"
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#523735"
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#f5f1e6"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#c9b2a6"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#dcd2be"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ae9e90"
            }
        ]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#93817c"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#a5b076"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#447530"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f1e6"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#fdfcf8"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f8c967"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#e9bc62"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e98d58"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#db8555"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#806b63"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#8f7d77"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#ebe3cd"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#b9d3c2"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#92998d"
            }
        ]
    }
];


$(document).ready(initApp);

/*********** INITIALIZING APP AND GLOBALS - START ***********/

// https://jsbin.com/wawezeguju/edit?html,css,output

function initApp() {
    userDefaultLocation();
    $(".submit-index").click(landingPage);
    $(".submit").click(function () {
        if(landingPageUserLocation){
            textArr.shift();
            userDefaultLocation();
            landingPageUserLocation = false;
        }
        $(".directions").empty();
        $(".info").empty();
        textArr.shift();
        userInputLocation();
    });
    $(".gym-tab").click(showGymInfo);
    $(".directions-tab").click(showDirectionsInfo);
    $(".back").click(backButton);
    $(".close-btn, .confirm-btn").click(function(){
        $(".modal-container").addClass("hidden");
        $(".main-input").attr("placeholder", "Current Location");
        $(".landing-page-text").attr("placeholder", "Current Location");
        saveText = null;
        $("#map-area").empty();
        userDefaultLocation();
    })
}
var infoPanelToggle = false;
var submitInfoToggle = false;
var textArr = [];
var saveText = null;
var landingPageUserLocation = false;



/*********** INITIALIZING APP AND GLOBALS - END ***********/

/***********************API CALLS - START********************************/

function userDefaultLocation() {
    var currentLocation;
    $.ajax({
        type: 'POST',
        dataType: 'JSON',
        url: 'https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyAGQuS3YmAZpYvRguVUHYUSSwExvQqM-Ss',
        success: function (response) {

            let userCoords;
            userCoords = response.location;
            currentLocation = userCoords.lat + ',' + userCoords.lng;
            saveText = currentLocation;
        }
    })
}

function userInputLocation() {
    resetLocationList();
    maintainLocation();

    var text = $(".main-input").val() ? $(".main-input").val() : saveText;
    textArr.push(text);
    $("input").val("");
    textPlaceholder();
    $(".loader-container").removeClass("hidden");

    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + text + '&key=AIzaSyAGQuS3YmAZpYvRguVUHYUSSwExvQqM-Ss',
        success: function (response) {
            if(response.status === 'ZERO_RESULTS'){
                $(".loader-container").addClass("hidden");
                $(".modal-container").removeClass("hidden");
                $(".cover-page-container").removeClass("hidden");
                $(".main-container").addClass("hidden");
            }
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
            for (var locationDetails = 0; locationDetails < locationInfo.length; locationDetails++) {
                climbingLocations.push({ 'lat': locationInfo[locationDetails].coordinates.latitude, 'lng': locationInfo[locationDetails].coordinates.longitude });
            }
            initMap(userCoordinates, climbingLocations);
            displayClimbingList(locationInfo, userCoordinates);
            setTimeout(function(){$(".loader-container").addClass("hidden")}, 1000);
        }
    });

}

function initMap(coordinates, climbingLocations) {
    let image = {
        url: 'images/user.png',
        size: new google.maps.Size(32, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 32)
    }
    var options = {
        zoom: 11.1,
        center: coordinates,
        disableDefaultUI: true,
        styles: mapStyle
    }
    var map = new google.maps.Map(document.getElementById('map-area'), options);

    //adds marker to users current position
    var userMarker = new google.maps.Marker({
        position: coordinates,
        icon: image,
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
function climbingLocationDetails(id) {
    var myurl = 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/' + id;
    $.ajax({
        url: myurl,
        headers: {
            'Authorization': 'Bearer rOD-HU7NPXZ34JE9VQwdbOcgD2CcU59b5c9UhFuL4N0eoK97PxhvON13DWbaw6a9H2UwQqPJ4V3R53lKXYyGhR7yEsyfG0uVG6Mhb_6IeeXQ_quaAAEefOh32G1SW3Yx'
        },
        method: 'GET',
        dataType: 'JSON',
        success: function (response) {
            displayInfoTab(response);
        }
    });

}

function calcRoute(currentLocation, endLocation) {
    const { lat, lng } = currentLocation;
    const { start, end } = endLocation;

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
            let directions = response.routes[0].legs[0];
            displayDirectionsInfo(directions);
        }
    })
}

/***********************GOOGLE API CALLS - END********************************/

/*********** DISPLAYING MARKERS, INFO, AND EDITING INFO - START ***********/

function landingPage() {
    $(".cover-page-container").addClass("hidden");
    $(".main-container").removeClass("hidden");
    var landingPageText = $(".landing-page-text").val();

    if(landingPageText.length === 0){
        userInputLocation();
        $(".main-input").attr("placeholder", "Current Location");
        return;
    }
    saveText = landingPageText;
    landingPageUserLocation = true;
    userInputLocation();

}

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
            $(".loader-container").removeClass("hidden");
            showGymInfo();
            listInfoAndDirectionsInfoToggle();
            var element = this;
            let start = $(element).attr("data-endpointstart");
            let end = $(element).attr("data-endpointend");
            let id = $(element).attr("data-id");
            var endLocation = {
                start,
                end
            };
            calcRoute(origin, endLocation);
            climbingLocationDetails(id, open);

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

function displayInfoTab(info, open) {
    let nameH2 = $("<h2>").text(info.name);
    let image = $("<img>").attr("src", info.photos[1]).addClass("location-pic");
    let locationDetails = $("<div>").addClass("location-details");
    let isOpen = $("<div>").addClass("is-closed").text(open);

    let todaysNumber = getTodaysDate();

    let getMilitaryHours = info.hours[0].open[todaysNumber];
    let businessHours = getMilitaryHours ? hoursOfOperation(getMilitaryHours.start, getMilitaryHours.end) : "N/A";
    let hours = $("<div>").addClass("hours").text("Hours of Operation: " + businessHours);

    let address = $("<div>").addClass("address").text(info.location.display_address);

    let ratingImg = displayYelpStarReviews(info.rating);
    let rating = $("<img>").addClass("rating").attr("src", ratingImg);

    let phone = $("<div>").addClass("phone").text(info.display_phone);

    locationDetails.append(hours, address, rating, phone);
    $(".info").append(nameH2, image, locationDetails);
    setTimeout(function(){$(".loader-container").addClass("hidden")}, 1000);

}

function displayDirectionsInfo(directions) {
    var startAddress = $("<div>").addClass("start-location");
    var startAddressText = $("<h4>").addClass("a").text("A: " + directions.start_address);
    startAddress.append(startAddressText);

    var listContainer = $("<div>").addClass("list-container");
    $(".directions").append(startAddress);

    for (var steps = 0; steps < directions.steps.length; steps++) {
        var stepsList = $("<div>").addClass("directions-list").append(directions.steps[steps].html_instructions);
        listContainer.append(stepsList);
    }
    $(".directions").append(listContainer);

    var endAddress = $("<div>").addClass("end-location");
    var endAddressText = $("<h4>").addClass("a").text("B: "+directions.end_address);
    endAddress.append(endAddressText);
    $(".directions").append(endAddress);
    // setTimeout(function(){$(".loader-container").addClass("hidden")}, 1000);
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

function hoursOfOperation(num1, num2) {
    var hoursArr = [num1, num2];
    var identifier;
    var standardTime = [];
    for (var hoursNum = 0; hoursNum < hoursArr.length; hoursNum++) {
        if (hoursArr[hoursNum] === "0000") {
            identifier = "AM";
            let midnight = "12AM";
            standardTime.push(midnight);
        }
        let parseMe = hoursArr[hoursNum];
        var militaryTime = parseInt(parseMe);
        if (militaryTime >= 1300) {
            identifier = "PM";
            militaryTime -= 1200;
            let end = convertNumToStandardTime(militaryTime) + identifier;
            standardTime.push(end);
        }
        identifier = "AM";
        let start = convertNumToStandardTime(militaryTime) + identifier;
        standardTime.push(start);
    }
    return standardTime[0] + " - " + standardTime[1];
}

function convertNumToStandardTime(militaryTime) {
    militaryTime += "";
    let numArr = militaryTime.split("");
    numArr.splice(militaryTime.length - 2, militaryTime.length);
    let newNum = numArr.join("");
    return newNum;
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
    $(".gym-tab").css("background-color", "rgba(0,0,0,0)");
    $(".directions").addClass("hidden");
    $(".directions-tab").css("background-color", "");
}

function showDirectionsInfo() {
    $(".directions").removeClass("hidden");
    $(".directions-tab").css("background-color", "rgba(0,0,0,0)");
    $(".info").addClass("hidden");
    $(".gym-tab").css("background-color", "");
}

function backButton() {
    submitInfoToggle = true;
    $(".directions").empty();
    $(".info").empty();
    userDefaultLocation();
    userInputLocation()
    textArr.shift();
}
function textPlaceholder() {
    if(textArr[0].length >= 30){
        $("input").attr("placeholder", "Current Location");
        return;
    }
    $("input").attr("placeholder", textArr[0]);

}

function getTodaysDate() {
    let date = new Date();
    let today = date.getDay();
    return today;
}

function displayYelpStarReviews(rating) {
    switch (rating) {
        case 1:
            return 'images/yelp-review-images/regular_1.png';
        case 1.5:
            return 'images/yelp-review-images/regular_1_half.png';
        case 2:
            return 'images/yelp-review-images/regular_2.png';
        case 2.5:
            return 'images/yelp-review-images/regular_2_half.png';
        case 3:
            return 'images/yelp-review-images/regular_3.png';
        case 3.5:
            return 'images/yelp-review-images/regular_3_half.png';
        case 4:
            return 'images/yelp-review-images/regular_4.png';
        case 4.5:
            return 'images/yelp-review-images/regular_4_half.png';
        case 5:
            return 'images/yelp-review-images/regular_5.png';
        default:
            return 'images/yelp-review-images/regular_0.png';

    }
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


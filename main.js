$(document).ready(initApp);

function initApp(){
    $(".submit").click(testing);
}
function testing(){
    console.log("testing function fired");
    var text = $("input").val();
    $(".map-area").append(text);
}
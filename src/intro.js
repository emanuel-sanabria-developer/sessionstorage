// define sessionStorage only if not present (old browser)
if(typeof sessionStorage === "undefined")(function(window){

// this script could have been included via iframe so we would like to use the top context as storage area
// but if the iframe is not part of the domain below check could generate an error
var // the top pointer is used in any case to point to the top context level
    top = window
;
try {
    while(top !== top.top)
        top = top.top;
} catch(e) {
};
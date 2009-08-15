// define sessionStorage only if not present (old browser)
if(typeof sessionStorage === "undefined")(function(window){

// this script could have been included via iframe so we would like to use the top context sessionStorage
// but if the iframe is not part of the domain below check could generate an error
var top = window;
try{while(top !== top.top)top = top.top;}catch(e){};

// if the parent included this script as well ...
if(typeof top.sessionStorage !== "undefined")
    // this script is useless but this context would like to use the top level sessionStorage
    window.sessionStorage = top.sessionStorage;
else {
    // let's create the sessionStorage
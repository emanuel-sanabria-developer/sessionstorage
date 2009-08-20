/** HTML5 sessionStorage cross-browser implementation
 * @description     sessionStorage object is an HTML5 working draft
 *                  which aim is to remove cookie limits.
 *                  Using a sort of "de-facto" standard as window.name
 *                  behavior is, it is possible to implement the
 *                  sessionStorage object in old browsers.
 *                  The concept is that window.name persists in the tab,
 *                  whatever page we are surfing, while as security measure
 *                  I combined browser cookie management plus RC4 stream cipher
 *                  in order to reduce security problems as much as possible.
 *
 * @author          Andrea Giammarchi
 * @license         Mit Style License
 * @blog            http://webreflection.blogspot.com/
 * @version         1.4
 * @compatibility   Android, Chrome, Explorer, Opera, unobtrusive for other browsers
 * @credits         W3 WebStorage Draft     http://dev.w3.org/html5/webstorage/
 *                  RC4 Stream Cipher       http://www.wisdom.weizmann.ac.il/~itsik/RC4/rc4.html
 * @protocol        Linear String Storage, by the @author
 */
 
// well, there is no other way to understand if onload
// event will be fired before onload event itself
if(Object.prototype.toString.call(window.opera) === "[object Opera]"){

    // Opera does not support the unload event
    // at least we can force it to support the onload one ...
    history.navigationMode="compatible";

    // Opera performs escape/unescape truly slowly
    // lets change LSS proto for this scope if the browser is opera
    LSS.prototype.escape = window.encodeURIComponent;
    LSS.prototype.unescape = window.decodeURIComponent;
};

// sessionStorage is a Singleton instance: http://en.wikipedia.org/wiki/Singleton_pattern
// Below constructor should never be reached outside this closure.
function sessionStorage(){
    // in-scope callback, will hopefully disappear
    // as soon as the sessionStorage will be created
    // 'cause it is kinda useless outside
    // the purpose: set the secret key
    // create the LSS instance mark the window name init point
    function clear(){
        // the cookie with the unique generated key
        document.cookie = [
            "sessionStorage=" + window.encodeURIComponent($key = RC4.key(128))
        ].join(';');
        // set the encrypted prefix to use for each soterd key
        domain = RC4.encode($key, domain);
        // the LSS object to use in the entire scope
        LSS = new LSS(top, "name", top.name);
    };
    var // get the window.name resolved string
        name = top.name,
        // shortcut for the document
        document = top.document,
        // regexp to test the domain cookie
        cookie = /\bsessionStorage\b=([^;]+)(;|$)/,
        // check if cookie was setted before during this session
        data = cookie.exec(document.cookie),
        // internal variable
        i
    ;
    // if data is not null ...
    if(data){
        // retrieve the $key to use via the RC4.decode method
        $key = window.decodeURIComponent(data[1]);
        // set the encrypted prefix to use for each soterd key
        domain = RC4.encode($key, domain);
        // create the LSS object without a predefined length
        LSS = new LSS(top, "name");
        // loop over each key in order to assign the correct for this instance, if any ...
        for(var key = LSS.key(), i = 0, length = key.length, $cache = {}; i < length; ++i){
            if((data = key[i]).indexOf(domain) === 0){
                // cache is an internal array used to quickly retrieve keys
                cache.push(data);
                $cache[data] = LSS.get(data);
                // the LSS is not efficient as is
                // everything should be removed and later re-appended
                LSS.del(data);
            };
        };
        // the optimized LSS with a start point and available clear operation
        LSS = new LSS.constructor(top, "name", top.name);
        // the length of this session
        if(0 < (this.length = cache.length)){
            // now it is possible to re-append data
            // to make things faster let's use some LSS property
            for(i = 0, length = cache.length, c = LSS.c, data = []; i < length; ++i)
                // this is a fast way to emulate LSS.set method
                data[i] = c.concat(LSS._c, LSS.escape(key = cache[i]), c, c, (key = LSS.escape($cache[key])).length, c, key);
            top.name += data.join("");
        };
    } else {
        // it is the first time user is in this page
        clear();
        // if sessionStorage cookie is not present ...
        if(!cookie.exec(document.cookie))
            // clear the cache, this sessionStorage is not usable!
            cache = null;
    };
};

// sessionStorage Sinngleton prototype
sessionStorage.prototype = {

    // lenght should be a read only property
    // it contains lenght of every key present in this object
    length:0,

    // accordingly with W3, this method
    // accepts an integer less than this.length
    // in order to obtain associated key for that length
    // please note order is browser dependent but there is
    // consistency for the related key as specs say
    /** @example
     *  if(sessionStorage.length > 0)
     *      alert(
     *          sessionStorage.getItem(sessionStorage.key(0));
     *          // it should alert the most old value set in sessionStorage
     *      );
     */
    key:function(index){
        // if index is not an unsigned one less than cache.length ...
        if(typeof index !== "number" || index < 0 || cache.length <= index)
            // throw an error as every compatible browser do
            throw "Invalid argument";
        return cache[index];
    },

    // this method gives back a string, or null,
    // if used key has never been set
    /** @example
     *  if(sessionStorage.getItem("myStuff") === null)
     *      sessionStorage.setItem("myStuff", "toldya it's my stuff!");
     *  alert(sessionStorage.getItem("myStuff"));
     *  // toldya it's my stuff!
     */
    getItem:function(key){
        // the used key is internally composed
        // by the encrypted domain prefix plus the user key
        key = domain + key;
        // there is a page session included in the package
        // basically if we retrieve a key once, performanes
        // will be affected only the first time.
        // This means that if we save entire libraries
        // we will not save a lot of time (libaries are evaluated once)
        // but if we use sessionStorage for form data, as example,
        // we can retrieve it back again in a bit
        if(hasOwnProperty.call($cache, key))
            return $cache[key];
        // non cached keys are computated runtime
        var data = LSS.get(key);
        if(data !== null)
            // data is cached for next execution
            data = $cache[key] = RC4.decode($key, data);
        return data;
    },

    // this method save in the sessionStorage
    // a generic key/vaklue pair
    // please remember that specs say both key and value
    // should be strings, otherwise these are converted into strings
    /** @example
     *  sessionStorage.setItem("myObj", {a:"b"});
     *  alert(sessionStorage.getItem("myObj"));
     *  // [object Object] but it will be exactly the string "[object Object]"
     *  // and NOT the original object
     */
    setItem:function(key, data){
        // delete the key
        this.removeItem(key);
        // set the correct key
        key = domain + key;
        // append the new key/value pair and speed up getItem for this key
        LSS.set(key, RC4.encode($key, $cache[key] = "" + data));
        // set right length
        this.length = cache.push(key);
    },

    // this method remove from the sessionStorage
    // a generic key/vaklue pair, and only if it is present.
    /** @example
     *  sessionStorage.setItem("myName", "Andrea Giammarchi");
     *  sessionStorage.getItem("myName"); // Andrea Giammarchi
     *  sessionStorage.removeItem("myName");
     *  sessionStorage.getItem("myName"); // null
     */
    removeItem:function(key){
        var data = LSS.get(key = domain + key);
        if(data !== null){
            // only if it was present ...
            delete $cache[key];
            LSS.del(key);
            // set right length
            this.length = cache.remove(key);
        };
    },

    // this method clear everything has been stored in this object.
    /** @example
     *  sessionStorage.setItem("myName", "Andrea Giammarchi");
     *  sessionStorage.setItem("age", 31);
     *  sessionStorage.clear();
     *  sessionStorage.getItem("myName"); // null
     *  sessionStorage.getItem("age");    // null
     */
    clear:function(){
        LSS.clear();
        $cache = {};
        cache.length = 0;
    }
};

// private scope variables
var
    // the prefix to use to enable multiple domains
    domain = top.document.domain,

    // Array with all set keys
    cache = [],

    // object used as cache for already set or retrieved keys
    $cache = {}, hasOwnProperty = $cache.hasOwnProperty,

    // $key used via RC4 encode/decode procedure
    $key
;

// this should be part of ES5 specs in a better
// fully indexOf compatible way, imho
cache.remove = function(data){
    var i = this.indexOf(data);
    if(-1 < i)
        this.splice(i, 1);
    return this.length;
};

// for those browser without it ... 
if(!cache.indexOf) cache.indexOf = function(data){
        for(var i = 0, length = this.length; i < length; ++i){
            if(this[i] === data)
                return i;
        };
        return -1;
    };

// if there is a top sessionStorage it does not make sense
// to re-apply the constructor for the same storage (aka: window.name)
if(top.sessionStorage){
    // let's clone the top object
    sessionStorage = function(){};
    sessionStorage.prototype = top.sessionStorage;
};
// in any case it's time to create the sessionStorage for this context
sessionStorage = new sessionStorage;

// create the global reference only if it is usable
if(cache !== null)
    // be sure both top context and this context (could be the same) point to the same object
    window.sessionStorage = sessionStorage;
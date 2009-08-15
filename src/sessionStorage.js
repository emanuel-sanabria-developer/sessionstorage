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
 * @version         1.1
 * @compatibility   Internet Explorer, Chrome, Opera (unobtrusive for others)
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
    // the purpose: set the secret key, clear the window name
    // create the LSS instance setting used name
    function clear(){
        // the cookie with the unique generated key
        document.cookie = [
            "sessionStorage=" + escape($key = RC4.key(128))
        ].join(';');
        // the clean window.name with encrypted domain
        window.name = escape(RC4.encode($key, document.domain));
        // the LSS object to use in the entire scope
        LSS = new LSS(window, "name", window.name);
    };
    var // shortcut for the special char used by the LSS
        c = LSS.prototype.c,
        // get the window.name resolved string
        name = window.name,
        // shortcut for the document
        document = window.document,
        // regexp to test the domain cookie
        cookie = /\bsessionStorage\b=([^;]+)(;|$)/,
        // a RegExp able to understand in a shot the Linear String Storage Protocol
        // re = new RegExp(c.concat("([^", c, "]*)", c, "(\\d+)", c, "([^", c, "]*)"), "g"),
        // check if cookie was setted before during this session
        data = cookie.exec(document.cookie),
        // the constructor escape function to use
        // to set the cookie avoid problems
        // and to set up the window.name if necessary
        escape = window.encodeURIComponent,
        // internal variables
        domain, length, i, l
    ;
    // if data is not null ...
    if(data){
        // retrieve the $key to use via the RC4.decode method
        $key = window.decodeURIComponent(data[1]);
        // verify that window.name has not been used by another domain
        // if window.name does NOT start with the encrypted domain, via cookie key ...
        if((domain = name.slice(0, -1 < (i = name.indexOf(c)) ? i : name.length)) !== escape(RC4.encode($key, document.domain)))
            // get rid of it (memory safe)
            name = clear();
        else{
            // the LSS object with the domain string as clear option
            LSS = new LSS(window, "name", domain);

            /** actually too slow with big strings
            while(data = re.exec(name))
                cache.push(LSS.unescape(data[1]));
            */

            // populate keys in order to make sessionStorage standard (5 times faster than RegExp version)
            i = l = 0;
            while(-1 < (i = name.indexOf(c, i))){
                // cache is a private scope Array which contains set keys
                cache[l++] = LSS.unescape(name.substring(++i, length = name.indexOf(c, i)));
                i = 1 * name.substring(++length, name.indexOf(c, length)) + length + 2;
            };

            this.length = cache.length;
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
        var data = LSS.get("" + key);
        if(data !== null)
            // nd cached for next execution
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
        this.removeItem(key = "" + key);
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
        var data = LSS.get(key = "" + key);
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
        cache.length = 0;
    }
};

// private scope variables
var
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

// it's about the time to create the sessionStorage object, isn't it?
sessionStorage = new sessionStorage;

// create the global reference only if it is usable
if(cache !== null)
    window.sessionStorage = sessionStorage;
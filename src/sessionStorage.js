/** HTML5 sessionStorage cross-browser implementation
 * @description     sessionStorage object is an HTML5 working draft
 *                  which aim is to remove cookie limits.
 *                  Using a sort of "de-facto" standard as window.name
 *                  behavior is, it is possible to implement the
 *                  sessionStorage object in old browser.
 *                  The concept is that window.name persists in the tab,
 *                  whatever page we are surfing, while as security measure
 *                  I combined browser cookie management plus RC4 stream cipher
 *                  in order to reduce security problems as much as possible.
 *
 * @author          Andrea Giammarchi
 * @license         Mit Style License
 * @blog            http://webreflection.blogspot.com/
 * @version         1.0
 * @compatibility   Internet Explorer, Chrome, Opera (unobtrusive for others)
 * @credits         W3 WebStorage Draft     http://dev.w3.org/html5/webstorage/
 *                  RC4 Stream Cipher       http://www.wisdom.weizmann.ac.il/~itsik/RC4/rc4.html
 */

// check if sessionStorage is already defined
if(typeof sessionStorage === "undefined")(function(window){

    // window is wrapped to avoid a redefined scope
    
    // sessionStorage is a Singleton instance: http://en.wikipedia.org/wiki/Singleton_pattern
    // Below constructor should never be reached outside this closure.
    function sessionStorage(){
        var // get the window.name resolved string
            name = window.name,
            // check if cookie was setted before during this session
            data = cookie.exec(document.cookie)
        ;
        // if data is not null ...
        if(data){
            // retrieve the $key to use via the RC4.decode method
            $key = unescape(data[1]);
            
            // populate keys in order to make sessionStorage standard
            while(data = re.exec(name))
                // cache is a private scope Array which contains set keys
                cache.push(data[1]);
            // length is a read only property which respect set keys
            this.length = cache.length;
        } else {
            // it is the first time user is in this page
            // let's define the 128 bit key for RC4 encode/decode
            // and trust browser cookie management
            document.cookie = [
                "sessionStorage=" + escape($key = RC4.key(128))
            ].join(';');
            
            // if it is the first time, window.name must be empty
            window.name = "";
            
            // if above cookie is not present ...
            if(!cookie.exec(document.cookie))
                // set this instance as NOT ENABLED
                // this should not affect W3 draft since the check is over
                // disabed property
                this.disabled = true;
        };
    };

    // sessionStorage Sinngleton prototype
    sessionStorage.prototype = {
        // the only NOT STANDARD property
        // it is useful to check whenever we need:
        // if(!sessionStorage.disabled)
        //      alert("Get Out From Jurassic Park!");
        disabled:false,
        
        // lenght should be a read only property
        // it contains lenght of every key present in this object
        length:0,
        
        // avvordingly with W3, this method
        // accept an integer less than this.length
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
            var data = cache[index];
            // if cache has not such index ...
            if(data === undefined)
                // throw an error as every compatible browser
                throw "Invalid argument";
            return data;
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
            // we can retrieve back again in a bit
            if(hasOwnProperty.call($cache, key))return $cache[key];
            
            // non cached keys are computated runtime
            var name = window.name,
                // find the key in the window.name property
                i = name.indexOf(key = c + escape(key) + c),
                // set default returned value
                data = null
            ;
            
            // if we found that key ...
            if(-1 < i){
                // find the length of the value (performances speed up)
                i = name.indexOf(c, i + key.length - 1) + 1;
                // retrieve data simply via substring
                data = name.substring(i, i = name.indexOf(c, i));
                // generate original data and assign it
                data = RC4.decode($key, unescape(name.substr(++i, data)));
            };
            
            // return null, or found data - empty strings are included
            return data;
        },
        
        // this method save in the sessionStorage
        // a generic key/vaklue pair
        // please remember that specs say both key and value
        // should be strings, otherwise these are converted as strings
        /** @example
         *  sessionStorage.setItem("myObj", {a:"b"});
         *  alert(sessionStorage.getItem("myObj"));
         *  // [object Object] but it will be exactly the string "[object Object]"
         *  // and NOT the original object
         */
        setItem:function(key, data){
            // speed up possible getItem for this key
            $cache[key] = "" + data;
            
            // delete key in any case (LIFO procedure)
            this.removeItem(key);
            
            // append the "ciphered" string
            window.name += name(key, data);
            
            // append the key and set right length
            this.length = cache.push("" + key);
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
            var data = this.getItem(key);
            if(data !== null){
                delete $cache[key];
                window.name = window.name.replace(name(key, data), "");
                this.length = cache.remove("" + key);
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
            cache.length = 0;
            window.name = "";
        }
    };

    // there is some private scope stuff ...
    
    // this function aims is to convert
    // a generic key/value pair into
    // a sessionStorage window.name compatible string
    function name(key, data){
        
        // escape the key
        key = escape(key);
        
        // escape the "ciphered" value
        data = escape(RC4.encode($key, "" + data));
        
        // return an easy to find sessionStorage string
        return c.concat(key, c, data.length, c, data);
    };

    // this object should be part of JavaScript core
    // it is so bloody difficult to speed up in old browsers
    // this object aim is to make stored data hopefully safe
    // RC4 is the same used by SSL and other communication protocols.
    // The point is that it is fast, hardware implementable, and with
    // some weakness that with a random 128 bit key
    // should not hopefully be that significant
    var RC4 = (function(fromCharCode, random){
            // WebReflection RC4 Optimized For JavaScript - Mit Style License
            return {
                // RC4.decode(myKey, myEncodedString)
                decode:function(key, data){
                    return this.encode(key, data);
                },
                // RC4.encode(myKey, myDecodedString)
                encode:function(key, data){
                    // cannot spot anything redundant that
                    // could make this algo faster!!! Good Stuff RC4!
                    for(var
                        length = key.length, len = data.length,
                        decode = [], a = [],
                        i = 0, j = 0, k = 0, l = 0, $;
                        i < 256; ++i
                    )   a[i] = i;
                    for(i = 0; i < 256; ++i){
                        j = (j + ($ = a[i]) + key.charCodeAt(i % length)) % 256;
                        a[i] = a[j];
                        a[j] = $;
                    };
                    for(j = 0; k < len; ++k){
                        i = k % 256;
                        j = (j + ($ = a[i])) % 256;
                        length = a[i] = a[j];
                        a[j] = $;
                        decode[l++] = fromCharCode(data.charCodeAt(k) ^ a[(length + $) % 256]);
                    };
                    return decode.join("");
                },
                // what's this? just a way to create a random key to use
                // it accepts a length value. Suggested from 1 to 256
                // best option for performances probably a 128 one
                // I'll try with 64 if my old centrino will die with some
                // heavy string
                key:function(length){
                    for(var i = 0, key = []; i < length; ++i)
                        key[i] = fromCharCode((random() * 256) << 0);
                    return key.join("");
                }
            }
            // I like to freeze stuff in interpretation time
            // it makes things a bit safer when obtrusive libraries
            // are around
        })(String.fromCharCode, Math.random),
        
        // the special character used for window.name schema
        c = String.fromCharCode(1),
        
        // wrapped document shortcut
        document = window.document,
        
        // wrapped escape shortcut
        escape = window.escape,

        // wrapped unescape shortcut
        unescape = window.unescape,

        // Array with all set keys
        cache = [],

        // object used as cache for already set or retrieved keys
        $cache = {}, hasOwnProperty = $cache.hasOwnProperty,

        // a RegExp able to understand in a shot the window.name
        re = new RegExp(c.concat("([^", c, "]*)", c, "(\\d+)", c, "([^", c, "]*)"), "g"),

        // the document.cookie RegExp check
        cookie = /\bsessionStorage\b=([^;]+)(;|$)/,

        // wrapped undefined (safer, undefined could be redefined elsewhere)
        // plus $key used via RC4 encode/decode procedure
        undefined, $key
    ;

    // this should be part of ES5 specs in a better
    // fully indexOf compatible way, imho
    cache.remove = function(data){
        var i = this.indexOf(data);
        if(-1 < i)
            this.splice(i, 1);
        return this.length;
    };

    // for those browser without it ... poor browsers
    // they are mainly exclusively Internet Explorer ...
    if(!cache.indexOf) cache.indexOf = function(data){
        for(var i = 0, length = this.length; i < length; ++i){
            if(this[i] === data)
                return i;
        };
        return -1;
    };

    // it's time to create the sessionStorage object, isn't it?
    window.sessionStorage = new sessionStorage;

})(this);
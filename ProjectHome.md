# HTML5 sessionStorage for "every" browsers #
A [Web Storage](http://www.w3.org/TR/webstorage/) is [HTML5](http://dev.w3.org/html5/spec/Overview.html) response to [cookies](http://www.w3.org/Protocols/Specs.html) limits. While the world is moving forward improving users experience and web potentiality via constantly updated browsers like [Chrome](http://www.google.com/chrome), [Firefox](http://www.mozilla.com/en-US/firefox/personal.html), or [Safari](http://www.apple.com/safari/), some Jurassic user or company could be still stuck at the origins with obsolete, deprecated, slow, and loads of bugs, browsers.
The aim of this project is to bring at least one of the Web Storage in latter typology of user, or company, in a way that should simply work with a focused eye about security.

## Introducing The sessionStorage Object ##
There are basically two types of Web Storage so far, and these are the localStorage, and the sessionStorage. The main difference is that the localStorage persists over different tabs or windows, and even if we close the browser, accordingly with the domain security policy and user choices about quota limit.
The antagonist is the sessionStorage object which follows this rule:

|When a new HTMLDocument is created, the user agent must check to see if the document's top-level browsing context has allocated a session storage area for that document's origin. If it has not, a new storage area for that document's origin must be created.|
|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

|Each Document object must have a separate object for its Window's sessionStorage attribute.|
|:------------------------------------------------------------------------------------------|

In few words, the sessionStorage object does not persist if we close the tab (top-level browsing context) as it does not exists if we surf via another tab or window.
As summary, as soon as we are in our tab the session storage allows us to save a large amount of key/value pairs and lots of text, something impossible to do via cookie.
This is what my implementation is trying to do with browsers that do not implement this special object. If you have doubts, you can directly test the demo link, and come back whenever you want.

## How Does This Implementation Work ##
Nowadays, there is not such thing: _every_ _browser_, and this is the reason I put quotes in this page title. On the other hands, there are different "_de_ _facto_ _standards_", like innerHTML and others. One of these de-facto standards is the behavior of the **window** **name** **property**, something I've played with since ages, but never before that concretely useful!
window.name is an always present string, usually completely ignored by 99% of developers, but with below features:
  * as a string, it has no official length limit, except our RAM one. It could contain different megabytes of data without affecting performances
  * it persists in the same tab, being the origin of the context, and in every page surfed inside the tab, so it could be extremely unsafe to trust it for important data
  * it is automatically cleaned as soon as we close the tab or the browser, so used RAM will be automatically cleaned and without scripting effort
Thanks to these features, I have been able to think about a **string** **protocol** able to make window.name a sort of _linear_ _storage_

## The Used Protocol To Save Data ##
```
 Linear String Storage Protocol Specs
-----------------------------------------------
 c       = special separator char
 s       = key prefix char
 key     = key to use as value reference
 len     = unescaped key length
 value   = value to store
 length  = value length
 entry   = c + s + key + c + c + length + c + value
 -----------------------------------------------
 cs key cc length c value
 o.[   ]oo[      ]o[     ]

 key must be a string
 value must be a string
 both key or value, if not strings, should be converted
 both key and value cannot contain the special "c" char (replacement)
 entry can always be appended into the linear string storage
 entry cannot exist, or there could be more than an entry
 if a key was already present, its entry has to be removed and the new one appended
```
The reason I chose to save the length of the value, rather than look for the next special char at the end of the value is:
  1. rather than a char to char check to understand where is the next special char we simply retrieve N characters/bytes, as is for example in PHP serialized strings
  1. since an entry is always appended there could be no special characters at the end of the value
  1. if I used another special char to close the entry, it would not be possible to have zero length key or zero length value ( could be both empty key and empty value here)

As summary, thanks to this simple and fast protocol, I can easily and safely save any unique key/value pair I need without having massive bottlenecks for hundreds of characters strings.
Unfortunatly, due to window.name features, whoever could simply use the same protocol to retrieve a key and to change its value. That is why next step is required.

## sessionStorage Security Policy ##
Let's try to imagine we are in site a.com and we save a lot of data thanks to sessionStorage because we would like to make user experience as good as possible, remembering everything we need to remember, from massive written documents to whatever preference / option we would like to remember. sessionStorage is perfect for this purpose.
Now, for some reason we have an external link in our web application, or the user simply surf another site in the same tab. We would like to remember his actions or preferences as soon as he comes back but **attention**, the website b.com could be a malicious one and it could try to read the window.name and changes key a with value b into key a with value c. It is extremely simple thanks to used protocol simplicity. That is why I had to implement something secure enough in order to avoid value modifications.

## RC4 Stream Cipher Optimized For JavaScript ##
[RC4 stream cipher](http://en.wikipedia.org/wiki/RC4) has been used for SSL or WAP protocols because of its speed and simplicity. If you read the [source code](http://sessionstorage.googlecode.com/svn/trunk/src/RC4.js) of my implementation you will probably feel embarrassed by its size, specially considering there are two methods I deliberately added to make that object more "usable".
The main difference between common RC4 usage and mine is that I generate a completely random key with 128 characters length, rather than an hex one.
At the same time, the **secret** **key** is **saved** **into** **a** **cookie** which should respect domain policy making not possible from other websites to retrieve that key.
Thanks to browser cookie security policy and RC4, it should be difficult enough (note: not impossible) to understand saved values, change them, and put it back in the linear string storage. The only thing I could think about is somebody "silly enough" to disturb the linear storage removing or changing data associated with a specific key, but rather than an error that will eventually block the getItem making in any case our site or application safe.
As summary, thanks to this strategy, and please consider that cookies are the place where we save form and log-in info in whatever website, I feel confident enough we can trust 99% the sessionStorage implementation and _hey_, it is for the minority of the users, those still convinced IE6 does not suffer much worst security bugs!

## The Web Storage API ##
As we can see, the W3 team did an excellent job here: there is everything we need to perform any kind of task.

### length ###
This public ready only property, will tell us how many key/pair the sessionStorage contains. It is exactly like the length in a HTMLCollection, an Array, etc etc.
```
sessionStorage.length; // 0
sessionStorage.setItem("key", "value");
sessionStorage.length; // 1
```

### key(i:int):string ###
The public key method accept an integer (virtually unsigned) from 0 to sessionStorage.length - 1
This method returns the **key** used to store some value.
```
sessionStorage.setItem("myKey", "myValue");
sessionStorage.key(0); // myKey
```

### getItem(key:string):string ###
This public method accepts any sort of string, used as key, and returns the associated string, as value, or **null** if that key has not been stored before. Please not that whatever stored value will be converted into a string, so the check 'if(getItem("key") === null)' is never ambiguous.
```
sessionStorage.getItem("test"); // null
sessionStorage.setItem("test", "yo");
sessionStorage.getItem("test"); // yo
```

### setItem(key:string, data:string):void ###
This public method stores data via specified key. Please note that if key was already stored, it will **overwrite** it. Another thing to consider is that if we store a key, and via sessionStorage.key(0) we obtain that key, then we store another key/data and finally we store again the first key, sessionStorage.key(0) will return the second key/data stored, and not the first one.

### removeItem(key:string):void ###
This public method simply removes a key and related data from the storage.
```
sessionStorage.getItem("test"); // yo
sessionStorage.removeItem("test");
sessionStorage.getItem("test"); // null
```

### clear(void):void ###
This public method remove **everything** from the sessionStorage object.


## Compatibility & Requirements ##
As I said before, this script should be compatible with every [A-grade browser](http://developer.yahoo.com/yui/articles/gbs/), included iPhone or Android, but please feel free to file a bug if you encountered problems with this implementation.
As unique requirement, and only for not compatible browsers, cookies should be enabled in orther to save in a "secure way" the 128 characters randomly generated key and used for the entire session.
Finally, if you have some comment or question, please do not hesitate to write a comment in the <a href='http://webreflection.blogspot.com/2009/08/sessionstorage-cross-domain.html'>official announcement post in WebReflection</a>.

Best Regards

P.S. this project will be part of the vice-versa as well. this dedicated space is to avoid to force my [vice-versa library](http://code.google.com/p/vice-versa/) inclusion
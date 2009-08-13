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
})(String.fromCharCode, Math.random)
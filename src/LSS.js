/** Linear String Storage
 * -----------------------------------------------
 * @description     A Linear String Storage is a way to save
 *                  unique keys with related values inside a string.
 *
 * @author          Andrea Giammarchi
 * @license         Mit Style License
 * @blog            http://webreflection.blogspot.com/
 * @version         1.2
 * @compatibility   Internet Explorer, Chrome, Opera (unobtrusive for others)
 * @protocol        Linear String Storage Protocol Specs
 * -----------------------------------------------
 * c       = special separator char
 * s       = key.length separator char
 * key     = key to use as value reference
 * len     = unescaped key length
 * value   = value to store
 * length  = value length
 * entry   = c + key + s + len + c + length + c + value
 * -----------------------------------------------
 * c key s len c length c value
 * o[   ].[   ]o[      ]o[     ]
 *
 * key must be a string
 * value must be a string
 * both key or value, if not strings, should be converted
 * both key and value cannot contain the special "c" char (replacement)
 * entry can always be appended into the linear string storage
 * entry cannot exist, or there could be more than an entry
 * if a key was already present, its entry has to be removed and the new one appended
 * -----------------------------------------------
 */
var LSS = (function(window){

    /** new LSS([storage:Object, key:String, data:String])
     * @param   Object      an optional object to use as storage or directly a linear String.
     * @param   String      the Object property with the linear string to manage.
     * @param   String      optional data to preserve as initial string (when clear is performed, data is preserved)
     * @example
     *          // persistent storage via window.name property
     *          var s = new LSS(window, "name");
     *
     *          // temporary storage via existent string
     *          var s = new LSS(window.name);
     *
     *          // temporary storage with empty string
     *          var s = new LSS();
     */
    function LSS(_storage, _key, _data){
        this._i = (this._data = _data || "").length;
        if(this._key = _key)
            this._storage = _storage;
        else {
            this._storage = {_key:_storage || ""};
            this._key = "_key";
        };
    };

    /** @description    special character to use as separator
     */
    LSS.prototype.c = String.fromCharCode(1);

    /** @description    character to use as key:length separator
     */
    LSS.prototype._c = ".";

    /** this.clear(void):void
     * @description     reset the storage string
     */
    LSS.prototype.clear = function(){
        this._storage[this._key] = this._data;
    };

    /** this.del(key:String):void
     * @description     remove a key if present and its related value.
     * @param   String  the key to remove
     */
    LSS.prototype.del = function(key){
        var data = this.get(key);
        if(data !== null)
            this._storage[this._key] = this._storage[this._key].replace(escape.call(this, key, data), "");
    };

    /** this.escape(data:String):String
     * @description     escape a generic string. By default it uses window.escape function.
     *                  Please note if modified it should preserve the used special character.
     * @param   String  data to escape
     * @return  String  escaped data that can NOT contain the special character.
     */
    LSS.prototype.escape   = window.escape;

    /** this.get(key:String):String
     * @description     retrieve stored data if key is present.
     * @param   String  key related to stored data
     * @return  String  stored data or null if key was not present.
     */
    LSS.prototype.get = function(key){
        var _storage = this._storage[this._key],
            c = this.c,
            i = _storage.indexOf(key = c.concat(this.escape(key), this._c, key.length, c), this._i),
            data = null
        ;
        if(-1 < i){
            i = _storage.indexOf(c, i + key.length - 1) + 1;
            data = _storage.substring(i, i = _storage.indexOf(c, i));
            data = this.unescape(_storage.substr(++i, data));
        };
        return data;
    };

    /** this.key(void):Array
     * @description     put each key into an array and return it
     * @return  Array   all keys found in the storage.
     */
    LSS.prototype.key = function(){
        var _storage = this._storage[this._key],
            c = this.c,
            i = this._i,
            data = [],
            length = 0,
            l = 0
        ;
        while(-1 < (i = _storage.indexOf(c, i))){
            data[l++] = this.unescape(_storage.substring(++i, length = _storage.indexOf(this._c, i)));
            i = _storage.indexOf(c, length) + 1;
            length = _storage.indexOf(c, i);
            i = 1 + length + 1 * _storage.substring(i, length);
        };
        return data;
    };

    /** this.set(key:String, data:String):void
     * @description     stores data relating it with the specified key.
     *                  pleae note if the key was present, it is removed
     *                  and the new key/value pair appended.
     * @param   String  key to related with specified data.
     * @return  String  data to store.
     */
    LSS.prototype.set = function(key, data){
        this.del(key);
        this._storage[this._key] += escape.call(this, key, data);
    };

    /** this.unescape(data:String):String
     * @description     unescape a generic string. This should compatible with escape.
     * @param   String  data to unescape
     * @return  String  unescaped data that could contain the special char as well.
     */
    LSS.prototype.unescape = window.unescape;

    /** escape(key:String, data:String):String
     * @description     private scope callback. A shortcut to retrieve an entry via key and data
     */
    function escape(key, data){
        var c = this.c;
        data = this.escape(data);
        return c.concat(this.escape(key), this._c, key.length, c, data.length, c, data);
    };

    return LSS;

})(window);
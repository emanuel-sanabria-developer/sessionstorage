/** Linear String Storage
 * @build       2009-08-15 01:28:37
 * @author      Andrea Giammarchi
 * @license     Mit Style License
 * @project     http://code.google.com/p/sessionstorage/
 */

/** Linear String Storage
 * -----------------------------------------------
 * @description     A Linear String Storage is a way to save
 *                  unique keys with related values inside a string.
 *
 * @author          Andrea Giammarchi
 * @license         Mit Style License
 * @blog            http://webreflection.blogspot.com/
 * @version         1.0
 * @compatibility   Internet Explorer, Chrome, Opera (unobtrusive for others)
 * @protocol        Linear String Storage Protocol Specs
 * -----------------------------------------------
 * c       = special separator char
 * key     = key to use as value reference
 * length  = value length
 * value   = value to store
 * entry   = c + key + c + length + c + value
 * -----------------------------------------------
 * c key c length c value
 * o[   ]o[      ]o[     ]
 *
 * key must be a string
 * value must be a string
 * both key and value should be converted
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
        this._data = _data || "";
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
            i = _storage.indexOf(key = c + this.escape(key) + c),
            data = null
        ;
        if(-1 < i){
            i = _storage.indexOf(c, i + key.length - 1) + 1;
            data = _storage.substring(i, i = _storage.indexOf(c, i));
            data = this.unescape(_storage.substr(++i, data));
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
        key = this.escape(key);
        data = this.escape(data);
        return c.concat(key, c, data.length, c, data);
    };

    return LSS;

})(window);
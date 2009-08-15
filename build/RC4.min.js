/** RC4 Stream Cipher
 *  http://www.wisdom.weizmann.ac.il/~itsik/RC4/rc4.html
 * @build       2009-08-15 23:04:22
 * @author      Andrea Giammarchi
 * @license     Mit Style License
 * @project     http://code.google.com/p/sessionstorage/
 */var RC4=(function(a,b){return{decode:function(c,d){return this.encode(c,d)},encode:function(q,m){for(var d=q.length,o=m.length,c=[],p=[],n=0,g=0,f=0,e=0,h;n<256;++n){p[n]=n}for(n=0;n<256;++n){g=(g+(h=p[n])+q.charCodeAt(n%d))%256;p[n]=p[g];p[g]=h}for(g=0;f<o;++f){n=f%256;g=(g+(h=p[n]))%256;d=p[n]=p[g];p[g]=h;c[e++]=a(m.charCodeAt(f)^p[(d+h)%256])}return c.join("")},key:function(e){for(var d=0,c=[];d<e;++d){c[d]=a(1+((b()*255)<<0))}return c.join("")}}})(window.String.fromCharCode,window.Math.random);
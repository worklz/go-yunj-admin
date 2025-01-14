/**
 * 基于jquery.cookie.js
 */
layui.define(['jquery'], function(exports) {
    let $ = layui.jquery;

    let config={
        defaults:{}
    };

    let pluses = /\+/g;

    function encode(s) {
        return config.raw ? s : encodeURIComponent(s);
    }

    function decode(s) {
        return config.raw ? s : decodeURIComponent(s);
    }

    function stringifyCookieValue(value) {
        return encode(config.json ? JSON.stringify(value) : String(value));
    }

    function parseCookieValue(s) {
        if (s.indexOf('"') === 0) {
            // This is a quoted cookie as according to RFC2068, unescape...
            s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }

        try {
            // Replace server-side written pluses with spaces.
            // If we can't decode the cookie, ignore it, it's unusable.
            // If we can't parse the cookie, ignore it, it's unusable.
            s = decodeURIComponent(s.replace(pluses, ' '));
            return config.json ? JSON.parse(s) : s;
        } catch(e) {}
    }

    function read(s, converter) {
        let value = config.raw ? s : parseCookieValue(s);
        return $.isFunction(converter) ? converter(value) : value;
    }

    let obj={
        // 添加
        set:(key, value, options)=>{
            if (value !== undefined && !$.isFunction(value)) {
                options = $.extend({}, config.defaults, options);

                if (typeof options.expires === 'number') {
                    let days = options.expires, t = options.expires = new Date();
                    t.setTime(+t + days * 864e+5);
                }

                return (document.cookie = [
                    encode(key), '=', stringifyCookieValue(value),
                    options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                    options.path    ? '; path=' + options.path : '',
                    options.domain  ? '; domain=' + options.domain : '',
                    options.secure  ? '; secure' : ''
                ].join(''));
            }
        },
        // 获取
        get:(key,def=null)=>{
            let result = key ? undefined : {};

            // To prevent the for loop in the first place assign an empty array
            // in case there are no cookies at all. Also prevents odd result when
            let cookies = document.cookie ? document.cookie.split('; ') : [];
            let cl=cookies.length;
            if(cl<=0) return def;

            for (let i = 0, l = cookies.length; i < l; i++) {
                let parts = cookies[i].split('=');
                let name = decode(parts.shift());
                let cookie = parts.join('=');


                if (key && key === name) {
                    // If second argument (value) is a function it's a converter...
                    result = read(cookie);
                    break;
                }

                // Prevent storing a cookie that we couldn't decode.
                if (!key && (cookie = read(cookie)) !== undefined) {
                    result[name] = cookie;
                }
            }

            return result;
        },
        // 删除
        del:(key,options)=>{
            if (obj.get(key) === undefined) {
                return false;
            }
            obj.set(key, '', $.extend({}, options, { expires: -1 }));
            return !obj.get(key);
        }
    };

    exports('cookie', obj);
});
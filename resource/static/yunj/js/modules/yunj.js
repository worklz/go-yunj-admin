/**
 * Yunj
 */
layui.define(['jquery', 'layer', 'md5'], function (exports) {
    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let layer = layui.layer;
    let md5 = layui.md5;

    class Yunj {
        constructor() {
            this.version = win.YUNJ_VERSION;

            this.icon = {
                warn: 0,       // 注意
                success: 1,    // 成功
                error: 2,      // 错误
                quiz: 3,       // 提问
                lock: 4,       // 锁
                sad: 5,        // 难过
                smile: 6,      // 微笑
                load: 16,      // 加载中
            };

            // 默认的正则表达式
            this.defaultRegex = {
                // url地址
                url: /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/,
                // uri地址，/开头
                uri: /^\/[^\s]+/,
                // 逗号间隔的正整数
                commaIntervalPositiveInt: /^[1-9]\d*(?:,[1-9]\d*)*$/,
                // 逗号间隔的汉字/字母/数字组合
                commaIntervalChsAlphaNum: /^[\u4e00-\u9fa5a-zA-Z0-9]+(?:,[\u4e00-\u9fa5a-zA-Z0-9]+)*$/,
                // 16进制色号。例：#ffffff
                hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
                // 字母/数字/下划线_/短横线-
                alphaDash: /^[A-Za-z0-9\_\-]+$/,
                // 字母/数字
                alphaNum: /^[A-Za-z0-9]+$/,
                // 汉字/字母/数字/下划线_/短横线-/空格
                chsDashSpace: /^[\u4e00-\u9fa5a-zA-Z0-9\_\-\s]+$/,
                // 汉字/字母/数字/下划线_/破折号-
                chsDash: /^[\u4e00-\u9fa5a-zA-Z0-9\_\-]+$/,
                // 汉字/字母/数字
                chsAlphaNum: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/,
                // 汉字
                chs: /^[\u4e00-\u9fa5]+$/,
                // 邮箱
                email: /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/,
                // 手机
                mobile: /^1[3-9]\d{9}$/,
                // 数字
                number: /^[0-9]*$/,
                // 整数包含0
                integer: /^(-?[1-9]\d*|0)$/,
                // 非负数
                nonnegativeNum: /^(0|[1-9]\d*)(\.\d+)?$/,
                // ip（ipv4、ipv6）
                ip: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/,
            };

            this.init();
        }

        init() {
            let that = this;
            that.defineGlobal();
        }

        /**
         * 定义全局常量
         */
        defineGlobal() {
            let that = this;
            win.YUNJ_ADMIN_ENTRANCE = that.config('admin.entrance', 'admin');
        }

        /**
         * 暴露配置的获取
         * @param key   [“.”分割的字符串，如：file.upload_file_size]
         * @param def
         * @returns {*}
         */
        config(key, def = null) {
            key = key || "";

            if (YUNJ_CONFIG.hasOwnProperty(key)) {
                return YUNJ_CONFIG[key];
            }

            let keyArr = key.indexOf(".") === -1 ? [key] : key.split(".");
            if (keyArr.length <= 0) return def;
            let value = YUNJ_CONFIG || {};
            for (let i = 0, l = keyArr.length; i < l; i++) {
                let k = keyArr[i];
                if (!value.hasOwnProperty(k)) return def;
                value = value[k];
            }

            YUNJ_CONFIG[key] = value;

            return value;
        }

        /**
         * 打乱字符串顺序
         * @param {string} str
         * @return {string}
         */
        shuffle(str) {
            return yunj.arrayShuffle(Array.from(str)).join("");
        }

        /**
         * 文件上传url
         * @param {string} from
         * @return {string}
         */
        fileUploadUrl(from = "input") {
            if (!yunj.isString(from) || from.length <= 0) from = "input";
            return `${yunj.config('file.upload_url')}?from=${from}`;
        }

        /**
         * 文件上传
         * @param {File} file  文件对象
         * @param {string} paramName 上传文件参数名
         * @param {string} from  地址使用
         */
        fileUpload(file, paramName = 'file', from = 'input') {
            let formData = new FormData();
            formData.append(paramName, file);
            return yunj.request({
                url: yunj.fileUploadUrl(from),
                data: formData,
                type: "POST",
                processData: false,  // 告诉jQuery不要处理发送的数据
                contentType: false,  // 告诉jQuery不要设置内容类型头
            });
        }

        /**
         * 默认图
         * @return {string}
         */
        defaultImageUrl() {
            return yunj.config('def.image_url');
        }

        /**
         * 判断是否移动端
         * @returns {boolean}
         */
        isMobile() {
            return navigator.userAgent.toLowerCase().match(/(ipod|iphone|android|coolpad|mmp|smartphone|midp|wap|xoom|symbian|j2me|blackberry|wince)/i) != null;
        }

        /**
         * 判断是否小屏幕（屏宽<=768px）
         * @return {boolean}
         */
        isSmallScreen() {
            return top.window.innerWidth <= 768
        }

        /**
         * 获取变量数据类型（小写）
         * @param data
         * @returns {string}
         */
        varType(data) {
            return Object.prototype.toString.call(data).replace(/^\[object\s(.+)\]$/, '$1').toLowerCase();
        }

        /**
         * 判断变量是否为对象
         * @param obj
         */
        isObj(obj) {
            return yunj.varType(obj) === 'object' && !obj.length;
        }

        /**
         * 判断变量是否为空的对象{},是返回true，否返回false
         * @param obj
         * @returns {boolean}
         */
        isEmptyObj(obj) {
            return obj && yunj.isObj(obj) && Object.keys(obj).length <= 0;
        }

        /**
         * 判断变量是否为数组
         * @param arr
         */
        isArray(arr) {
            return yunj.varType(arr) === 'array';
        }

        /**
         * 判断变量是否为空数组
         * @param arr
         */
        isEmptyArray(arr) {
            return yunj.isArray(arr) && arr.length <= 0;
        }

        /**
         * 判断变量是否为正整数数组
         * @param {array} arr
         * @return {boolean}
         */
        isPositiveIntArray(arr) {
            if (!yunj.isArray(arr) || yunj.isEmptyArray(arr)) return false;
            let arrStr = arr.join(",");
            return /^[1-9]\d*(?:,[1-9]\d*)*$/.test(arrStr);
        }

        /**
         * 判断变量是否为字符串
         * @param str
         */
        isString(str) {
            return yunj.varType(str) === 'string';
        }

        /**
         * 判断变量是否为空字符串
         * @param str
         */
        isEmptyString(str) {
            return yunj.isString(str) && str.length <= 0;
        }

        /**
         * 判断变量是否为json字符串
         * @param str
         * @returns {*}
         */
        isJson(str) {
            if (!yunj.isString(str)) return false;
            try {
                let obj = JSON.parse(str);
                return obj && typeof obj === 'object';
            } catch (e) {
                return false;
            }
        }

        /**
         * 判断是否为布尔类型
         * @param val
         */
        isBool(val) {
            return yunj.varType(val) === 'boolean';
        }

        /**
         * 判断是否为数字（包含正负数/浮点数）
         * @param num
         */
        isNumber(num) {
            return yunj.varType(num) === 'number';
        }

        /**
         * 判断是否为正整数
         * @param num
         * @returns {boolean}
         */
        isPositiveInt(num) {
            return /(^[1-9]\d*$)/.test(num);
        }

        /**
         * 判断是否为正整数
         * @param num
         * @returns {boolean}
         */
        isPositiveInteger(num) {
            return yunj.isPositiveInt(num);
        }

        /**
         * 判断是否为非负整数
         * @param num
         * @returns {boolean}
         */
        isNonnegativeInt(num) {
            return /^([1-9]\d*|0)$/.test(num);
        }

        /**
         * 判断是否为非负整数
         * @param num
         * @returns {boolean}
         */
        isNonnegativeInteger(num) {
            return yunj.isNonnegativeInt(num);
        }

        /**
         * 判断是否为非负数
         * @param num
         * @returns {boolean}
         */
        isNonnegativeNum(num) {
            return yunj.defaultRegex.nonnegativeNum.test(num);
        }

        /**
         * 判断是否为非负数
         * @param num
         * @returns {boolean}
         */
        isNonnegativeNumber(num) {
            return yunj.isNonnegativeNum(num);
        }

        /**
         * 判断是否浮点数
         * @param num
         * @returns {boolean}
         */
        isFloat(num) {
            return num % 1 !== 0;
        }

        /**
         * 判断变量是否为标量（字符串、数字、布尔）
         * array、object等则不是标量
         * @param data
         * @return {boolean}
         */
        isScalar(data) {
            let type = yunj.varType(data);
            return ["string", "number", "boolean"].indexOf(type) !== -1;
        }

        /**
         * 判断变量是否未定义
         * @param data
         */
        isUndefined(data) {
            return "undefined" === yunj.varType(data);
        }

        /**
         * 判断变量是否为function
         * @param data
         */
        isFunction(data) {
            return "function" === yunj.varType(data);
        }

        /**
         * 判断是否为jQuery元素对象
         * @param data
         */
        isJQueryEl(data) {
            return yunj.varType(data) === 'object'
                && data.hasOwnProperty('length') && yunj.isNumber(data.length)
                && typeof data.each === 'function';
        }

        /**
         * 是否csv格式文件
         * @param {string} file [文件地址]
         * @returns {boolean}
         */
        isCsv(file) {
            return 'csv' === yunj.fileExt(file);
        }

        /**
         * 是否xls格式文件
         * @param {string} file [文件地址]
         * @returns {boolean}
         */
        isXls(file) {
            return yunj.fileExt(file) === 'xls';
        }

        /**
         * 是否xlsx格式文件
         * @param {string} file [文件地址]
         * @returns {boolean}
         */
        isXlsx(file) {
            return yunj.fileExt(file) === 'xlsx';
        }

        /**
         * 文件格式后缀
         * @param {string} file [文件名]
         * @returns {string}
         */
        fileExt(file) {
            let fileName = yunj.isString(file) ? file : file.name;
            return fileName.substr(fileName.lastIndexOf(".") + 1);
        }

        /**
         * 文件名后缀补充
         * @param {string} name  [文件名]
         * @param {string} url [文件地址]
         * @returns {string}
         */
        fileNameExt(name, url) {
            name = name.lastIndexOf('.') !== -1 ? name.substr(0, name.lastIndexOf('.')) : name;
            let ext = yunj.fileExt(url);
            return name + '.' + ext;
        }

        /**
         * 字符串补齐
         * @param str
         * @param pad_len
         * @param pad_str
         * @param pad_type
         * @returns {string | *}
         */
        str_pad(str, pad_len, pad_str = '', pad_type = 'left') {
            str = str.toString();
            pad_str = pad_str.toString();
            let len = str.length;
            while (len < pad_len) {
                str = pad_type === 'left' ? pad_str + str : str + pad_str;
                len++;
            }
            return str;
        }

        /**
         * 字符串转ArrayBuffer
         * @param str
         * @returns {ArrayBuffer}
         */
        str_to_array_buffer(str) {
            let buf = new ArrayBuffer(str.length);
            let view = new Uint8Array(buf);
            for (let i = 0; i !== str.length; ++i) view[i] = str.charCodeAt(i) & 0xFF;
            return buf;
        }

        /**
         * 判断是否为时间戳
         * @param data
         * @param {boolean} ms  默认值判断到秒级
         * @return {boolean}
         */
        isTimestamp(data, ms = false) {
            let reg = ms ? /^[1-9]\d{0,12}$/ : /^[1-9]\d{0,9}$/;
            return yunj.isScalar(data) && data && reg.test(data);
        }

        /**
         * 判断是否为日期
         * @param data
         * @returns {boolean}
         */
        isDate(data) {
            if (!data || !yunj.isString(data)) return false;
            let regRes = data.match(/^(\d+)[-|/](\d{1,2})[-|/](\d{1,2})$/);
            if (!yunj.isArray(regRes) || regRes.length !== 4) return false;
            regRes[2] = regRes[2] - 1;  // 月份从0开始要减一
            let dateObj = new Date(regRes[1], regRes[2], regRes[3]);
            // 整型比较
            return !isNaN(dateObj.getTime())
                && dateObj.getFullYear() === (regRes[1] | 0)
                && dateObj.getMonth() === (regRes[2] | 0)
                && dateObj.getDate() === (regRes[3] | 0);
        }

        /**
         * 判断是否为日期时间
         * @param data
         * @returns {boolean}
         */
        isDatetime(data) {
            if (!data || !yunj.isString(data)) return false;
            let regRes = data.match(/^(\d+)[-|/](\d{1,2})[-|/](\d{1,2})\s(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
            if (!yunj.isArray(regRes) || regRes.length !== 7) return false;
            regRes[2] = regRes[2] - 1;  // 月份从0开始要减一
            let dateObj = new Date(regRes[1], regRes[2], regRes[3], regRes[4], regRes[5], regRes[6]);
            // 整型比较
            return !isNaN(dateObj.getTime())
                && dateObj.getFullYear() === (regRes[1] | 0)
                && dateObj.getMonth() === (regRes[2] | 0)
                && dateObj.getDate() === (regRes[3] | 0)
                && dateObj.getHours() === (regRes[4] | 0)
                && dateObj.getMinutes() === (regRes[5] | 0)
                && dateObj.getSeconds() === (regRes[6] | 0)
        }

        /**
         * 判断是否为日期时间
         * @param data
         * @returns {boolean}
         */
        isYear(data) {
            if (!data || !yunj.isString(data)) return false;
            let regRes = data.match(/^(\d+)$/);
            if (!yunj.isArray(regRes) || regRes.length !== 2) return false;
            let dateObj = new Date(regRes[1]);
            // 整型比较
            return !isNaN(dateObj.getTime()) && dateObj.getFullYear() === (regRes[1] | 0)
        }

        /**
         * 判断是否为年月
         * @param data
         * @returns {boolean}
         */
        isYearMonth(data) {
            if (!data || !yunj.isString(data)) return false;
            let regRes = data.match(/^(\d+)[-|/](\d{1,2})$/);
            if (!yunj.isArray(regRes) || regRes.length !== 3) return false;
            regRes[2] = regRes[2] - 1;  // 月份从0开始要减一
            let dateObj = new Date(regRes[1], regRes[2]);
            // 整型比较
            return !isNaN(dateObj.getTime())
                && dateObj.getFullYear() === (regRes[1] | 0)
                && dateObj.getMonth() === (regRes[2] | 0);
        }

        /**
         * 判断是否为月份
         * @param data
         * @returns {boolean}
         */
        isMonth(data) {
            if (!data || !yunj.isPositiveInt(data)) return false;
            return data >= 1 && data <= 12;
        }

        /**
         * 判断是否为时间
         * @param data
         * @returns {boolean}
         */
        isTime(data) {
            if (!data || !yunj.isString(data)) return false;
            let regRes = data.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
            if (!yunj.isArray(regRes) || regRes.length !== 4) return false;
            let dateObj = new Date(2019, 5, 15, regRes[1], regRes[2], regRes[3]);
            // 整型比较
            return !isNaN(dateObj.getTime())
                && dateObj.getHours() === (regRes[1] | 0)
                && dateObj.getMinutes() === (regRes[2] | 0)
                && dateObj.getSeconds() === (regRes[3] | 0)
        }

        /**
         * 判断是否为：年/月/年月/日期/日期时间/时间 等类型的字符串数据
         * @param data
         * @returns {boolean}
         */
        isDatetimeVal(data) {
            return yunj.isYear(data) || yunj.isMonth(data) || yunj.isYearMonth(data) || yunj.isTime(data) || yunj.isDate(data) || yunj.isDatetime(data)
        }

        /**
         * 日期时间转换为时间戳
         * @param {string} datetime
         * @param {boolean} isMs    毫秒时间戳
         * @returns {int}
         */
        datetimeToTimestamp(datetime, isMs = false) {
            let ms = new Date(datetime).getTime();
            if (isNaN(ms)) return 0;
            return isMs ? ms : parseInt(ms / 1000);
        }

        /**
         * 获取当前时间戳
         * @param {boolean} isMs [毫秒时间戳]
         * @returns {int}
         */
        currTimestamp(isMs = false) {
            let ms = new Date().getTime();
            return isMs ? ms : parseInt(ms / 1000);
        }

        /**
         * 获取当前日期时间
         * @returns {string}
         */
        currDatetime() {
            let timestamp = parseInt(new Date().getTime() / 1000);
            return yunj.timestampFormat(timestamp);
        }

        /**
         * 时间戳格式化
         * @param {int|string} timestamp
         * @param {string} format
         * @returns {string}
         */
        timestampFormat(timestamp, format = 'Y-m-d H:i:s') {
            if (!yunj.isTimestamp(timestamp) && !yunj.isTimestamp(timestamp, true)) return "";
            timestamp = parseInt(timestamp);
            timestamp = timestamp <= 9999999999 ? (timestamp * 1000) : timestamp;
            let d = new Date(timestamp);

            let year = d.getFullYear();  //取得4位数的年份
            let month = yunj.str_pad(d.getMonth() + 1, 2, 0, 'left');  //取得日期中的月份，其中0表示1月，11表示12月
            let day = yunj.str_pad(d.getDate(), 2, 0, 'left');        //返回日期月份中的天数（1到31）
            let hour = yunj.str_pad(d.getHours(), 2, 0, 'left');       //返回日期中的小时数（0到23）
            let minute = yunj.str_pad(d.getMinutes(), 2, 0, 'left');   //返回日期中的分钟数（0到59）
            let second = yunj.str_pad(d.getSeconds(), 2, 0, 'left');   //返回日期中的秒数（0到59）

            return format.replace(/Y|m|d|H|i|s/ig, function (matches) {
                return ({Y: year, m: month, d: day, H: hour, i: minute, s: second})[matches];
            });
        }

        /**
         * 获取指定时间的周开始日期时间对象
         * @param {string|int} time 时间戳|日期时间字符串
         * @return {Date}
         */
        getWeekStartDateObj(time) {
            let timestamp = yunj.isTimestamp(time) ? time : yunj.datetimeToTimestamp(time, true);
            timestamp = timestamp <= 9999999999 ? (timestamp * 1000) : timestamp;
            let timeDate = new Date(timestamp);
            let dayOfWeek = timeDate.getDay(); // 获取指定时间是周几（0-6，0代表周日，1代表周一）
            // 获取周一的时间戳
            let weekStartTimestamp = timestamp - (dayOfWeek === 0 ? 0 : (dayOfWeek - 1)) * 86400000;
            let weekStartDate = new Date(weekStartTimestamp);
            // 重新实例化日期时间对象
            return new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate());
        }

        /**
         * 获取本周开始日期时间对象
         * @return {Date}
         */
        getCurrWeekStartDateObj() {
            let currTimestamp = yunj.currTimestamp(true);
            return yunj.getWeekStartDateObj(currTimestamp);
        }

        /**
         * 获取指定时间的周结束日期时间对象
         * @param {string|int} time 时间戳|日期时间字符串
         * @return {Date}
         */
        getWeekEndDateObj(time) {
            let timestamp = yunj.isTimestamp(time) ? time : yunj.datetimeToTimestamp(time, true);
            timestamp = timestamp <= 9999999999 ? (timestamp * 1000) : timestamp;
            let timeDate = new Date(timestamp);
            let dayOfWeek = timeDate.getDay(); // 获取指定时间是周几（0-6，0代表周日，1代表周一）
            // 获取周一的时间戳
            let weekStartTimestamp = timestamp + (dayOfWeek === 0 ? 0 : (7 - dayOfWeek)) * 86400000;
            let weekStartDate = new Date(weekStartTimestamp);
            // 重新实例化日期时间对象
            return new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate(), 23, 59, 59, 999);
        }

        /**
         * 获取上周开始日期时间对象
         * @return {Date}
         */
        getLastWeekStartDateObj() {
            let currTimestamp = yunj.currTimestamp(true) - 7 * 86400000;
            return yunj.getWeekStartDateObj(currTimestamp);
        }

        /**
         * 获取上周结束日期时间对象
         * @return {Date}
         */
        getLastWeekEndDateObj() {
            let currTimestamp = yunj.currTimestamp(true) - 7 * 86400000;
            return yunj.getWeekEndDateObj(currTimestamp);
        }

        /**
         * 获取本月开始日期时间对象
         * @return {Date}
         */
        getCurrMonthStartDateObj() {
            let date = new Date();
            let year = date.getFullYear();
            let month = date.getMonth();
            return new Date(year, month);
        }

        /**
         * 获取几个月的年/月日期对象数据
         * @param {int} months 几个月（<0表示前几个月，>0表示后几个月）
         * 例：-1 表示一个月前，1 表示一个月后
         * @return {Date}
         */
        getMonthsYearMonthDateObj(months) {
            let today = new Date();
            let todayY = today.getFullYear();
            let todayM = today.getMonth();
            let monthsY, monthsM;
            let diffMonth = (todayM + 1) + months;  // 差值月份
            // 年份
            if (diffMonth === 0) {
                monthsY = todayY - 1;
            } else {
                monthsY = todayY + Math.floor(diffMonth / 12);
            }
            // 月份
            if ((months % 12) === 0) {
                monthsM = todayM;
            } else {
                monthsM = (diffMonth > 0 ? (diffMonth % 12) : (12 + (diffMonth % 12))) - 1;
            }
            return new Date(monthsY, monthsM);
        }

        /**
         * 获取几个月的月初日期时间对象
         * @param {int} months 几个月（<0表示前几个月，>0表示后几个月）
         * @return {Date}
         */
        getMonthsStartDateObj(months) {
            return yunj.getMonthsYearMonthDateObj(months);
        }

        /**
         * 获取几个月的月末日期时间对象
         * @param {int} months 几个月（<0表示前几个月，>0表示后几个月）
         * @return {Date}
         */
        getMonthsEndDateObj(months) {
            let yearMonthDateObj = yunj.getMonthsYearMonthDateObj(months);
            return new Date(yearMonthDateObj.getFullYear(), yearMonthDateObj.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        /**
         * 获取几年的年初日期时间对象
         * @param {int} years 几年（<0表示前几年，>0表示后几年）
         * @return {Date}
         */
        getYearsStartDateObj(years) {
            let today = new Date();
            let year = today.getFullYear() + years;
            return new Date(year, 0, 1);
        }

        /**
         * 获取几年的年末日期时间对象
         * @param {int} years 几年（<0表示前几年，>0表示后几年）
         * @return {Date}
         */
        getYearsEndDateObj(years) {
            let today = new Date();
            let year = today.getFullYear() + years;
            return new Date(year, 12, 0, 23, 59, 59, 999);
        }

        /**
         * 获取几天前的日期时间对象
         * @param {int} days 几天（<0表示前几天，>0表示后几天）
         * 例：-1 表示一天前，1 表示一天后
         * @return {Date}
         */
        getDaysDateObj(days) {
            let currTimestamp = yunj.currTimestamp(true);
            return new Date(currTimestamp + days * 86400000);
        }

        /**
         * 获取几个月的今天的日期时间对象
         * @param {int} months 几个月（<0表示前几个月，>0表示后几个月）
         * 例：-1 表示一个月前，1 表示一个月后
         * @return {Date}
         */
        getMonthsTodayDateObj(months) {
            // 年份、月份
            let yearMonthDateObj = yunj.getMonthsYearMonthDateObj(months);
            let monthsTodayY = yearMonthDateObj.getFullYear();
            let monthsTodayM = yearMonthDateObj.getMonth();
            let today = new Date();
            let todayD = today.getDate();

            // 判断是否有今天这个日期，没有则返回几个月的最后一天
            // 获取几个月最后一天是第几天
            let monthsLastDayD = new Date(monthsTodayY, monthsTodayM + 1, 0).getDate();
            let monthsTodayD = todayD <= monthsLastDayD ? todayD : monthsLastDayD;

            let monthsTodayH = today.getHours();
            let monthsTodayMin = today.getMinutes();
            let monthsTodayS = today.getSeconds();

            return new Date(monthsTodayY, monthsTodayM, monthsTodayD, monthsTodayH, monthsTodayMin, monthsTodayS);
        }

        /**
         * 获取几年的日期时间对象
         * @param {int} years 几年（<0表示前几年，>0表示后几年）
         * 例：-1 表示一年前，1 表示一年后
         * @return {Date}
         */
        getYearsDateObj(years) {
            let currTimestamp = yunj.currTimestamp(true);
            return new Date(currTimestamp + years * 86400000 * 365);
        }

        /**
         * 获取指定时、分、秒的日期时间对象
         * @param {int} hours 时
         * @param {int} min 分
         * @param {int} sec 秒
         * @param {int} ms 毫秒
         * @return {Date}
         */
        getTimeDateObj(hours, min = 0, sec = 0, ms = 0) {
            let date = new Date();
            date.setHours(hours, min, sec, ms);
            return date;
        }

        /**
         * 打乱数组排序
         * @param {array} arr
         * @return {array}
         */
        arrayShuffle(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                let temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
            return arr;
        }

        /**
         * 获取对象组成数组，提取其中某一属性组成的新数组返回
         * @param {array} arr
         * @param {string|null} columnKey
         * @param {string|null} indexKey
         * @return {array|object}
         */
        arrayColumn(arr, columnKey = null, indexKey = null) {
            let res = indexKey ? {} : [];
            for (let i = 0; i < arr.length; i++) {
                let v = arr[i];
                if (columnKey) {
                    v = v[columnKey];
                }
                if (indexKey) {
                    let k = arr[i][indexKey];
                    res[k] = v;
                } else {
                    res.push(v);
                }
            }
            return res;
        }

        /**
         * 获取数组差集
         * arr1和后面的数组比较，如果arr1里面有的值在后面数组中没有则返回
         * @param {array} arr1
         * @param {array} arr2
         * @return {array}
         */
        arrayDiff(arr1, arr2) {
            return arr1.filter(v => !arr2.includes(v));
        }

        /**
         * 获取数组交集
         * arr1和后面的数组比较，如果arr1里面有的值在后面数组中有则返回
         * @param {array} arr1
         * @param {array} arr2
         * @return {array}
         */
        arrayIntersect(arr1, arr2) {
            return arr1.filter(v => arr2.includes(v));
        }

        /**
         * 数组去重
         * @param {any[]} arr
         * @return {any[]}
         */
        arrayUnique(arr) {
            if (arr.length <= 0) return [];
            let set = Array.from(new Set(arr)); // [ 1, "a", true, false, null, "", undefined ]
            return [...new Set(set)];
        }

        /**
         * 判断数组值是否在指定规则数组内（只针对一维数组）
         * @param arr      [待判断数组]
         * @param rule_arr [规则数组]
         */
        array_in(arr = [], rule_arr = []) {
            if (yunj.isEmptyArray(rule_arr)) return false;
            for (let i = 0, l = arr.length; i < l; i++) {
                if (rule_arr.indexOf(arr[i]) === -1) return false;
            }
            return true;
        }

        /**
         * 数组分割，将一个大数组分割为多个长度相等的小数组
         * @param arr       [待分割数组]
         * @param length    [分割长度]
         * @returns {Array}
         * Example：
         * array_slice([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],6);   // 输出 [[1,2,3,4,5,6],[7,8,9,10,11,12],[13,14,15]]
         */
        array_slice(arr = [], length = 0) {
            let newArr = [];
            let i = 0;
            while (i < arr.length) {
                newArr.push(arr.slice(i, i += length));
            }
            return newArr;
        }

        /**
         * 对象补充合并
         * @param {object} obj      [待补充对象]
         * @param {object} ruleObj  [规则对象]
         * @returns {object}
         */
        objSupp(obj, ruleObj) {
            for (let attr in ruleObj) {
                if (obj.hasOwnProperty(attr)) {
                    if (yunj.isObj(ruleObj[attr]) && !yunj.isEmptyObj(ruleObj[attr]) && yunj.isObj(obj[attr])) {
                        obj[attr] = yunj.objSupp(obj[attr], ruleObj[attr]);
                    }
                } else {
                    obj[attr] = ruleObj[attr];
                }
            }
            return obj;
        }

        /**
         * 清除字符串两端空格
         * @param str
         */
        trim(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
        }

        /**
         * 清除字符串左端空格
         * @param str
         */
        ltrim(str) {
            return str.replace(/(^\s*)/g, "");
        }

        /**
         * 清除字符串右端空格
         * @param str
         */
        rtrim(str) {
            return str.replace(/(\s*$)/g, "");
        }

        /**
         * 获取当前域名http://xxx.com
         * @returns {string}
         */
        domain() {
            return doc.location.origin;
        }

        /**
         * 获取当前url
         * @param {boolean} domain [是否获取完整url包含域名]
         * @returns {string}
         */
        url(domain = false) {
            return domain ? doc.location.href : doc.location.pathname + doc.location.search;
        }

        /**
         * 获取当前url参数
         * @param {string|null} key [参数key，null则返回整个参数对象]
         * @param {string|null} def [默认返回值]
         * @returns {*}
         */
        urlParam(key = null, def = null) {
            let paramStr = win.location.search.substring(1);
            let paramArr = paramStr.split("&");
            let param = {};
            for (let i = 0, len = paramArr.length; i < len; i++) {
                let param_key, param_val;
                [param_key, param_val] = paramArr[i].split("=");
                if (key && param_key === key) return param_val;
                if (!key) param[param_key] = param_val;
            }
            return key ? def : (yunj.isEmptyObj(param) ? def : param);
        }

        /**
         * url追加参数
         * @param {string} url
         * @param {string|object} key
         * @param {string} val
         * @returns {*}
         */
        urlPushParam(url, key, val) {
            if (yunj.isObj(key) && !yunj.isEmptyObj(key)) {
                let params = key;
                for (let k in params) {
                    url = yunj.urlPushParam(url, k, params[k]);
                }
                return url;
            }
            let rep = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            let separator = url.indexOf('?') !== -1 ? "&" : "?";
            return url.match(rep) ? url.replace(rep, '$1' + key + "=" + val + '$2') : url + separator + key + "=" + val;
        }

        /**
         * 页面url处理
         * @param {string} url
         * @return {string}
         */
        handlePageUrl(url) {
            // originLocation 参数补充
            let originLocation = yunj.urlParam('originLocation');
            if (originLocation === null) return url;
            return yunj.urlPushParam(url, 'originLocation', originLocation);
        }

        /**
         * url补充域名
         * @param {string} url
         * @param {string} domain   默认当前域名
         * @return {string}
         */
        urlAppendDomain(url, domain = '') {
            if (url.substr(0, 1) === '/') {
                if (!domain) {
                    domain = yunj.domain();
                }
                url = domain + url;
            }
            return url;
        }

        /**
         * 根据地址截取文件名
         * @param {string} url [地址]
         * @param {boolean} ext [是否包含后缀格式名]
         * @returns {string}
         */
        urlFileName(url, ext = true) {
            let lastSymbolIdx = url.lastIndexOf('/');
            let fileName = url;
            if (lastSymbolIdx !== -1) {
                fileName = fileName.substr(lastSymbolIdx + 1);
            }
            if (ext) {
                return fileName;
            }
            lastSymbolIdx = url.lastIndexOf('.');
            if (lastSymbolIdx !== -1) {
                fileName = fileName.substr(0, lastSymbolIdx + 1);
            }
            return fileName;
        }

        /**
         * xlsx工作表单个表格宽度wch
         * @param str
         * @returns {number}
         */
        xlsx_sheet_cell_wch(str) {
            let wch = 0;
            for (let i = 0, l = str.length; i < l; i++) {
                // 如果是汉字，加2
                wch += str.charCodeAt(i) > 255 ? 2 : 1;
            }
            return wch;
        }

        /**
         * 是否存在父窗口
         * @returns {boolean}
         */
        isExistParent() {
            return win.parent !== win;
        }

        /**
         * 当前页面标题
         */
        currPageTitle(isPopup = false) {
            let elMark = isPopup ? '.layui-layer-title' : `.layui-tab-title li[lay-id=${md5(yunj.url(true))}]`;
            return $(elMark, top.document).prop("firstChild").nodeValue;
        }

        /**
         * 新标签页打开
         * @param {string} url
         */
        openNewPage(url) {
            yunj.isExistParent() ? top.window.open(url) : win.open(url);
        }

        /**
         * 打开tab子页面
         * @param {string|object} url           页面地址
         * @param {string} title                页面标题
         * @param {boolean|string} rawPage      源页面标识
         * @return {void}
         */
        openTab(url, title = "", rawPage = false) {
            rawPage = rawPage === true ? yunj.currTabPageId() : (yunj.isString(rawPage) ? rawPage : null);
            top.yunj.page.openTab(url, title, rawPage);
        }

        /**
         * 打开popup子页面
         * @param {string|object} url       页面地址
         * @param {string} title            页面标题
         * @param {boolean|string} rawPage  源页面标识
         * @param {string|int|null} w       [指定宽]（可选，可设置百分比或者像素，像素传入int）
         * @param {string|int|null} h       [指定高]（可选，同上）
         * @return {void}
         */
        openPopup(url, title = "", rawPage = false, w = null, h = null) {
            rawPage = rawPage === true ? yunj.currTabPageId() : (yunj.isString(rawPage) ? rawPage : null);
            top.yunj.page.openPopup(url, title, rawPage, w, h);
        }

        /**
         * 获取原页面window对象
         * @return {*|null}
         */
        rawPageWin() {
            let rawPage = yunj.urlParam("rawPage", "");
            if (rawPage.length <= 0) return null;
            let iframe = $(top.document).find(`iframe[tab-id=${rawPage}]`);
            if (iframe.length <= 0) return null;
            return iframe[0].contentWindow;
        }

        /**
         * 获取原页面表格对象
         * @param tableId
         * @returns {null}
         */
        rawTable(tableId = '') {
            let rawPageWin = yunj.rawPageWin();
            if (!rawPageWin
                || !rawPageWin.hasOwnProperty('yunj') || !yunj.isObj(rawPageWin.yunj)
                || !rawPageWin.yunj.hasOwnProperty('table') || !yunj.isObj(rawPageWin.yunj.table)) return null;
            tableId = tableId ? tableId : yunj.urlParam("rawTable", "");
            return tableId ? rawPageWin.yunj.table[tableId] : null;
        }

        /**
         * 重定向到指定tab子页面
         * @param {string|null} tabId    [默认null指向首页]
         * @returns {*}
         */
        redirectTab(tabId = null) {
            return yunj.isExistParent() ? top.yunj.page.redirectTab(tabId) : yunj.page.redirectTab(tabId);
        }

        /**
         * 重定向到登录页
         */
        redirectLogin() {
            let url = yunj.config("admin.login_url", "");
            yunj.isExistParent() ? top.window.location.href = url : location.href = url;
        }

        /**
         * 判断当前页面是否为popup子页面
         * @returns {boolean}
         */
        isPopupPage() {
            return yunj.isExistParent() && yunj.urlParam('isPopup', 'no') === 'yes';
        }

        /**
         * 判断当前页面是否为tab子页面
         * @returns {boolean}
         */
        isTabPage() {
            return yunj.isExistParent() && (!yunj.isPopupPage());
        }

        /**
         * 当前tab页面的 id
         * @returns {string}
         */
        currTabPageId() {
            return yunj.isExistParent() ? top.yunj.page.currTabPageId() : "";
        }

        /**
         * 当前popup页面的 id
         * @returns {string}
         */
        currPopupPageId() {
            return yunj.isExistParent() ? top.yunj.page.currPopupPageId() : "";
        }

        /**
         * 当前页面的id
         * @returns {string}
         */
        currPageId() {
            if (!yunj.isExistParent()) return "";
            return yunj.isPopupPage() ? top.yunj.page.currPopupPageId() : top.yunj.page.currTabPageId();
        }

        /**
         * 消息提示
         * @param content
         * @param icon
         * @param time
         */
        msg(content, icon = null, time = 1500) {
            let options = {time: time};
            if (yunj.icon.hasOwnProperty(icon)) options.icon = yunj.icon[icon];
            return top.layer.msg(content, options);
        }

        /**
         * 普通弹窗
         * @param {string} content
         * @param {object} options  基础属性配置项
         * @param {function|null} yes
         * @returns {*|void}
         */
        alert(content, options = {}, yes = null) {
            options = Object.assign({}, {
                title: '提示',
                shadeClose: true,
            }, options);
            if (options.hasOwnProperty('icon') && yunj.icon.hasOwnProperty(options.icon)) {
                options.icon = yunj.icon[options.icon];
            }
            return top.layer.alert(content, options, yes);
        }

        /**
         * 错误弹窗
         * @param {string|Error|object} e
         * @param {function|null} yes
         */
        error(e, yes = null) {
            let content = "";
            if (yunj.isString(e)) {
                content = e;
            } else if (e instanceof Error) {
                content = e.message;
            } else if (yunj.isObj(e)) {
                content = e.hasOwnProperty("msg") ? e.msg : JSON.stringify(e);
            }
            if (content) yunj.alert(content, {icon: yunj.icon.error}, yes);
        }

        /**
         * 确认弹窗
         * @param {string|object} content           提示内容|参数对象
         * @param {null|function} yesCallback       点击确定执行的方法
         * @param {null|function} cancelCallback    点击取消执行的方法
         * @returns {*|boolean}
         */
        confirm(content, yesCallback = null, cancelCallback = null) {
            let args = {
                content: "",
                yesCallback: null,
                cancelCallback: null,
                title: "提示",
                icon: null
            };
            if (yunj.isObj(content)) {
                args = yunj.objSupp(content, args);
            } else {
                args.content = content;
                args.yesCallback = yesCallback;
                args.cancelCallback = cancelCallback;
            }

            let layContent = args.content;

            let layOptions = {
                title: args.title
            };
            if (args.icon !== null) layOptions.icon = args.icon;

            let layYesCallback = (index) => {
                top.layer.close(index);
                args.yesCallback && args.yesCallback();
            };

            let layCancelCallback = (index) => {
                top.layer.close(index);
                args.cancelCallback && args.cancelCallback();
            };

            return top.layer.confirm(layContent, layOptions, layYesCallback, layCancelCallback);
        }

        /**
         * 弹出层
         * @param args
         * @return {*}
         */
        open(args) {
            return top.layer.open(args);
        }

        /**
         * load 弹窗
         */
        load() {
            return top.layer.load(2, {time: 60 * 60 * 1000});
        }

        /**
         * load 百分比弹窗
         * @param args
         */
        load_rate(args = {}) {
            args = yunj.objSupp(args, {
                load_tips: '努力加载中...',
                success_tips: '已完成',
                auto_close: true,
                rate_callback: function () {
                    return [99, 100];
                },
            });
            let param = {
                title: false,
                shade: 0.2,
                btn: [],
                closeBtn: 0,
                time: 60 * 60 * 1000,
                skin: 'yunj-load-rate',
                content: `<div class="load-box">
                            <i class='layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop'></i>
                            <span class="load-tips">努力加载中...</span>
                            <span class="load-rate">0%</span>
                        </div>`,
                success: function (layero, index) {
                    layero.find('.load-tips').html(args.load_tips);
                    yunj.load_rate_timer = setInterval(function () {
                        let [curr, total] = args.rate_callback();
                        let rate = Math.floor((curr / total) * 100);
                        rate = rate > 100 ? 100 : rate;
                        layero.find('.load-rate').html(`${rate}%`);
                        if (rate < 100) return;
                        layero.find('.load-tips').html(args.success_tips);
                        // 设置定时关闭定时器，防止定时器关闭了方法没执行完
                        setTimeout(function () {
                            yunj.load_rate_timer && clearInterval(yunj.load_rate_timer) && (yunj.load_rate_timer = null);
                        }, 1000);
                        if (args.auto_close) yunj.close(index);
                    }, 500);
                },
                end: function () {
                    yunj.load_rate_timer && clearInterval(yunj.load_rate_timer) && (yunj.load_rate_timer = null);
                }
            };

            return yunj.isExistParent() ? top.layer.open(param) : layer.open(param);
        }

        /**
         * load 进度条弹窗
         * @param args
         */
        loadProgress(args = {}) {
            return new Promise((resolve, reject) => {
                layui.use(['loadProgress'], () => {
                    resolve(layui.loadProgress(args));
                });
            });
        }

        /**
         * 文件下载
         * @param url   [下载地址]
         * @param name  [下载名称]
         */
        download(url, name = '') {
            if (!yunj.isObj(url) && !name) {
                name = yunj.urlFileName(url);
            }
            layui.use(['download'], () => {
                layui.download(url, name);
            });
        }

        /**
         * 表格数据导出
         * @param table [表格对象]
         */
        tableExport(table) {
            layui.use(['tableExport'], () => {
                layui.tableExport(table);
            });
        }

        /**
         * 默认图片加载失败时默认图片属性
         * @return {string}
         */
        defaultImageAttrOnerror() {
            return `onerror="this.src='${yunj.defaultImageUrl()}';this.onerror=null;"`;
        }

        /**
         * 预览图片样式
         * @param src   [图片src]
         * @param box   [图片外部盒子数据]
         */
        previewImgStyle(src, box = 0) {
            return new Promise((resolve, reject) => {
                box = yunj.objSupp(box, {
                    width: 110,  // 外部盒子宽（单位px）
                    height: 110,  // 外部元素高（单位px）
                });
                let boxW = box.width;
                let boxH = box.height;
                let img = new Image();
                img.src = src;
                img.onerror = function () {
                    console.log('预览图片加载失败', src);
                    img.src = yunj.defaultImageUrl();
                };
                img.onload = () => {
                    let imgW = img.width;
                    let imgH = img.height;

                    let rateW = boxW / imgW;
                    let rateH = boxH / imgH;
                    if ((rateW < 1 && rateH < 1) || (rateW < 1 && rateH >= 1) || (rateH < 1 && rateW >= 1)) {
                        let rate = rateW < rateH ? rateW : rateH;
                        imgW = (imgW * rate) | 0;
                        imgH = (imgH * rate) | 0;
                    }
                    let marginLeft = (boxW - imgW) * 0.5;
                    marginLeft = marginLeft < 0 ? 0 : marginLeft;
                    let marginTop = (boxH - imgH) * 0.5;
                    marginTop = marginTop < 0 ? 0 : marginTop;
                    imgW = `${imgW}px`;
                    imgH = `${imgH}px`;
                    marginLeft = `${marginLeft}px`;
                    marginTop = `${marginTop}px`;
                    let style = `style="width:${imgW};height:${imgH};margin-left: ${marginLeft};margin-top: ${marginTop};"`;
                    resolve(style);
                };
            });
        }

        /**
         * 图片预览
         * @param src   [图片src或者src组成的数组]
         * @param idx   [初始显示的图片索引，默认第一张]
         * @returns {*}
         */
        previewImg(src, idx = 0) {
            let src_arr = yunj.isString(src) ? [src] : src;
            // src_arr=[
            //     '/static/yunj/img/bg.png',
            //     '/static/yunj/img/default.png',
            //     '/static/yunj/img/guide_arrow_1.png'
            // ];
            if (src_arr.length <= 0) return 0;

            let docW = yunj.isExistParent() ? $(top.document).width() : $(doc).width();
            let docH = yunj.isExistParent() ? $(top.document).height() : $(doc).height();
            let areaWRate = docW > docH ? 0.6 : 0.9;
            let areaHRate = docW > docH ? 0.6 : 1;
            let areaW = (docW * areaWRate) | 0;
            let areaH = (areaW * areaHRate) | 0;

            let popupArgs = {
                type: 1,
                title: false,
                area: [`${areaW}px`, `${areaH}px`],
                shade: 0.2,
                shadeClose: true,
                content: '<div class="layui-carousel" id="preview_img_carousel_box" ><div carousel-item></div></div>',
                success: function (layero, index) {
                    async function carouselLayoutRender() {
                        let content = '';
                        for (let i = 0, l = src_arr.length; i < l; i++) {
                            await ((src) => {
                                return new Promise((resolve, reject) => {
                                    yunj.previewImgStyle(src, {
                                        width: areaW,
                                        height: areaH,
                                    }).then(function (style) {
                                        let imgContent = `<div><img src="${src}" alt="" ${style}></div>`;
                                        resolve(imgContent);
                                    });
                                }).then((img_content) => {
                                    content += img_content;
                                });
                            })(src_arr[i]);
                        }
                        return content;
                    }

                    carouselLayoutRender().then((content) => {
                        $(layero).find('#preview_img_carousel_box div[carousel-item]').html(content);
                        layui.use('carousel', function () {
                            let carousel = layui.carousel;

                            carousel.render({
                                elem: $(layero).find('#preview_img_carousel_box'),
                                width: '100%',
                                height: '100%',
                                arrow: 'always',
                                autoplay: false,
                                index: idx,
                            });

                            // 移动端滑动切换
                            $(layero).find('#preview_img_carousel_box').on('touchstart', function (e) {
                                let startX = e.originalEvent.targetTouches[0].pageX;

                                $(this).on('touchmove', function (e) {
                                    // 阻止手机浏览器默认事件
                                    arguments[0].preventDefault();
                                });

                                $(this).on('touchend', function (e) {
                                    let endX = e.originalEvent.changedTouches[0].pageX;
                                    // 停止DOM事件逐层往上传播
                                    e.stopPropagation();
                                    if (endX - startX > 30) {
                                        // 上一页
                                        $(this).find('.layui-carousel-arrow[lay-type=sub]').click();
                                    }
                                    if (startX - endX > 30) {
                                        // 下一页
                                        $(this).find('.layui-carousel-arrow[lay-type=add]').click();
                                    }
                                    $(this).off('touchmove touchend');
                                });
                            });

                        });
                    });
                }
            };
            return yunj.isExistParent() ? top.layer.open(popupArgs) : layer.open(popupArgs);
        }

        /**
         * 关闭（tab子页面/popup弹出层页面）
         * @param {string} idx [关闭页面的索引/tab_id]
         */
        close(idx) {
            if (idx.length === 32 && yunj.isTabPage()) {
                yunj.isExistParent() ? top.yunj.page.closeTab(idx) : yunj.page.closeTab(idx);
            } else {
                top.layer.close(idx);
            }
        }

        /**
         * 关闭当前页面（tab子页面/popup弹出层页面）
         */
        closeCurr() {
            let idx = yunj.isTabPage() ? yunj.currTabPageId()
                : (yunj.isExistParent() ? top.layer.getFrameIndex(win.name) : layer.getFrameIndex(win.name));
            if (idx) yunj.close(idx);
        }

        /**
         * 关闭所有页面（tab子页面/popup弹出层页面）
         */
        closeAll() {
            // 关闭所有tab子页面
            $('.layui-tab-title li[lay-id]', top.document).find('.layui-tab-close').click();
            // 关闭popup弹出层
            yunj.isExistParent() ? top.layer.closeAll() : layer.closeAll();
        }

        /**
         * 网络请求
         * @param {string|object} url   请求地址或参数对象
         * @param {null|object} data    请求参数
         * @param {string} type         请求类型默认get
         * @return {Promise<any>}
         */
        request(url, data = null, type = "get") {
            let args = {
                url: "",
                data: null,
                headers: {},
                type: "get",
                dataType: "json",
                loading: false,
                complete: null
            };
            if (yunj.isObj(url)) {
                args = Object.assign({}, args, url);
            } else {
                args.url = url;
                args.data = data;
                args.type = type;
            }

            let loading = {enable: false, tips: ""};
            if (yunj.isBool(args.loading)) loading.enable = args.loading;
            else if (yunj.isObj(args.loading)) loading = yunj.objSupp(args.loading, loading);
            args.loading = loading;

            return yunj.ajaxRequest(args);
        }

        /**
         * AJAX 请求
         * @param args
         * @return {Promise<unknown>}
         */
        ajaxRequest(args) {
            return new Promise((resolve, reject) => {
                if (args.loading.enable) args.loading.index = args.loading.tips ? yunj.msg(args.loading.tips, 'load', 60 * 60 * 1000) : yunj.load();
                let ajaxArgs = {
                    url: args.url,
                    data: args.data,
                    headers: args.headers,
                    type: args.type,
                    cache: false,
                    dataType: args.dataType,
                    // 由服务器返回，并根据dataType参数进行处理后的数据、描述状态的字符串
                    success: function (res, textStatus) {
                        if (yunj.isObj(res) && res.hasOwnProperty("errcode") && yunj.isNumber(res.errcode) && res.errcode !== 0) {
                            if (res.errcode === yunj.config('def.confirm_errcode')) {
                                yunj.responseConfirmHandle(resolve, reject, args, res);
                                return;
                            }
                            reject(res);
                        } else {
                            yunj.responseSuccessMsg(res);
                            resolve(res);
                        }
                    },
                    // XMLHttpRequest对象、错误信息、捕获的错误对象
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        reject({errcode: 10000, msg: "网络异常", data: null});
                    },
                    // XMLHttpRequest对象和一个描述成功请求类型的字符串
                    complete: function (XMLHttpRequest, textStatus) {
                        if (args.loading.enable) yunj.close(args.loading.index);
                        args.complete && args.complete(XMLHttpRequest, textStatus);
                    }
                };
                if (args.hasOwnProperty('processData')) {
                    ajaxArgs.processData = args.processData;
                }
                if (args.hasOwnProperty('contentType')) {
                    ajaxArgs.contentType = args.contentType;
                }
                $.ajax(ajaxArgs);
            });
        }

        /**
         * 响应需确认的处理
         * @param resolve
         * @param reject
         * @param {object} args ajax请求参数
         * @param {object} response 响应结果
         */
        responseConfirmHandle(resolve, reject, args, response) {
            yunj.confirm(response.msg, function () {
                // 确认
                if (!args.headers) {
                    args.headers = {};
                }
                args.headers[yunj.config('def.confirmed_header_key')] = true;
                yunj.ajaxRequest(args).then(res => {
                    resolve(res);
                }).catch(e => {
                    reject(e);
                });
            }, function () {
                // 取消
                resolve(response);
            });
        }

        /**
         * 获取响应结果的成功提示
         * @param res
         * @return {*|string}
         */
        responseSuccessMsg(res) {
            if (res.errcode === 0 && res.msg !== yunj.config('def.success_msg')) {
                yunj.msg(res.msg);
            }
        }

        /**
         * 表单字段
         * @param {string|function} type     [字段类型]
         * @param {object} options  [配置项]
         * {
         *      formId:"",  // 表单id
         *      tab:"",     // 选项卡非必须
         *      key:"",     // 字段key
         *      args:{},    // 字段配置
         * }
         * @returns {Promise<any>}
         */
        formField(type, options = {}) {
            if (yunj.isFunction(type)) {
                options.args.html = type(options.formId);
                type = 'custom';
            }

            options = Object.assign({}, {
                formId: null,
                tab: '',
                key: '',
                args: {},
            }, options);
            return new Promise(resolve => {
                type = `FormField${type.slice(0, 1).toUpperCase() + type.slice(1)}`;
                layui.use(type, () => {
                    resolve(new layui[type](options));
                });
            });
        }

        /**
         * 清空表单数据
         * @param {string} formId
         */
        formClear(formId) {
            $(doc).trigger(`yunj_form_${formId}_clear`);
        }

        /**
         * 重置表单数据
         * @param {string} formId
         */
        formReset(formId) {
            $(doc).trigger(`yunj_form_${formId}_reset`);
        }

        /**
         * 获取表单数据
         * @param {string} formId   表单id
         * @param validate  验证器实例（layui.use("validate",()=>function(let validate = layui.validate;))）
         * @returns {{}}
         */
        formData(formId, validate = null) {
            let data = {};
            let verifyArgs = {
                enable: !!validate,
                rule: {},
                data: {},
                dataTitle: {}
            };
            $(doc).trigger(`yunj_form_${formId}_submit`, [data, verifyArgs]);
            if (verifyArgs.enable) validate.rule(verifyArgs.rule).checkTips(verifyArgs.data, verifyArgs.dataTitle);
            return data;
        }

        /**
         * 根据表达那id获取表单对象
         * @param id
         */
        formObj(id) {
            if (yunj.hasOwnProperty('form') && yunj.form.hasOwnProperty(id)) {
                return yunj.form[id];
            }
            return null;
        }

        /**
         * 生成字段id
         * @param {string} formId   表单id
         * @param {string} key      配置的字段key
         * @return {string}
         */
        generateFormFieldId(formId, key) {
            let that = this;
            return formId + `_${key}`;
        }

        /**
         * 表格表头模板
         * @param {string} templet
         * @param {object} args
         * {
         *      tableId:"",
         *      state:"",
         *      key:"",
         *      args:{}
         * }
         * @returns {Promise<any>}
         */
        tableCol(templet, args) {
            return new Promise((resolve, reject) => {
                try {
                    templet = /\s/.test(templet) ? "TableColCustom" : `TableCol${templet.slice(0, 1).toUpperCase() + templet.slice(1)}`;
                    layui.use(templet, () => {
                        resolve(new layui[templet](args));
                    });
                } catch (e) {
                    console.log(e);
                }
            });
        }

        /**
         * 引入指定src的js
         * @param {string} src
         * @returns {Promise<string>}
         */
        async includeJs(src) {
            let isExist = false;
            if ($(`script[src='${src}']`).length > 0) isExist = true;
            if (isExist) return 'done';
            // 加载
            await new Promise(resolve => {
                let script = doc.createElement('script');
                script.type = 'text/javascript';
                script.async = true;
                script.src = src;
                script.onload = function () {
                    resolve('done');
                };
                doc.getElementsByTagName('head')[0].appendChild(script);
            });
            return 'done';
        }

        /**
         * 引入指定href的css
         * @param {string} href
         * @returns {Promise<string>}
         */
        async includeCss(href) {
            let isExist = false;
            if ($(`link[href='${href}']`).length > 0) isExist = true;
            if (isExist) return 'done';
            // 加载
            await new Promise(resolve => {
                let link = doc.createElement('link');
                link.type = 'text/css';
                link.rel = 'stylesheet';
                link.async = true;
                link.href = href;
                link.onload = function () {
                    resolve('done');
                };
                doc.getElementsByTagName('head')[0].appendChild(link);
            });
            return 'done';
        }

        /**
         * 引入xlsx_style资源
         * @returns {Promise<string>}
         */
        async includeXlsxStyle() {
            await yunj.includeJs("/static/yunj/libs/xlsx_style/libs/xlsx.core.min.js");
            await yunj.includeJs("/static/yunj/libs/xlsx_style/libs/xlsx.style.min.js");
            return "done";
        }

        /**
         * 文件内容获取
         * @param url
         * @param data_type
         * @returns {Promise<any>}
         */
        file_content(url, data_type = 'json') {
            url = yunj.urlPushParam(url, 'v', win.YUNJ_VERSION);
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: url,
                    type: 'get',
                    dataType: data_type,
                    cache: true,
                    success: function (content) {
                        resolve(content);
                    },
                    error: function () {
                        reject('unknow error');
                    }
                });
            });
        }

        /**
         * 地区选项获取
         * @returns {Promise<any>}
         */
        area_options() {
            return new Promise((resolve, reject) => {
                if (yunj.hasOwnProperty('attr_area_options') && yunj.isObj(yunj.attr_area_options)) {
                    resolve(yunj.attr_area_options);
                } else {
                    yunj.file_content('/static/yunj/json/area.json').then(options => {
                        yunj.attr_area_options = options;
                        resolve(yunj.attr_area_options);
                    });
                }
            });
        }

        /**
         * 图标选项获取
         * @returns {Promise<any>}
         */
        icon_options() {
            return new Promise((resolve, reject) => {
                if (yunj.hasOwnProperty('attr_icon_options') && yunj.isArray(yunj.attr_icon_options)) {
                    resolve(yunj.attr_icon_options);
                } else {
                    yunj.file_content('/static/yunj/json/icon.json').then(options => {
                        yunj.attr_icon_options = options;
                        resolve(yunj.attr_icon_options);
                    });
                }
            });
        }

        /**
         * 复制
         * @param str
         * @returns {boolean}
         */
        copy(str) {
            if (!yunj.isString(str) || str.length <= 0) return false;
            let input = doc.createElement('input');
            input.value = str;
            doc.body.appendChild(input);
            input.select();                 // 选择对象
            doc.execCommand("Copy");   // 执行浏览器复制命令
            input.remove();
            yunj.msg('复制成功', null, 500);
            return true;
        }

        /**
         * markdown转html
         * @param id                        容器id
         * @param {object|string} options   markdown文档|配置对象
         * @return {Promise<void>}
         */
        async markdownToHtml(id, options) {
            let defaults = {
                markdown: "",
                htmlDecode: "style,script,iframe",  // you can filter tags decode
                tocm: true,
                emoji: true,
                taskList: true,
                tex: true,  // 默认不解析
                flowChart: true,  // 默认不解析
                sequenceDiagram: true,  // 默认不解析
            };
            if (yunj.isString(options)) options = {markdown: options};
            options = Object.assign({}, defaults, options || {});
            win.jQuery = $;
            win.$ = $;
            await yunj.includeCss("/static/yunj/libs/editor.md/css/editormd.preview.css");
            await yunj.includeJs("/static/yunj/libs/editor.md/lib/marked.min.js");
            await yunj.includeJs("/static/yunj/libs/editor.md/lib/prettify.min.js");
            await yunj.includeJs("/static/yunj/libs/editor.md/lib/raphael.min.js");
            await yunj.includeJs("/static/yunj/libs/editor.md/lib/underscore.min.js");
            await yunj.includeJs("/static/yunj/libs/editor.md/lib/sequence-diagram.min.js");
            await yunj.includeJs("/static/yunj/libs/editor.md/lib/flowchart.min.js");
            await yunj.includeJs("/static/yunj/libs/editor.md/lib/jquery.flowchart.min.js");
            await yunj.includeJs("/static/yunj/libs/editor.md/editormd.min.js");
            await yunj.tryExec(function () {
                editormd.markdownToHTML(id, options);
            });
        }

        /**
         * 生成随机字符串
         * @param len
         * @return {string}
         */
        randStr(len = 32) {
            let strPol = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
            let strPolLen = strPol.length;
            let str = "";
            for (let i = 0; i < len; i++) str += strPol.charAt(Math.floor(Math.random() * strPolLen));
            return str;
        }

        /**
         * AES数据加密
         * @param {string} data  源数据
         * @param {string} key
         * @param {string} iv
         * @return {Promise<string>}
         */
        async aesEncrypt(data, key, iv) {
            await yunj.includeJs('/static/yunj/libs/crypto-js/crypto-js.js');
            return await yunj.tryExec(function () {
                data = CryptoJS.enc.Utf8.parse(data);
                key = CryptoJS.enc.Utf8.parse(key.substr(0, 16));
                iv = CryptoJS.enc.Utf8.parse(iv.substr(0, 16));
                let encrypted = CryptoJS.AES.encrypt(data, key, {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                });
                // 加密结果base64加密
                return btoa(encrypted.toString());
            });
        }

        /**
         * AES数据解密
         * @param {string} encrypted 密文
         * @param {string} key
         * @param {string} iv
         * @return {Promise<string>}
         */
        async aesDecrypt(encrypted, key, iv) {
            await yunj.includeJs('/static/yunj/libs/crypto-js/crypto-js.js');
            return await yunj.tryExec(function () {
                key = CryptoJS.enc.Utf8.parse(key.substr(0, 16));
                iv = CryptoJS.enc.Utf8.parse(iv.substr(0, 16));
                // 加密数据base64解密
                let decrypted = CryptoJS.AES.decrypt(atob(encrypted), key, {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                });
                return decrypted.toString(CryptoJS.enc.Utf8);
            });
        }

        /**
         * RSA数据加密
         * @param {string} data  源数据
         * @param {string} publicKey 公钥
         * @return {Promise<string>}
         */
        async rsaEncrypt(data, publicKey) {
            await yunj.includeJs('/static/yunj/libs/jsencrypt/bin/jsencrypt.min.js');
            return await yunj.tryExec(function () {
                let encrypt = new JSEncrypt();
                encrypt.setPublicKey(publicKey);
                return encrypt.encrypt(data);
            });
        }

        /**
         * RSA解密
         * @param {string} encrypted     密文
         * @param {string} privateKey    私钥
         * @return {Promise<string>}
         */
        async rsaDecrypt(encrypted, privateKey) {
            await yunj.includeJs('/static/yunj/libs/jsencrypt/bin/jsencrypt.min.js');
            return await yunj.tryExec(function () {
                let decrypt = new JSEncrypt();
                decrypt.setPrivateKey(privateKey);
                return decrypt.decrypt(encrypted);
            });
        }

        /**
         * RSA数据签名
         * @param {string} data          数据
         * @param {string} privateKey    私钥
         * @return {Promise<string>}
         */
        async rsaSign(data, privateKey) {
            await yunj.includeJs('/static/yunj/libs/crypto-js/crypto-js.js');
            await yunj.includeJs('/static/yunj/libs/jsencrypt/bin/jsencrypt.min.js');
            return await yunj.tryExec(function () {
                let jsEncrypt = new JSEncrypt();
                jsEncrypt.setPrivateKey(privateKey);
                return jsEncrypt.sign(data, CryptoJS.SHA1, "sha1");
            });
        }

        /**
         * RSA数据验签
         * @param {string} data          数据
         * @param {string} sign          签名
         * @param {string} publicKey     公钥
         * @return {Promise<boolean>}
         */
        async rsaSignVerify(data, sign, publicKey) {
            await yunj.includeJs('/static/yunj/libs/crypto-js/crypto-js.js');
            await yunj.includeJs('/static/yunj/libs/jsencrypt/bin/jsencrypt.min.js');
            return await yunj.tryExec(function () {
                let jsEncrypt = new JSEncrypt();
                jsEncrypt.setPublicKey(publicKey);
                return jsEncrypt.verify(data, sign, CryptoJS.SHA1);
            });
        }

        /**
         * 尝试执行
         * @param callback
         * @param timeout
         * @return {Promise<*>}
         */
        async tryExec(callback, timeout = 200) {
            if (!yunj.isFunction(callback)) return;
            while (true) {
                try {
                    return callback();
                } catch (e) {
                    await new Promise(resolve => setTimeout(resolve, timeout));
                }
            }
        }

        /**
         * 驼峰格式转换为下划线分割（兼容首字母大小写情况）
         * @param {string} str
         * @return {string}
         */
        uppercaseToUnderline(str) {
            return str.replace(/(?<=[a-z])([A-Z])/, "_$1").toLowerCase();
        }

        /**
         * 下划线转换为驼峰格式
         * @param {string} str
         * @param {boolean} hasFirst 是否首字母大写
         * @return {string}
         */
        underlineToUppercase(str, hasFirst = false) {
            let strArr = str.split("_");
            let res = hasFirst ? "" : strArr[0];
            for (let i = hasFirst ? 0 : 1, l = strArr.length; i < l; i++) {
                res += strArr[i].slice(0, 1).toUpperCase() + strArr[i].slice(1);
            }
            return res;
        }

        /**
         * md5加密字符串
         * @param {string} str
         * @return {string}
         */
        md5(str) {
            return md5(str);
        }

        /**
         * file转base64
         * @param file
         * @returns {Promise<any>}
         */
        fileToBase64(file) {
            return new Promise(resolve => {
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (e) => {
                    resolve(e.target.result);
                };
            });
        }

        /**
         * 解析base64中的数据信息
         * @param data
         * @returns {{mime, data}}
         */
        parseBase64(data) {
            let arr = data.split(',');
            let mime = arr[0].match(/:(.*?);/)[1];
            return {mime: mime, data: arr[1]};
        }

        /**
         * base64转uint8
         * @param data
         * @returns {Uint8Array}
         */
        base64ToUint8Array(data) {
            let parsedBase64 = yunj.parseBase64(data);

            let bstr = atob(parsedBase64.data);
            let n = bstr.length;
            let u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return u8arr;
        }

        /**
         * base64转blob
         * @param data
         * @returns {Blob}
         */
        base64ToBlob(data) {
            let parsedBase64 = yunj.parseBase64(data);
            let u8arr = yunj.base64ToUint8Array(data);
            return new Blob([u8arr], {type: parsedBase64.mime});
        }

        /**
         * blob转file
         * @param data
         * @returns {*}
         */
        blobToFile(data) {
            let date = new Date();

            data.lastModifiedDate = date;
            data.lastModified = date.getTime();
            data.name = data.type.replace('/', '.');
            return data;
        }

        /**
         * base64转file
         * @param data
         * @returns {*}
         */
        base64ToFile(data) {
            let file = null;
            if (win.File !== undefined) {
                let parsedBase64 = yunj.parseBase64(data);
                let u8arr = yunj.base64ToUint8Array(data);
                file = new File([u8arr], parsedBase64.mime.replace('/', '.'), {
                    type: parsedBase64.mime
                });
            } else {
                file = yunj.blobToFile(yunj.base64ToBlob(data));
            }
            return file;
        }

        /**
         * 设置localStorage
         * @param {string} key  键名
         * @param {string|object|array} value    键值
         * @param {number} ttl  有效期，单位s
         */
        setLocalStorage(key, value, ttl = 0) {
            value = JSON.stringify({
                ttl: ttl,   // 有效时间
                setTime: yunj.currTimestamp(), // 设置时间
                value: value,
            });
            localStorage.setItem(key, value);
        }

        /**
         * 获取localStorage
         * @param {string} key  键名
         * @param {*} def   默认返回值（不存在/过期时）
         */
        getLocalStorage(key, def = '') {
            let value = localStorage.getItem(key);
            if (value === null) return def;
            value = JSON.parse(value);
            if (value.ttl > 0 && yunj.currTimestamp() > (value.setTime + value.ttl)) {
                yunj.clearLocalStorage(key);
                return def;
            }
            return value.value;
        }

        /**
         * 删除localStorage
         * @param keys
         */
        clearLocalStorage(...keys) {
            if (keys.length <= 0) {
                localStorage.clear();
                return;
            }
            keys.forEach(key => {
                localStorage.removeItem(key);
            });
        }

        /**
         * 图标class
         * @param {string} classVal
         * @return {string}
         */
        iconClass(classVal) {
            if (!classVal || !yunj.isString(classVal)) {
                return classVal;
            }
            if (classVal.indexOf('layui-icon-') !== -1 && classVal.indexOf('layui-icon ') === -1) {
                classVal = 'layui-icon ' + classVal;
            } else if (classVal.indexOf('yunj-icon-') !== -1 && classVal.indexOf('yunj-icon ') === -1) {
                classVal = 'yunj-icon ' + classVal;
            }
            return classVal;
        }

        /**
         * 字符串首字母大写
         * @param str
         * @return {string|*}
         */
        ucfirst(str) {
            if (!yunj.isString(str) || !str) {
                return str;
            }
            return str.slice(0, 1).toUpperCase() + str.slice(1);
        }

        /**
         * 判断是否为base64字符串
         * @param {*} data
         * @return {boolean}
         */
        isBase64(data) {
            if (!data || !yunj.isString(data)) {
                return false;
            }
            try {
                return win.btoa(win.atob(data)) === data;
            } catch (err) {
                return false;
            }
        }

        /**
         * base64编码
         * @param {string} data
         * @return {string}
         */
        base64Encode(data) {
            // 确保可以处理中文
            const encoder = new TextEncoder();
            const uint8Array = encoder.encode(data);
            return btoa(String.fromCharCode(...new Uint8Array(uint8Array)));
        }

        /**
         * base64解码
         * @param {string} data
         * @return {string}
         */
        base64Decode(data) {
            if (!yunj.isBase64(data)) {
                return data;
            }
            // 确保中文不会乱码
            let decoder = new TextDecoder('utf-8');
            let binaryString = atob(data);
            return decoder.decode(new Uint8Array(binaryString.split('').map(char => char.charCodeAt(0))));
        }

        /**
         * 生成栅格布局class
         * @param {array} grid
         * 示例：[12, 6, 3, 2, 2]
         * 表示：超小屏幕(手机<768px)占12格、小屏幕(平板≥768px)占6格、中等屏幕(桌面≥992px)占3格、大型屏幕(桌面≥1200px)占2格、超大屏幕(桌面≥1400px)占2格
         * 示例：[12, 6, 3, "2 l10", "2 r10"]
         * 表示：超小屏幕占12格；小屏幕占6格；中等屏幕占3格；大型屏幕左侧空10格、占2格；超大屏幕右侧空10格、占2格
         * @return {string}
         */
        generateGridClass(grid) {
            let gridClass = "";
            let markArr = ['xs', 'sm', 'md', 'lg', 'xl'];
            for (let i = 0; i < grid.length; i++) {
                let mark = markArr[i];
                if (!mark) {
                    break;
                }

                let vals = yunj.trim(grid[i].toString()).replace(/\s+/g, ' ').split(' ');
                let num = null;
                let leftOffset = null;
                let rightOffset = null;
                for (let i = 0; i < vals.length; i++) {
                    let val = vals[i];
                    if (!val) {
                        continue;
                    }
                    if (yunj.isPositiveInt(val) && val <= 12) {
                        num = val;
                        continue;
                    }
                    let firstChar = val.substr(0, 1);
                    let offsetNum = val.substr(1);
                    if ((firstChar === 'l' || firstChar === 'r') && yunj.isPositiveInt(offsetNum) && offsetNum <= 12) {
                        if (firstChar === 'l') {
                            leftOffset = offsetNum;
                        } else {
                            rightOffset = offsetNum;
                        }
                    }
                }
                if (!num) {
                    continue;
                }
                gridClass += ` layui-col-${mark + num}`;
                if (leftOffset) {
                    gridClass += ` layui-col-${mark}-offset${leftOffset}`;
                }
                if (rightOffset) {
                    gridClass += ` yunj-col-${mark}-offset${rightOffset}`;
                }
            }
            return gridClass;
        }

        /**
         * 获取登录的member_id
         * @return {number}
         */
        getLoginMemberId() {
            let memberIdEl = $(top.document).find('#member_id');
            let memberId;
            if (memberIdEl.length > 0) {
                memberId = memberIdEl.val();
            }
            return memberId || 0;
        }

    }

    if (!win.hasOwnProperty('yunj') || !yunj.hasOwnProperty('version')) win.yunj = new Yunj();

    exports('yunj', win.yunj);
});
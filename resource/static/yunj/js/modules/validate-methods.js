/**
 * validateMethods（验证器方法）
 */
layui.define(['yunj'], function (exports) {

    let validateMethods = {
        // 必填
        method_require: (value, rule = '', data = {}) => {
            if ((!value && value !== 0) || value === null || yunj.isUndefined(value) || yunj.isEmptyString(value) || yunj.isEmptyArray(value) || yunj.isEmptyObj(value)) return '不能为空';
            return true;
        },

        // 字符串中的字符是否都是数字
        method_number: (value, rule = '', data = {}) => {
            return yunj.defaultRegex.number.test(value) ? true : '需由数字组成';
        },

        // 整数含0
        method_integer: (value, rule = '', data = {}) => {
            return yunj.defaultRegex.integer.test(value) ? true : '需为整数';
        },

        // 正整数
        method_positiveInt: (value, rule = '', data = {}) => {
            if (yunj.isPositiveInt(value)) return true;
            return '需为正整数';
        },

        // 正整数
        method_positiveInteger: (value, rule = '', data = {}) => {
            if (yunj.isPositiveInteger(value)) return true;
            return '需为正整数';
        },

        // 非负整数
        method_nonnegativeInt: (value, rule = '', data = {}) => {
            if (yunj.isNonnegativeInt(value)) return true;
            return '需为非负整数';
        },

        // 非负整数
        method_nonnegativeInteger: (value, rule = '', data = {}) => {
            if (yunj.isNonnegativeInteger(value)) return true;
            return '需为非负整数';
        },

        // 非负数
        method_nonnegativeNum: (value, rule = '', data = {}) => {
            if (yunj.isNonnegativeNum(value)) return true;
            return '需为非负整数';
        },

        // 非负数
        method_nonnegativeNumber: (value, rule = '', data = {}) => {
            if (yunj.isNonnegativeNum(value)) return true;
            return '需为非负整数';
        },

        // 浮点数
        method_float: (value, rule = '', data = {}) => {
            return yunj.isFloat(value) ? true : '需为浮点数';
        },

        // 布尔值
        method_boolean: (value, rule = '', data = {}) => {
            return yunj.isBool(value) ? true : '需为布尔值';
        },

        // 布尔值
        method_bool: (value, rule = '', data = {}) => {
            return yunj.isBool(value) ? true : '需为布尔值';
        },

        // 长度是否在某个范围
        method_length: (value, rule = '', data = {}) => {
            if (!rule || rule.length <= 0) return `验证规则[length]错误`;
            let valLen = value.toString().length;
            if (rule.indexOf(',') === -1) {
                let limitLen = rule | 0;
                if (validateMethods.method_positiveInteger(limitLen) !== true) return `验证规则[length]参数需为正整数`;
                return valLen === limitLen ? true : `限制长度${limitLen}`;
            }
            let limitLenArr = rule.split(',');
            if (limitLenArr.length !== 2) return '验证规则[length]参数需为“,”间隔的两个正整数';
            let [limitMinLen, limitMaxLen] = limitLenArr;
            if (validateMethods.method_positiveInteger(limitMinLen) !== true || validateMethods.method_positiveInteger(limitMaxLen) !== true) return '验证规则[length]参数需为“,”间隔的两个正整数';
            return valLen >= limitMinLen && valLen <= limitMaxLen ? true : `限制长度区间${limitMinLen}-${limitMaxLen}`;
        },

        // 最小长度
        method_min: (value, rule = '', data = {}) => {
            let minLen = rule | 0;
            let valLen = value.toString().length;
            return valLen >= minLen ? true : `限制最小长度${minLen}`;
        },

        // 最大长度
        method_max: (value, rule = '', data = {}) => {
            let maxLen = rule | 0;
            let valLen = value.toString().length;
            return valLen <= maxLen ? true : `限制最大长度${maxLen}`;
        },

        // 是否在某个范围
        method_in: (value, rule = '', data = {}) => {
            if (!rule) return '验证规则[in]错误';
            rule = rule.split(','); // rule 里面的元素会被转换为字符串
            if (rule.length <= 0) return '验证规则[in]错误';
            return rule.indexOf(value.toString()) !== -1 ? true : '错误';
        },

        // 是否不在某个范围
        method_notIn: (value, rule = '', data = {}) => {
            if (!rule) return '验证规则[notIn]错误';
            rule = rule.split(','); // rule 里面的元素会被转换为字符串
            if (rule.length <= 0) return '验证规则[notIn]错误';
            return rule.indexOf(value.toString()) === -1 ? true : "错误";
        },

        // 是否在某个区间
        method_between: (value, rule = '', data = {}) => {
            if (!rule) return '验证规则[between]错误';
            rule = rule.split(',');
            if (rule.length !== 2) return '验证规则[between]错误';
            let [min, max] = rule;
            return value < min || value > max ? '错误' : true;
        },

        // 是否不在某个区间
        method_notBetween: (value, rule = '', data = {}) => {
            if (!rule) return '验证规则[notBetween]错误';
            rule = rule.split(',');
            if (rule.length !== 2) return '验证规则[notBetween]错误';
            let [min, max] = rule;
            return value < min || value > max ? true : "错误";
        },

        // 是否等于某个值
        method_eq: (value, rule = '', data = {}) => {
            if (!rule || rule.length <= 0) return '验证规则[eq]错误';
            return (value | 0) === (rule | 0) ? true : "错误";
        },

        // 是否大等于某个值
        method_egt: (value, rule = '', data = {}) => {
            if (!rule || rule.length <= 0) return '验证规则[egt]错误';
            return (value | 0) >= (rule | 0) ? true : "错误";
        },

        // 是否大于某个值
        method_gt: (value, rule = '', data = {}) => {
            if (!rule || rule.length <= 0) return '验证规则[gt]错误';
            return (value | 0) > (rule | 0) ? true : "错误";
        },

        // 是否小等于某个值
        method_elt: (value, rule = '', data = {}) => {
            if (!rule || rule.length <= 0) return '验证规则[gt]错误';
            return (value | 0) <= (rule | 0) ? true : "错误";
        },

        // 是否小于某个值
        method_lt: (value, rule = '', data = {}) => {
            if (!rule || rule.length <= 0) return '验证规则[gt]错误';
            return (value | 0) < (rule | 0) ? true : "错误";
        },

        // 数组
        method_array: (value, rule = '', data = {}) => {
            return yunj.isArray(value) ? true : '错误';
        },

        // 一维数组里面的值只能为rule的值
        method_arrayIn: (value, rule = '', data = {}) => {
            if (!yunj.isArray(value)) return "错误";
            if (yunj.isEmptyArray(value)) return "不能为空";
            if (!rule) return '验证规则[arrayIn]错误';
            let ruleArr = rule.indexOf(',') === -1 ? [rule] : rule.split(',');
            return yunj.array_in(value, ruleArr) ? true : '错误';
        },

        // 一维数组为空或者里面的值只能为rule的值
        method_arrayEmptyOrIn: (value, rule = '', data = {}) => {
            if (!yunj.isArray(value)) return "格式错误";
            if (yunj.isEmptyArray(value)) return true;
            if (!rule || rule.indexOf(',') === -1) return '验证规则[arrayEmptyOrIn]错误';
            rule = rule.split(',');
            return yunj.array_in(value, rule) ? true : '错误';
        },

        // 数组元素为正整数
        method_arrayPositiveInt: (value, rule = '', data = {}) => {
            if (!yunj.isArray(value)) return "格式错误";
            if (value.length <= 0) return "不能为空";
            return yunj.isPositiveIntArray(value) ? true : "需为正整数数组";
        },

        // 数组为空或者元素为正整数
        method_arrayEmptyOrPositiveInt: (value, rule = '', data = {}) => {
            if (!yunj.isArray(value)) return "格式错误";
            if (yunj.isEmptyArray(value)) return true;
            return yunj.isPositiveIntArray(value) ? true : "需为正整数数组";
        },

        // 对象里面的值只能为rule的值
        method_mapHas: (value, rule = '', data = {}) => {
            if (!yunj.isObj(value)) return "格式错误";
            if (yunj.isEmptyObj(value)) return "不能为空";
            if (!rule || rule.indexOf(',') === -1) return '验证规则[mapHas]错误';
            rule = rule.split(',');
            let valueKeys = Object.keys(value);
            return yunj.arrayDiff(valueKeys, rule).length <= 0 ? true : '错误';
        },

        // 对象为空或者里面的值只能为rule的值
        method_mapEmptyOrHas: (value, rule = '', data = {}) => {
            if (!yunj.isObj(value)) return "格式错误";
            if (yunj.isEmptyObj(value)) return true;
            if (!rule || rule.indexOf(',') === -1) return '验证规则[mapEmptyOrHas]错误';
            rule = rule.split(',');
            let valueKeys = Object.keys(value);
            return yunj.arrayDiff(valueKeys, rule).length <= 0 ? true : '错误';
        },

        // 二维数组元素的key必须包含给定的规则里面的值
        method_arrayItemHas: (value, rule = '', data = {}) => {
            if (!yunj.isArray(value)) return "格式错误";
            if (value.length <= 0) return "不能为空";
            if (!rule) return '验证规则[arrayItemHas]错误';
            rule = rule.split(',');
            for (let i = 0; i < value.length; i++) {
                let vv = value[i];
                if (!yunj.isObj(vv)) {
                    return `[${i}]格式错误`;
                }
                if (yunj.isEmptyObj(vv)) {
                    return `[${i}]不能为空`;
                }
                let vvKeys = Object.keys(vv);
                if (yunj.arrayDiff(vvKeys, rule).length > 0) {
                    return `[${i}]错误`;
                }
            }
            return true;
        },

        // 二维数组为空或元素的key必须包含给定的规则里面的值
        method_arrayEmptyOrItemHas: (value, rule = '', data = {}) => {
            if (!yunj.isArray(value)) return "格式错误";
            if (value.length <= 0) return true;
            if (!rule) return '验证规则[arrayEmptyOrItemHas]错误';
            rule = rule.split(',');
            for (let i = 0; i < value.length; i++) {
                let vv = value[i];
                if (!yunj.isObj(vv)) {
                    return `[${i}]格式错误`;
                }
                if (yunj.isEmptyObj(vv)) {
                    return `[${i}]不能为空`;
                }
                let vvKeys = Object.keys(vv);
                if (yunj.arrayDiff(vvKeys, rule).length > 0) {
                    return `[${i}]错误`;
                }
            }
            return true;
        },

        // 地区有效性
        method_area: (value, rule = '', data = {}) => {
            let accArr = ['province', 'city', 'district'];
            if (rule.length <= 0) rule = "district";
            if (accArr.indexOf(rule) === -1) return '验证规则 area 允许参数[province|city|district]';
            if (!yunj.hasOwnProperty('attr_area_options')) return '地区组件未加载';
            let options = yunj.attr_area_options;
            let acc = rule;
            if (!yunj.isObj(value)) return '数据异常';

            if (!value.hasOwnProperty('province') || value.province.toString().length <= 0) return '请选择省份';
            let provinceOptions = options[0];
            if (!provinceOptions.hasOwnProperty(value.province)) return '省份数据异常';
            if (acc === 'province') return true;

            if (!value.hasOwnProperty('city') || value.city.toString().length <= 0) return '请选择城市';
            let cityOptions = options[`0,${value.province}`];
            if (!cityOptions.hasOwnProperty(value.city)) return '城市数据异常';
            if (acc === 'city') return true;

            if (!value.hasOwnProperty('district') || value.district.toString().length <= 0) return '请选择区/县';
            let districtOptions = options[`0,${value.province},${value.city}`];
            if (!districtOptions.hasOwnProperty(value.district)) return '区/县数据异常';

            return true;
        },

        // 手机
        method_mobile: (value, rule = '', data = {}) => {
            return yunj.defaultRegex.mobile.test(value) ? true : '需为11位有效手机格式';
        },

        // 邮箱
        method_email: (value, rule = '', data = {}) => {
            return yunj.defaultRegex.email.test(value) ? true : '需为有效邮箱格式';
        },

        // 汉字
        method_chs: (value, rule = '', data = {}) => {
            return yunj.defaultRegex.chs.test(value) ? true : '只能是汉字';
        },

        // 汉字/字母/数字
        method_chsAlphaNum: (value, rule = '', data = {}) => {
            return yunj.defaultRegex.chsAlphaNum.test(value) ? true : '只能是汉字/字母/数字';
        },

        // 汉字/字母/数字/下划线_/破折号-
        method_chsDash: (value, rule = '', data = {}) => {
            return yunj.defaultRegex.chsDash.test(value) ? true : '只能是汉字/字母/数字/下划线_/破折号-';
        },

        // 汉字/字母/数字/下划线_/短横线-/空格
        method_chsDashSpace(value, rule = '', data = {}) {
            return yunj.defaultRegex.chsDashSpace.test(value) ? true : '只能是汉字、字母、数字、下划线_、短横线-及空格组合';
        },

        // 字母/数字
        method_alphaNum(value, rule = '', data = {}) {
            return yunj.defaultRegex.alphaNum.test(value) ? true : '只能是字母/数字';
        },

        // 字母/数字/下划线_/短横线-
        method_alphaDash(value, rule = '', data = {}) {
            return yunj.defaultRegex.alphaDash.test(value) ? true : '只能是字母/数字/下划线_/短横线-';
        },

        // 16进制色号。例：#ffffff
        method_hexColor(value, rule = '', data = {}) {
            return yunj.defaultRegex.hexColor.test(value) ? true : '错误';
        },

        // 日期 yyyy-MM-dd 格式
        method_date(value, rule = '', data = {}) {
            return yunj.isDate(value) ? true : "错误";
        },

        // 日期时间 yyyy-MM-dd HH:mm:ss 格式
        method_datetime(value, rule = '', data = {}) {
            return yunj.isDatetime(value) ? true : "错误";
        },

        // 年 yyyy 格式
        method_year(value, rule = '', data = {}) {
            return yunj.isYear(value) ? true : "错误";
        },

        // 年月 yyyy-MM 格式
        method_yearMonth(value, rule = '', data = {}) {
            return yunj.isYearMonth(value) ? true : "错误";
        },

        // 月份 MM 格式
        method_month(value, rule = '', data = {}) {
            return yunj.isMonth(value) ? true : "错误";
        },

        // 时间 HH:mm:ss 格式
        method_time(value, rule = '', data = {}) {
            return yunj.isTime(value) ? true : "错误";
        },

        // 日期/时间等数据范围 {start:'xxx',end:'xxx'} 格式
        method_timeRange(value, rule = '', data = {}) {
            if (!yunj.isObj(value)) {
                let valueObj = {};
                if (yunj.isJson(value)) {
                    valueObj = JSON.parse(value);
                }
                value = yunj.isObj(valueObj) ? valueObj : {};
            }
            if (!value.hasOwnProperty('start') && !value.hasOwnProperty('end')) {
                return "错误";
            }
            let start = value.start || "";
            let end = value.end || "";
            if (!rule) return"验证规则[timeRange]的rule数据缺失";
            let checkCallName = 'is' + yunj.underlineToUppercase(rule,true);
            if (typeof yunj[checkCallName] !== 'function') {
                return `验证规则[timeRange:${rule}]错误`
            }
            if (start && !yunj[checkCallName](start)) {
                return "开始时间错误";
            }
            if (end && !yunj[checkCallName](end)) {
                return "结束时间错误";
            }
            if (start && end) {
                let startNum = parseInt(start.replace(/[^0-9]/g, ''));
                let endNum = parseInt(end.replace(/[^0-9]/g, ''));
                if (startNum > endNum) {
                    console.log(startNum, endNum,123);
                    return "开始时间不能大于结束时间";
                }
            }
            return true;
        },

        // 逗号“,”间隔的汉字/字母/数字组合
        method_commaIntervalChsAlphaNum: (value, rule = '', data = {}) => {
            return yunj.defaultRegex.commaIntervalChsAlphaNum.test(value) ? true : '错误';
        },

        // 逗号“,”间隔的正整数组合
        method_commaIntervalPositiveInt: (value, rule = '', data = {}) => {
            return yunj.defaultRegex.commaIntervalPositiveInt.test(value) ? true : '错误';
        },

        // url地址
        method_url: (value, rule = '', data = {}) => {
            return yunj.defaultRegex.url.test(value) ? true : '地址格式错误';
        },

        // url地址集合
        method_urls: (value, rule = '', data = {}) => {
            if (!yunj.isArray(value)) return '格式错误';
            if (!value) return true;
            for (let i = 0; i < value.length; i++) {
                if (!yunj.defaultRegex.url.test(value[i])) {
                    return `第${i + 1}个地址格式错误`;
                }
            }
            return true;
        },

        // ip地址（支持ipv4、ipv6格式）
        method_ip: (value, rule = '', data = {}) => {
            if (!yunj.isString(value)) return '格式错误';
            if (!yunj.defaultRegex.ip.test(value)) return '格式错误'
            return true;
        },

        // uri地址，/开头
        method_uri: (value, rule = '', data = {}) => {
            return yunj.defaultRegex.uri.test(value) ? true : '地址格式错误';
        },

    };

    exports('validateMethods', validateMethods);
});
/**
 * validate（验证器）
 * 传入scene，根据scene获取对应的校验规则checkRule
 * 不传scene，默认校验规则checkRule为所配置参数规则
 * 只校验校验规则checkRule内的参数
 */
layui.define(['yunj', "validateMethods"], function (exports) {

    let validateMethods = layui.validateMethods;

    class YunjValidate {

        constructor() {
            this._rule = {};     // 规则

            this._message = {};  // 提示消息

            this._scene = {};    // 验证环境

            this._error = [];    // 错误消息

            this._batch = false; // 是否批量验证

            this._methods = validateMethods;     // 验证方法

            this._methodsAppendRules = [];       // 验证方法补充的规则

            this._checkScene = "";      // 待验证环境

            this._checkRule = {};       // 待验证规则

            this._data = null;           // 待验证数据

            this._dataTitle = null;      // 待验证数据title
        }

        /**
         * 创建验证器
         * @param args
         * {
         *      rule:{
         *          "param1"=>"require|number",
         *          "param2"=>"require|number",
         *      },
         *      message:{
         *          "param1.require"=>"param1不能为空",
         *          "param1.number"=>"param1须由数字组成",
         *      },
         *      scene:{
         *          "test"=>["param1","param2"],
         *          "test2"=>["param1","param2"],
         *      },
         *      batch:true,
         *      methods:{
         *          test:(value,rule="",data={})=>{
         *              ...
         *              // 业务逻辑
         *              ...
         *              // 返回：bool|string
         *              return true;
         *          }
         *      }
         * }
         * @returns {YunjValidate}
         */
        create(args = {}) {
            let that = this;
            if (args.hasOwnProperty("rule")) that.rule(args.rule);
            if (args.hasOwnProperty("message")) that.message(args.message);
            if (args.hasOwnProperty("scene")) that.scene(args.scene);
            if (args.hasOwnProperty("batch")) that.batch(args.batch);
            if (args.hasOwnProperty("methods")) that.methods(args.methods);
            return that;
        }

        /**
         * 设置规则
         * @param rule
         * {
         *      "param1"=>"require|number",
         *      "param2"=>"require|number",
         * }
         * @returns {YunjValidate}
         */
        rule(rule = {}) {
            let that = this;
            that._rule = rule;
            return that;
        }

        /**
         * 设置提示消息
         * @param message
         * {
         *      "param1.require"=>"param1不能为空",
         *      "param1.number"=>"param1须由数字组成",
         * }
         * @returns {YunjValidate}
         */
        message(message = {}) {
            let that = this;
            that._message = message;
            return that;
        }

        /**
         * 设置验证场景
         * @param scene
         * {
         *      "test"=>["param1","param2"],
         *      "test2"=>["param1","param2"],
         * }
         * @returns {YunjValidate}
         */
        scene(scene = {}) {
            let that = this;
            that._scene = scene;
            return that;
        }

        /**
         * 设置错误消息
         * @param {string} field
         * @param {string} rule
         * @param {string} msg
         * @returns {YunjValidate}
         */
        setError(field, rule, msg) {
            let that = this;
            that._error.push({field: field, rule: rule, msg: msg});
            return that;
        }

        /**
         * 获取错误消息
         * @returns {string}
         */
        getError() {
            let that = this;
            return yunj.arrayColumn(that._error, 'msg').join(",");
        }

        /**
         * 获取字段对应的错误信息
         * @return {{}}
         */
        getFieldError() {
            let that = this;
            let error = {};
            that._error.forEach(err => {
                let field = err.field;
                if (!error.hasOwnProperty(field)) {
                    error[field] = '';
                }
                error[field] += (error[field] ? ',' : '') + err.msg;
            })
            return error;
        }

        /**
         * 获取原始的错误消息
         * @return {[]}
         */
        getRawError() {
            let that = this;
            return that._error;
        }

        /**
         * 设置是否批量验证
         * @param batch
         * @returns {YunjValidate}
         */
        batch(batch = false) {
            let that = this;
            that._batch = batch;
            return that;
        }

        /**
         * 追加验证规则对应方法
         * @param methods
         * {
         *      method1:(value,rule="",data={})=>{
         *          ...
         *          // 业务逻辑
         *          ...
         *          // 返回：bool|string
         *          return true;
         *      },
         *      method2:(value,rule="",data={})=>{
         *          ...
         *      }
         * }
         * @returns {YunjValidate}
         */
        methods(methods = {}) {
            let that = this;
            if (!yunj.isObj(methods)) {
                throw new Error('[methods]值错误');
            }
            let _methods = {};
            for (let k in methods) _methods[`method_${k}`] = methods[k];
            that._methods = Object.assign({}, _methods, that._methods);
            that._methodsAppendRules = Object.keys(methods);
            return that;
        }

        /**
         * 设置对应环境下的校验值
         * @param data  待校验数据对象
         * {
         *      "param1":"value1",
         *      "param2":"value2"
         * }
         * @param dataTitle   待校验数据对象 key 对应 title
         * {
         *      "param1":"参数一",
         *      "param2":"参数二"
         * }
         * @param scene 指定校验环境
         * @returns {YunjValidate}
         */
        setSceneData(data, dataTitle = {}, scene = "") {
            let that = this;
            // data
            if (!yunj.isObj(data)) {
                throw new Error('[data]值需为键值对对象');
            }
            // dataTitle
            if (!yunj.isObj(dataTitle)) {
                throw new Error('[dataTitle]值需为键值对对象');
            }
            // checkScene、checkRule
            let allRule = that._rule;
            if (scene) {
                if (!that._scene.hasOwnProperty(scene)) {
                    throw new Error('[scene]环境值错误');
                }
                let checkRule = {};
                let sceneDataKeys = that._scene[scene];
                for (let i = 0, l = sceneDataKeys.length; i < l; i++) {
                    let k = sceneDataKeys[i];
                    if (!allRule.hasOwnProperty(k)) {
                        throw new Error(`环境[${scene}]下数据[${k}]验证规则不存在`);
                    }
                    checkRule[k] = allRule[k];
                }
                that._checkScene = scene;
                that._checkRule = checkRule;
            } else {
                that._checkScene = "";
                that._checkRule = allRule;
            }
            return that;
        }

        /**
         * 校验
         * @param data          待校验数据对象
         * @param dataTitle   待校验数据对象 key 对应 title
         * @param scene         指定校验环境
         * @returns {boolean}
         */
        check(data, dataTitle = {}, scene = "") {
            let that = this;
            that._error = [];
            that.setSceneData(data, dataTitle, scene);
            if (that._error.length > 0) return false;
            let checkRule = that._checkRule;
            for (let k in checkRule) {
                if (!checkRule.hasOwnProperty(k)) continue;
                let v = data[k];
                let ruleArr = checkRule[k].split("|");
                if (ruleArr.length <= 0 || (ruleArr[0] !== "require" && (v === undefined || v === null || v === ""))) continue;
                for (let i = 0, l = ruleArr.length; i < l; i++) {
                    // 拿到规则
                    let rule = ruleArr[i];
                    if (rule === '') continue;
                    let [method, param] = rule.indexOf(':') !== -1 ? rule.split(':') : [rule, ''];
                    let methodName = `method_${method}`;
                    // 验证规则不存在时交给后端去校验
                    let methodCall = null;
                    if (that._methods.hasOwnProperty(methodName)) {
                        methodCall = that._methods[methodName];
                    } else if (typeof that[methodName] === 'function') {
                        methodCall = that[methodName];
                    }
                    if (!methodCall || !yunj.isFunction(methodCall)) continue;
                    // 进行校验
                    let res = methodCall(v, param, data);
                    if (res === true) continue;
                    // 错误提示消息设置
                    let msg;
                    if (yunj.isString(res) && that._methodsAppendRules.indexOf(method) !== -1) {
                        msg = res;
                    } else {
                        let msgKey = `${k}.${method}`;
                        msg = that._message.hasOwnProperty(msgKey) ? that._message[msgKey]
                            : ((dataTitle.hasOwnProperty(k) ? dataTitle[k] : k) + (yunj.isString(res) ? res : "错误"));
                    }
                    that.setError(k, rule, msg);
                    // 是否批量验证
                    if (!that._batch) return false;
                }
            }
            return that._error.length <= 0;
        }

        /**
         * 校验，当有错误时弹窗提示
         * @param data  待校验数据对象
         * @param dataTitle   待校验数据对象 key 对应 title
         * @param scene 指定校验环境
         * @returns {boolean}
         */
        checkTips(data, dataTitle = {}, scene = "") {
            let that = this;
            let res = that.check(data, dataTitle, scene);
            if (res === true) return true;
            let error = that.getError();
            yunj.alert(error, {icon: "warn"});
            throw new Error(error);
        }

        // 表格数组有效性
        // 因为要调用重新实例当前对象，所以不能放到validate-method，会导致与validate的layui.use来回引用
        method_table(value, rule = '', data = {}) {
            if (!yunj.isArray(value)) return "格式错误";
            if (!rule) return '验证规则[table]不能为空';
            let ruleRaw = yunj.base64Decode(rule);
            if (!yunj.isJson(ruleRaw)) return '验证规则[table]错误';
            let cols = JSON.parse(ruleRaw);
            if (!yunj.isArray(cols)) return '验证规则[table]错误';
            let validateRule = yunj.arrayColumn(cols, 'verify', 'field');
            let validateDataTitle = {};
            cols.forEach(col => {
                validateDataTitle[col.field] = `[${col.title}]`;
            });
            let colFields = yunj.arrayColumn(cols, 'field');
            let validate = new YunjValidate();
            for (let i = 0; i < value.length; i++) {
                let vv = value[i];
                let rowDesc = '第' + (i + 1) + '行';
                if (!yunj.isObj(vv)) {
                    return `${rowDesc}格式错误`;
                }
                if (yunj.isEmptyObj(vv)) {
                    return `${rowDesc}不能为空`;
                }
                let vvKeys = Object.keys(vv);
                if (yunj.arrayDiff(colFields, vvKeys).length > 0) {
                    return `${rowDesc}需所有表头传值`;
                }
                // 验证器校验值
                if (!validate.rule(validateRule).check(vv, validateDataTitle)) {
                    return rowDesc + validate.getError();
                }
            }
            return true;
        }

    }

    let validate = new YunjValidate();

    exports('validate', validate);
});
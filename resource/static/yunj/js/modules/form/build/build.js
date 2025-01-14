/**
 * FormBuild
 */
layui.define(['jquery', 'yunj'], function (exports) {

    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class FormBuild {

        constructor(form, buildName = "") {
            // form对象
            this.form = form;
            // form id
            this.formId = form.id;
            // form boxEl
            this.formBoxEl = form.boxEl;

            this.buildName = buildName;      // 构件名
            this.buildArgs = null;          // 构件配置参数
            this.buildBoxEl = null;         // 构件父元素
            this._initBuild();
        }

        // 初始化build
        _initBuild() {
            let that = this;
            that._initBuildArgs();
            that._initBuildBoxEl();
        }

        // 初始化build args
        _initBuildArgs() {
            let that = this;
            let buildName = that.buildName;
            if (!that.form.rawArgs.hasOwnProperty(buildName)) throw new Error(`表格[${that.formId}]未设置[${buildName}]`);
            that.buildArgs = that.form.rawArgs[buildName];
        }

        // 初始化build box el
        _initBuildBoxEl() {
        }

        async render() {
        }

        setEventBind() {
        }

        // 判断是否设置state
        isSetTab() {
            return this.form.isSetTab();
        }

        // 判断是否设置page
        isSetField() {
            return this.form.isSetField();
        }

        // 判断是否设置limit
        isSetButton() {
            return this.form.isSetButton();
        }

        // 获取当前切换栏值
        getCurrTab() {
            return this.form.getCurrTab();
        }

    }

    exports('FormBuild', FormBuild);
});
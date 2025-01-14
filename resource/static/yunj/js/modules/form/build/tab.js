/**
 * FormBuildTab
 */
layui.define(['jquery', 'yunj', 'element', "FormBuild"], function (exports) {

    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let element = layui.element;
    let FormBuild = layui.FormBuild;

    class FormBuildTab extends FormBuild {

        constructor(form) {
            super(form, "tab");
            this.value = null; // 当前tab值
        }

        // 初始化build box el
        _initBuildBoxEl() {
            let that = this;
            // 设置当前build box
            that.form.tabBoxEl.append(`<ul class="layui-tab-title"></ul>`);
            that.buildBoxEl = that.form.tabBoxEl.find(".layui-tab-title");
        }

        // 渲染
        async render() {
            let that = this;
            let layout = "";
            let tabs = that.buildArgs
            let field = that.form.rawArgs.field;
            for (let tab in tabs) {
                // 没有字段的tab不渲染
                if (!tabs.hasOwnProperty(tab)
                    || (field && (!field.hasOwnProperty(tab) || (yunj.isArray(field[tab]) && field[tab].length <= 0)))) continue;
                layout += `<li data-tab="${tab}">${tabs[tab]}</li>`;
            }
            that.buildBoxEl.html(layout);
            that.buildBoxEl.find('li:first').addClass('layui-this');
            // 设置当前切换栏值
            that.setValue();
        }

        // 设置当前状态值
        setValue() {
            this.value = this.buildBoxEl.find('.layui-this').data('tab') || null;
        }

        // 获取当前状态值
        getValue() {
            return this.value;
        }

        setEventBind() {
            let that = this;

            // 监听tab切换
            element.on(`tab(${that.formId}_tab)`, function (data) {
                that.setValue();
                // tab切换时触发
                $(doc).trigger(`yunj_form_${that.formId}_tab_change`);
            });
        }

    }

    exports('FormBuildTab', FormBuildTab);
});
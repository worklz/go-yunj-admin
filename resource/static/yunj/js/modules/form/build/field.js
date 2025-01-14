/**
 * FormBuildField
 */
layui.define(['jquery', 'yunj', "FormBuild"], function (exports) {

    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let FormBuild = layui.FormBuild;

    class FormBuildField extends FormBuild {

        constructor(form) {
            super(form, "field");
            this.loadValues = {};   // 表单字段值
            this.fields = {};       // 表单字段实例容器
        }

        // 初始化build box el
        _initBuildBoxEl() {
            let that = this;
            let tabContentStyle = '';
            if(!that.isSetTab()) {
                tabContentStyle = `style="padding:0;"`
            }
            that.form.tabBoxEl.append(`<ul class="layui-tab-content" ${tabContentStyle}></ul>`);
            that.buildBoxEl = that.form.tabBoxEl.find(".layui-tab-content");
        }

        // 渲染
        async render() {
            let that = this;
            // 设置表单字段值
            that.loadValues = that.form.rawArgs.loadValues;
            if (that.isSetTab()) {
                for (let tab in that.form.rawArgs.tab) {
                    if (!that.buildArgs.hasOwnProperty(tab)) continue;
                    that._setFieldsLayout(tab);
                    await that._renderFields(that.buildArgs[tab], tab);
                }
            } else {
                that._setFieldsLayout();
                await that._renderFields(that.buildArgs);
            }
            that.buildBoxEl.find('.layui-tab-item:first').addClass('layui-show');
            that._setFieldsItemStyle();
        }

        // 设置字段外部结构
        _setFieldsLayout(tab = "") {
            let that = this;
            that.buildBoxEl.append(`<div class="layui-tab-item"><form class="layui-form layui-form-pane yunj-form" lay-filter="${that.formId + (tab ? `_${tab}` : "")}"><div class="layui-row"></div></form></div>`);
        }

        // 渲染字段
        async _renderFields(fields, tab = "") {
            let that = this;
            let loadValues = that.loadValues;
            for (let key in fields) {
                if (!fields.hasOwnProperty(key)) continue;
                let args = fields[key];
                // args.value
                if (yunj.isObj(loadValues) && loadValues.hasOwnProperty(key)) {
                    args.value = loadValues[key];
                    delete loadValues[key];
                }
                await new Promise(resolve => {
                    yunj.formField(args.type, {
                        formId: that.formId,
                        tab: tab,
                        key: key,
                        args: args
                    }).then(field => {
                        return field.render(`.layui-tab[lay-filter=${that.formId}_tab] .layui-tab-content .yunj-form[lay-filter=${that.formId + (tab ? `_${tab}` : "")}] > .layui-row`);
                    }).then(field => {
                        that.fields[field.id] = field;
                        resolve();
                    }).catch(err => {
                        console.log(err);
                        resolve();
                    });
                });
            }
        }

        // 设置表单字段item样式
        _setFieldsItemStyle() {
            let that = this;
            if (!yunj.isMobile()) {
                // label 宽度
                let labelMaxWidth = 0;
                let currFormItemEl = that.buildBoxEl.find('.layui-tab-item.layui-show .yunj-form-item:not(.yunj-form-item-label-width-fill,:has(.yunj-form-item-label-width-fill))');
                currFormItemEl.find('.layui-form-label').css('width', 'auto');
                currFormItemEl.each(function () {
                    let currLabelWidth = $(this).find('.layui-form-label').outerWidth();
                    if (currLabelWidth > labelMaxWidth) labelMaxWidth = currLabelWidth;
                });
                let inc = 1;
                let labelWidth = labelMaxWidth + inc;
                currFormItemEl.find('.layui-form-label').css('width', labelWidth + 'px');
            }
            // control 宽度
            // let formWidth = that.formBoxEl.width();
            // let controlWidth = formWidth - labelWidth;
            // currFormItemEl.find('.yunj-form-item-control').css('cssText',`width:${controlWidth}px !important`);
        }

        // 设置字段 type=markdown mode=editormd 的字段重新加载
        _setFieldsMarkdownEditormdReload() {
            let that = this;
            let fields = that.buildArgs[that.getCurrTab()];
            for (let k in fields) {
                if (!fields.hasOwnProperty(k)) {
                    continue;
                }
                if (fields[k].type !== "markdown" || (fields[k].hasOwnProperty("mode") && fields[k].mode !== "editormd")) continue;
                let fieldObj = that.fields[that.formId + (that.getCurrTab() ? `_${that.getCurrTab()}` : "") + `_${k}`];
                fieldObj && fieldObj.hasOwnProperty('reloadEditormd') && fieldObj.reloadEditormd();
            }
        }

        setEventBind() {
            let that = this;

            if (that.isSetTab()) {
                // 绑定tab切换时触发
                $(doc).bind(`yunj_form_${that.formId}_tab_change`, function (e) {
                    that._setFieldsItemStyle();
                    that._setFieldsMarkdownEditormdReload();
                });
            }

        }

    }

    exports('FormBuildField', FormBuildField);
});
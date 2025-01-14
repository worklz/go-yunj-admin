/**
 * FormField
 */
layui.define(['jquery', 'yunj'], function (exports) {
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class FormField {

        constructor(options = {}) {
            this.options = options;
            this.form = options.form;               // 表单
            this.formId = options.formId;           // 表单id
            this.tab = options.tab;                 // 当前表单tab
            this.key = options.key;                 // 字段key

            this.id = null;                         // id
            this.args = {};                         // 字段配置数据
            this.tabFormFilter = null;              // tab栏的表单标识
            this.boxHtml = null;                    // 字段盒子html

            this.boxEl = null;                      // 字段盒子元素对象

            this._init();
        }

        _init() {
            let that = this;
            // 设置数据
            that._setData();
        }

        // 设置数据
        _setData() {
            let that = this;
            that._setId();
            that._setArgs();
            that._setTabFormFilter();
            that._setBoxHtml();
        }

        // 生成id
        _setId() {
            let that = this;
            that.id = yunj.generateFormFieldId(that.formId, that.key);
        }

        // 设置参数
        _setArgs() {
            let that = this;
            let args = Object.assign({
                title: "",
                default: "",
                desc: "",
                verify: "",
                verifyTitle: "",
                readonly: false,
                grid: [],
            }, that.defineExtraArgs(), that.options.args);
            args = that.handleArgs(args);
            // 必要参数
            that.args = args;
        }

        // 定义额外的args参数
        defineExtraArgs() {
            return {};
        }

        /**
         * 处理args
         * @param {object} args
         * @return {object}
         */
        handleArgs(args) {
            return args;
        }

        // 设置tabFormFilter 用于某些字段的渲染 form.render
        _setTabFormFilter() {
            let that = this;
            let tabFormFilter = that.formId + (that.tab ? `_${that.tab}` : "");
            let tabFormBoxEl = $(`[lay-filter=${tabFormFilter}]`);
            if (tabFormBoxEl.length <= 0) {
                let error = `lay-filter=${tabFormFilter}的表单容器不存在`;
                yunj.alert(error);
                throw new Error(error);
            }
            if (!tabFormBoxEl.hasClass("layui-form")) tabFormBoxEl.addClass("layui-form");
            that.tabFormFilter = tabFormFilter;
        }

        // 设置布局
        _setBoxHtml() {
            let that = this;
            that.boxHtml = that.defineBoxHtml();
        }

        // 定义字段外部包裹元素html结构，id和__layout__必须
        defineBoxHtml() {
            let that = this;
            return `<div class="layui-form-item yunj-form-item yunj-form-${that.args.type} ${that.isReadonly() ? 'readonly' : ''}" id="${that.id}">__layout__</div>`;
        }

        // 获取初始化值
        _getInitValue() {
            let that = this;
            return that.args.hasOwnProperty("value") ? that.args.value : that.args.default;
        }

        /**
         * 渲染
         * @param {string} parentSelector    [字段整体结构所在的外部父容器的jquery选择器]
         * @param {string} fieldOutLayout    [字段整体结构外部附加结构]
         * 当传入外部附加结构时，如：<div>__layout__</div>，会用生成的结构替换掉关键词 __layout__
         * @return {FormField}
         */
        async render(parentSelector, fieldOutLayout = "") {
            let that = this;
            await that.renderBefore();
            $(parentSelector).append(that._layout(fieldOutLayout));
            // 表单盒子元素
            that.boxEl = $(`#${that.id}`);
            // 渲染后执行
            await that.renderDone();
            // 触发选然后执行的事件，方便某些自定义类型的表单字段
            $(doc).trigger(`yunj_form_${that.formId}_${that.key}_render_done`, [that]);
            // 渲染完后设置值
            that.renderDoneSetValue(that._getInitValue());
            // 设置字段事件绑定
            that._setEventBind();

            return that;
        }

        /**
         * 字段布局
         * @param fieldOutLayout    字段整体结构外部附加结构
         * @return {*}
         * @private
         */
        _layout(fieldOutLayout = "") {
            let that = this;
            let layout = that.boxHtml.replace('__layout__', that.layoutContent());
            // 外部附加结构
            if (fieldOutLayout && fieldOutLayout.indexOf('__layout__') !== -1) {
                layout = fieldOutLayout.replace('__layout__', layout);
            }
            // 栅格布局
            let gridClass = yunj.generateGridClass(that.args.grid);
            layout = `<div${gridClass ? ` class="${gridClass}"` : ''}>${layout}</div>`;
            return layout;
        }

        // 字段结构内容
        layoutContent() {
            let that = this;
            let content = '';
            content += that.layoutLabel();
            content += that.layoutControl();
            return content;
        }

        // 返回字段label的html结构
        layoutLabel() {
            let that = this;
            let labelHtml = '';
            let title = that.args.title;
            if (!title) return labelHtml;
            if (that.args.verify && that.args.verify.indexOf('require') !== -1) labelHtml += `<span class="require">*</span>`;
            labelHtml += title;
            if (that.descContent()) {
                labelHtml += `<i class="layui-icon layui-icon-tips desc-icon" title="${title}字段说明"></i>`;
            }
            return `<label class="layui-form-label" title="${title}">${labelHtml}</label>`;
        }

        // 返回字段控件的html结构
        layoutControl() {
        }

        // 返回字段简介内容
        descContent() {
            let that = this;
            return that.args.desc ? that.args.desc : '';
        }

        // 渲染前执行
        async renderBefore() {
            return 'done';
        }

        // 渲染后执行
        async renderDone() {
            return 'done';
        }

        // 渲染完后设置值
        // setValue不能放在可能不存在的事件里执行，防止单一字段调用时不生效
        renderDoneSetValue(val) {
            let that = this;
            that.setValue(val);
        };

        // 设置值
        setValue(val = "") {
        }

        // 获取值
        getValue() {
        }

        // 是否为空值
        isEmptyValue() {
            let that = this;
            let value = that.getValue();
            return value === '' || value === null || value === {} || value === [] || value === undefined;
        }

        // 设置事件绑定
        _setEventBind() {
            let that = this;

            // 清空
            $(doc).bind(`yunj_form_${that.formId}_clear`, function (e) {
                that.setValue("");
            });

            // 重置
            $(doc).bind(`yunj_form_${that.formId}_reset`, function (e) {
                that.setValue(that._getInitValue());
            });

            // 提交
            $(doc).bind(`yunj_form_${that.formId}_submit`, function (e, data, verifyArgs) {
                let key = that.key;
                let val = that.getValue();
                // 过滤掉只读字段
                if (that.args.readonly) {
                    return;
                }
                data[key] = val;
                if (!verifyArgs.enable || !that.args.verify) {
                    return;
                }
                verifyArgs.rule[key] = that.args.verify;
                verifyArgs.data[key] = val;
                verifyArgs.dataTitle[key] = that.args.verifyTitle || that.args.title || key;
            });

            that.boxEl.on('click', 'label .desc-icon', function (e) {
                e.stopPropagation();
                yunj.alert(`<div class="yunj-form-item-desc">${that.descContent()}</div>`, {
                    title: `字段说明：${that.args.title}`
                });
            });

            that.defineExtraEventBind();
        }

        // 定义额外的事件绑定
        defineExtraEventBind() {
        }

        // 是否只读
        isReadonly() {
            return !!this.args.readonly;
        }

    }

    exports('FormField', FormField);
});
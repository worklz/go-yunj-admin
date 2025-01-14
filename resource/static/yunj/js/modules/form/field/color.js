/**
 * FormFieldColor
 */
layui.define(['FormField', "jquery"], function (exports) {

    let FormField = layui.FormField;
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class FormFieldColor extends FormField {

        constructor(options = {}) {
            super(options);
            this.colorActionBox = null; // 颜色控制
            this.colorInputEl = null;   // 颜色输入框
            this.colorShowEl = null;    // 颜色句柄
        }

        defineExtraArgs() {
            let that = this;
            return {};
        }

        handleArgs(args) {
            if (args.verify.indexOf("hexColor") === -1)
                args.verify += (args.verify ? "|" : "") + "hexColor";
            return args;
        }

        layoutControl() {
            let that = this;
            let controlHtml = `<div class="field-color-box">
                                    <div class="field-color-action-box" title="${that.args.readonly ? '禁用' : '选择/编辑颜色'}">
                                        <input type="text" class="layui-input field-color-action-input" readonly maxlength="7" autocomplete="off">
                                        <span class="field-color-action-show"></span>
                                    </div>
                                </div>`;
            return `<div class="layui-input-inline yunj-form-item-control">${controlHtml}</div>`;
        }

        async renderBefore() {
            let that = this;
            if (that.args.readonly) return 'done';
            // 修改了源码，增加了上下定位判断，增加了css
            await yunj.includeCss('/static/yunj/libs/colpick/colpick.css?v=1.0.6');
            await yunj.includeJs(`/static/yunj/libs/colpick/colpick.js?v=1.0.6`);
            return 'done';
        }

        renderDone() {
            let that = this;

            that.colorActionBox = that.boxEl.find('.field-color-action-box');
            that.colorInputEl = that.boxEl.find('.field-color-action-input');
            that.colorShowEl = that.boxEl.find('.field-color-action-show');

            if (that.args.readonly) return false;
            that.colorActionBox.colpick({
                layout: 'hex',
                submit: 0,
                colorScheme: 'dark',
                onChange: function (hsb, hex, rgb, el, bySetColor) {
                    that.setColor(`#${hex}`);
                }
            });
        }

        setValue(val = '') {
            let that = this;
            that.setColor(val);
            if (that.args.readonly) return false;
            that.colorActionBox.colpickSetColor(val);
        }

        getValue() {
            let that = this;
            return that.colorInputEl.val();
        }

        setColor(val) {
            let that = this;

            if (!yunj.isString(val) || !/^#[a-zA-Z0-9]{6}$/.test(val)) val = "#000000";
            that.colorInputEl.val(val);
            that.colorShowEl.css('backgroundColor', val);
        }

        defineExtraEventBind() {
            let that = this;

            // 防止重复绑定事件
            if (yunj.isUndefined(win.FORM_FIELD_COLOR_SCROLL_HIDE_COPY_EVENT_BIND)) {
                win.FORM_FIELD_COLOR_SCROLL_HIDE_COPY_EVENT_BIND = true;
                $(".yunj-iframe-content").scroll(function (e) {
                    let colpickEl = $(".colpick ");
                    if (colpickEl.length > 0) colpickEl.hide();
                });

                $(".layui-tab-content").scroll(function (e) {
                    let colpickEl = $(".colpick ");
                    if (colpickEl.length > 0) colpickEl.hide();
                });
            }
        }

    }

    exports('FormFieldColor', FormFieldColor);
});
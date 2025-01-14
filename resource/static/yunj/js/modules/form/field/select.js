/**
 * FormFieldSelect
 */
layui.define(['FormField', 'FormFieldActions'], function (exports) {

    let FormField = layui.FormField;
    let FormFieldActions = layui.FormFieldActions;
    let $ = layui.jquery;

    class FormFieldSelect extends FormField {

        constructor(options = {}) {
            super(options);
            this.showBoxEl = null;
            this.inputEl = null;
            this.selectPopupContentEl = null;
        }

        defineExtraArgs() {
            let that = this;
            return {
                options: [],
                search: false
            };
        }

        handleArgs(args) {
            let optionKeys = Object.keys(args.options);
            if (args.default === "")
                args.default = optionKeys[0];
            if (args.verify.indexOf("in") === -1)
                args.verify += (args.verify ? "|" : "") + `in:${optionKeys.join(",")}`;
            return args;
        }

        layoutControl() {
            let that = this;
            let controlHtml = `<div class="show-box">
                                    <input type="text" name="${that.id}" readonly placeholder="请选择" autocomplete="off" class="layui-input">
                                </div>`;
            return `<div class="layui-input-inline yunj-form-item-control">${controlHtml}</div>`;
        }

        renderDone() {
            let that = this;
            that.showBoxEl = that.boxEl.find('.show-box');
            that.inputEl = that.boxEl.find(`.show-box>input[name=${that.id}]`);
            // 设置字段操作项：内容清理、选择弹窗
            let itemsContent = '';
            let options = that.args.options;
            for (let val in options) {
                if (!options.hasOwnProperty(val)) continue;
                let name = options[val];
                itemsContent += `<dd data-value="${val}" title="${name}">${name}</dd>`;
            }
            let selectPopupContentHtml = `<dl class="items-box">${itemsContent}</dl>`;
            that.fieldActions = new FormFieldActions({
                fieldObj: that,
                fieldValueElSelector: `.show-box>input[name=${that.id}]`,
                actions: {
                    contentClear: null,
                    selectPopup: {
                        contentHtml: selectPopupContentHtml,
                        showAfter: that.renderSelectItems,
                    },
                }
            });
            that.selectPopupContentEl = that.fieldActions.getActionObj('selectPopup').selectContentEl;
        }

        setValue(val = '') {
            let that = this;
            let name = that.args.options[val] || null;
            if (that.selectPopupContentEl) {
                let optionsEl = that.selectPopupContentEl.find('.items-box dd');
                if (optionsEl.length > 0) {
                    optionsEl.removeClass('active');
                }
            }
            if (name === null) {
                that.inputEl.data('value', '');
                that.inputEl.val('');
            } else {
                that.inputEl.data('value', val);
                that.inputEl.val(name);
                if (that.selectPopupContentEl) {
                    let optionEl = that.selectPopupContentEl.find(`.items-box dd[data-value="${val}"]`);
                    if (optionEl.length > 0) {
                        optionEl.addClass('active');
                    }
                }
            }
        }

        getValue() {
            let that = this;
            return that.inputEl.data('value');
        }

        // 渲染筛选items
        renderSelectItems = () => {
            let that = this;
            let val = that.getValue();
            that.selectPopupContentEl.find('.items-box dd').removeClass('active');
            let ddEl = that.selectPopupContentEl.find(`.items-box dd[data-value="${val}"]`);
            if (ddEl.length > 0) {
                ddEl.addClass('active');
            }
        }

        defineExtraEventBind() {
            let that = this;

            that.boxEl.on('click', '.items-box dd', function (e) {
                e.stopPropagation();
                let dd = $(this);
                if (!dd.hasClass('active')) {
                    // 选中
                    that.setValue(dd.data('value'));
                } else {
                    // 删除
                    that.setValue();
                }
            });

        }

    }

    exports('FormFieldSelect', FormFieldSelect);
});
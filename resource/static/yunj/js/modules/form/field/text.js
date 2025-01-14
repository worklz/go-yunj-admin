/**
 * FormFieldText
 */
layui.define(['FormField', 'FormFieldActions'], function (exports) {

    let FormField = layui.FormField;
    let FormFieldActions = layui.FormFieldActions;

    class FormFieldText extends FormField {

        constructor(options = {}) {
            super(options);
            this.inputSelector = `input:text[name=${this.id}]`;
            this.fieldActions = null;
        }

        defineExtraArgs() {
            let that = this;
            return {
                placeholder: ""
            };
        }

        layoutControl() {
            let that = this;
            let controlHtml = `<input type="text" name="${that.id}" ${that.args.readonly ? 'readonly' : ''}
                       placeholder="${that.args.placeholder}" value="" autocomplete="off" class="layui-input">`;
            return `<div class="layui-input-inline yunj-form-item-control">${controlHtml}</div>`;
        }

        async renderDone() {
            let that = this;
            // 设置字段操作项：内容清理、字符数
            that.fieldActions = new FormFieldActions({
                fieldObj: that,
                fieldValueElSelector: `input[name=${that.id}]`,
                actions: {
                    contentClear: {allowFocused: true},
                    charNum: null,
                }
            });
        }

        setValue(val = '') {
            let that = this;
            that.boxEl.find(that.inputSelector).val(val);
            let charNumAction = that.fieldActions.getActionObj('charNum');
            charNumAction && charNumAction.setCurrCharNum();
        }

        getValue() {
            let that = this;
            return that.boxEl.find(that.inputSelector).val();
        }

        defineExtraEventBind() {
            let that = this;

        }

    }

    exports('FormFieldText', FormFieldText);
});
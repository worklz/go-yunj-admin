/**
 * FormFieldPassword
 */
layui.define(['FormField', 'FormFieldActions'], function (exports) {

    let FormField = layui.FormField;
    let FormFieldActions = layui.FormFieldActions;

    class FormFieldPassword extends FormField {

        constructor(options = {}) {
            super(options);
        }

        defineExtraArgs() {
            let that = this;
            return {
                placeholder: ""
            };
        }

        layoutControl() {
            let that = this;
            let controlHtml = `<input type="password" name="${that.id}" ${that.args.readonly ? 'readonly' : ''}
                       placeholder="${that.args.placeholder}" value="" autocomplete="off" class="layui-input">`;
            return `<div class="layui-input-inline yunj-form-item-control">${controlHtml}</div>`;
        }

        async renderDone() {
            let that = this;
            // 设置字段操作项：内容清理、密码明文查看数
            that.fieldActions = new FormFieldActions({
                fieldObj: that,
                fieldValueElSelector: `input[name=${that.id}]`,
                actions: {
                    contentClear: {allowFocused: true},
                    contentEye: null,
                }
            });
        }

        setValue(val = '') {
            let that = this;
            that.boxEl.find(`input[name=${that.id}]`).val(val);
            let contentEyeAction = that.fieldActions.getActionObj('contentEye');
            contentEyeAction && contentEyeAction.setContentEyeShowHide(val.length > 0);
        }

        getValue() {
            let that = this;
            return that.boxEl.find(`input[name=${that.id}]`).val();
        }

        defineExtraEventBind() {
            let that = this;
        }

    }

    exports('FormFieldPassword', FormFieldPassword);
});
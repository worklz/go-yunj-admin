/**
 * FormFieldSwitch
 */
layui.define(['jquery','FormField', 'form'], function (exports) {

    let doc = document;
    let $ = layui.jquery;
    let FormField = layui.FormField;
    let form = layui.form;

    class FormFieldSwitch extends FormField {

        constructor(options = {}) {
            super(options);
            this.onVal = '';
            this.offVal = '';
        }

        defineExtraArgs() {
            let that = this;
            return {
                text: '开|关',
                textValue: 'on|off',
            };
        }

        handleArgs(args) {
            let text = args.text;
            if (text.indexOf('|') === -1) {
                throw new Error('类型[switch]配置[text]错误');
            }
            let textValue = args.textValue;
            if (textValue.indexOf('|') === -1) {
                throw new Error('类型[switch]配置[textValue]错误');
            }
            if (args.verify.indexOf('in') === -1) {
                let [on, off] = textValue.split('|');
                args.verify += (args.verify ? "|" : "") + `in:${on},${off}`;
            }

            return args;
        }

        layoutControl() {
            let that = this;
            let controlHtml = `<input type="checkbox" name="${that.id}" lay-text="${that.args.text}" } lay-skin="switch" lay-filter="${that.id}" ${that.args.readonly ? 'disabled' : ''}>`;
            return `<div class="layui-input-inline yunj-form-item-control yunj-input-pane">${controlHtml}</div>`;
        }

        async renderBefore() {
            let that = this;
            [that.onVal, that.offVal] = that.args.textValue.split('|');
            return 'done';
        }

        setValue(val = '') {
            let that = this;
            that.boxEl.find(`input:checkbox[name=${that.id}]`).prop('checked', val.toString() === that.onVal.toString());
            form.render('checkbox', that.tabFormFilter);
        }

        getValue() {
            let that = this;
            return that.isChecked() ? that.onVal : that.offVal;
        }

        renderDone() {
            let that = this;
            form.render('checkbox', that.tabFormFilter);
        }

        defineExtraEventBind() {
            let that = this;
            // 监听点击事件
            form.on(`switch(${that.id})`, function(data){
                // 触发点击事件
                $(doc).trigger(`yunj_form_${that.formId}_${that.key}_switch`, [that]);
            });
        }

        /**
         * 当前是否选中
         * @return {boolean}
         */
        isChecked() {
            let that = this;
            return that.boxEl.find(`input:checkbox[name=${that.id}]`).is(':checked');
        }

    }

    exports('FormFieldSwitch', FormFieldSwitch);
});
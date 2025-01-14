/**
 * FormFieldRadio
 */
layui.define(['FormField', 'form'], function (exports) {

    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let FormField = layui.FormField;
    let form = layui.form;

    class FormFieldRadio extends FormField {

        constructor(options = {}) {
            super(options);
        }

        defineExtraArgs() {
            let that = this;
            return {
                options: []
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
            let controlHtml = '';
            let options = that.args.options;
            for (let k in options) {
                controlHtml += `<input type="radio" name="${that.id}" title="${options[k]}" value="${k}" lay-filter="${that.id}" ${that.args.readonly ? 'disabled' : ''}>`;
            }
            return `<div class="layui-input-inline yunj-form-item-control yunj-input-pane">${controlHtml}</div>`;
        }

        setValue(val = '') {
            let that = this;
            that.boxEl.find(`input:radio[name=${that.id}]`).prop('checked', false);
            if (val !== '' && val !== null && val !== undefined) that.boxEl.find(`input:radio[name=${that.id}][value=${val}]`).prop('checked', true);
            form.render('radio', that.tabFormFilter);
        }

        getValue() {
            let that = this;
            return that.boxEl.find(`input:radio[name=${that.id}]:checked`).val();
        }

        renderDone() {
            let that = this;
            form.render('radio', that.tabFormFilter);
        }

        defineExtraEventBind() {
            let that = this;
            // 监听点击事件
            form.on(`radio(${that.id})`, function (data) {
                // 触发点击事件
                $(doc).trigger(`yunj_form_${that.formId}_${that.key}_change`, [that]);
            });
        }

    }

    exports('FormFieldRadio', FormFieldRadio);
});
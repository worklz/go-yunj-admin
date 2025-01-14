/**
 * FormFieldCheckbox
 */
layui.define(['FormField','FormFieldActions', 'jquery', 'form'], function (exports) {

    let FormField = layui.FormField;
    let FormFieldActions = layui.FormFieldActions;
    let $ = layui.jquery;
    let form = layui.form;

    class FormFieldCheckbox extends FormField {

        constructor(options = {}) {
            super(options);
        }

        defineExtraArgs() {
            let that = this;
            return {
                options: {}
            };
        }

        handleArgs(args) {
            if (args.verify.indexOf("arrayIn") === -1)
                args.verify += (args.verify ? "|" : "") + `arrayIn:${Object.keys(args.options).join(",")}`;
            return args;
        }

        layoutControl() {
            let that = this;
            let controlHtml = '';
            let options = that.args.options;
            for (let k in options) {
                controlHtml += `<input type="checkbox" name="${that.id}" title="${options[k]}" value="${k}" lay-skin="primary" lay-filter="${that.id}" ${that.args.readonly ? 'disabled' : ''}>`;
            }
            return `<div class="layui-input-inline yunj-form-item-control yunj-input-pane"><div class="show-box">${controlHtml}</div></div>`;
        }

        renderDone() {
            let that = this;
            form.render('checkbox', that.tabFormFilter);
            that.fieldActions = new FormFieldActions({
                fieldObj: that,
                fieldValueElSelector: '.show-box',
                actions: {
                    contentClear: null,
                }
            });
        }

        setValue(val = '') {
            let that = this;

            if (yunj.isScalar(val) && val)
                val = yunj.isJson(val) ? JSON.parse(val) : (yunj.isString(val) && val.indexOf(",") !== -1 ? val.split(",") : [val]);
            if (!yunj.isArray(val)) val = [];

            that.boxEl.find(`input:checkbox[name=${that.id}]`).prop('checked', false);
            for (let i = 0, l = val.length; i < l; i++) {
                that.boxEl.find(`input:checkbox[name=${that.id}][value=${val[i]}]`).prop('checked', true);
            }
            form.render('checkbox', that.tabFormFilter);
        }

        getValue() {
            let that = this;
            let val = [];
            that.boxEl.find(`input:checkbox[name=${that.id}]:checked`).each(function (i) {
                val.push($(this).val());
            });
            return val.length > 0 ? val : "";
        }

    }

    exports('FormFieldCheckbox', FormFieldCheckbox);
});
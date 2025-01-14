/**
 * FormFieldLine
 */
layui.define(['FormField'], function (exports) {

    let FormField = layui.FormField;

    class FormFieldLine extends FormField {

        constructor(options={}) {
            super(options);
        }

        handleArgs(args) {
            args.readonly = true;
            return args;
        }

        layoutContent() {
            let that = this;
            return `<fieldset class="layui-elem-field layui-field-title" style="margin: 0;width: 100%;">${that.args.title?`<legend>${that.args.title}</legend>`:''}</fieldset>`;
        }

    }

    exports('FormFieldLine', FormFieldLine);
});
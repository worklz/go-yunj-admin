/**
 * FormFieldCustom
 */
layui.define(['jquery','FormField'], function (exports) {

    let doc = document;
    let $ = layui.jquery;
    let FormField = layui.FormField;

    class FormFieldCustom extends FormField {

        constructor(options={}) {
            super(options);
        }

        defineExtraArgs(){
            return {
                html:''
            };
        }

        layoutContent() {
            return this.args.html;
        }

        setValue(val=''){
            let that=this;
            // 触发事件
            $(doc).trigger(`yunj_form_${that.formId}_${that.key}_set_value`, [that,val]);
        }

        getValue(){
            let that=this;
            // 触发事件
            let val = {
                value:''
            };
            $(doc).trigger(`yunj_form_${that.formId}_${that.key}_get_value`, [that,val]);
            return val.value;
        }

    }

    exports('FormFieldCustom', FormFieldCustom);
});
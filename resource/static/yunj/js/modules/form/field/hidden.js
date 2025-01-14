/**
 * FormFieldHidden
 */
layui.define(['FormField'], function (exports) {

    let FormField = layui.FormField;

    class FormFieldHidden extends FormField {

        constructor(options={}) {
            super(options);
        }

        // 设置布局
        defineBoxHtml(){
            let that = this;
            return `<div class="layui-form-item yunj-form-item yunj-form-hidden" id="${that.id}">__layout__</div>`;
        }

        layoutLabel(){
            return '';
        }

        layoutControl() {
            let that = this;
            return `<input type="hidden" name="${that.id}" ${that.args.required ? 'lay-verify="required"' : ''}>`;
        }

        descContent(){
            return '';
        }

        renderDone() {
            let that = this;
            that.boxEl.parent('div').attr("style","padding:0 !important");
        }

        setValue(val=''){
            let that=this;
            that.boxEl.find(`input:hidden[name=${that.id}]`).val(val);
        }

        getValue(){
            let that=this;
            return that.boxEl.find(`input:hidden[name=${that.id}]`).val();
        }

    }

    exports('FormFieldHidden', FormFieldHidden);
});
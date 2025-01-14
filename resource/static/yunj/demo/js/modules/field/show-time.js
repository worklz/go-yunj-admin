/**
 * FormFieldShowTime
 */
layui.define(['FormField'], function (exports) {

    let FormField = layui.FormField;

    class FormFieldShowTime extends FormField {

        constructor(options) {
            super(options);
        }

        // 控件结构
        layoutControl() {
            let that = this;
            let controlHtml = `<input type="text" name="${that.id}" ${that.args.required ? 'lay-verify="required"' : ''}
                       placeholder="${that.args.placeholder}" value="" readonly autocomplete="off" class="layui-input">`;
            return `<div class="layui-input-inline yunj-form-item-control">${controlHtml}</div>`;
        }

        // 设置值
        setValue(val=''){
            let that=this;
            if(!val){
                let currTimestamp=yunj.currTimestamp(true);
                val=yunj.timestampFormat(currTimestamp,that.args.format);
            }
            that.fieldBoxEl.find(`input:text[name=${that.id}]`).val(val);
        }

        // 获取值
        getValue(){
            let that=this;
            return that.fieldBoxEl.find(`input:text[name=${that.id}]`).val();
        }
    }

    exports('FormFieldShowTime', FormFieldShowTime);
});
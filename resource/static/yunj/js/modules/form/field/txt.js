/**
 * FormFieldTxt
 */
layui.define(['FormField'], function (exports) {

    let FormField = layui.FormField;

    class FormFieldTxt extends FormField {

        constructor(options = {}) {
            super(options);
        }

        defineExtraArgs() {
            let that = this;
            return {
                align: 'center',    // 排列。left 居左、center 居中、right 居右
                color: '',          // 颜色css:color
                size: '',           // 文字大小css:font-size
                weight: '600',      // 对应css:font-weight
            };
        }

        handleArgs(args) {
            args.readonly = true;

            if (['left', 'center', 'right'].indexOf(args.align) === -1) {
                throw new Error('类型[txt]配置[align]错误');
            }

            return args;
        }

        layoutContent() {
            let that = this;
            let style = `text-align: ${that.args.align};width: 100%;`;
            if (that.args.color) {
                style += `color: ${that.args.color};`
            }
            if (that.args.size) {
                style += `font-size: ${that.args.size};`
            }
            if (that.args.weight) {
                style += `font-weight: ${that.args.weight};`
            }
            return `<div class="" style="${style}">${that.args.desc}</div>`;
        }

    }

    exports('FormFieldTxt', FormFieldTxt);
});
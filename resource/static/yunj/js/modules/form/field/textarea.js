/**
 * FormFieldTextarea
 */
layui.define(['FormField'], function (exports) {

    let FormField = layui.FormField;

    class FormFieldTextarea extends FormField {

        constructor(options={}) {
            super(options);
            this.limitMaxCharNum = 0;
            this.charNumEl = null;
        }

        defineExtraArgs(){
            let that = this;
            return {
                placeholder:""
            };
        }

        defineBoxHtml(){
            let that = this;
            return `<div class="layui-form-item yunj-form-item yunj-form-textarea yunj-form-item-label-width-fill" id="${that.id}">__layout__</div>`;
        }

        async renderBefore() {
            let that = this;
            // limitMaxCharNum
            let verify = that.args.verify;
            if (verify && verify.indexOf("max:") !== -1) {
                let verifyArr = verify.split("|");
                for (let i = 0; i < verifyArr.length; i++) {
                    let verifyItem = verifyArr[i];
                    if (verifyItem.indexOf("max:") === 0) {
                        that.limitMaxCharNum = parseInt(verifyItem.replace("max:", ""));
                        break;
                    }
                }
            }
        }

        layoutControl() {
            let that = this;
            let controlHtml = `<textarea name="${that.id}" ${that.args.readonly ? 'readonly' : ''}
                        placeholder="${that.args.placeholder}" class="layui-textarea"></textarea>
                        <span class="char-num"></span>`;
            return `<div class="layui-input-inline yunj-form-item-control">${controlHtml}</div>`;
        }

        async renderDone() {
            let that = this;
            that.charNumEl = that.boxEl.find(`.char-num`);
        }

        setValue(val=''){
            let that=this;
            that.boxEl.find(`textarea[name=${that.id}]`).val(val);
            that.setCurrCharNum();
        }

        getValue(){
            let that=this;
            return that.boxEl.find(`textarea[name=${that.id}]`).val();
        }

        // 设置当前字符数
        setCurrCharNum() {
            let that = this;
            let charNum = that.getValue().length;
            let content = charNum;
            let color = "#d2d2d2";
            if (that.limitMaxCharNum > 0) {
                content = `${charNum}/${that.limitMaxCharNum}`;
                if (charNum > that.limitMaxCharNum) {
                    color = "#ff5722";
                }
            }
            that.charNumEl.html(content).css("color", color);
        }

        defineExtraEventBind() {
            let that = this;

            // 监听文本域输入事件
            that.boxEl.on('input', `textarea[name=${that.id}]`, function () {
                // 设置当前字符数
                that.setCurrCharNum();
            });
        }

    }

    exports('FormFieldTextarea', FormFieldTextarea);
});
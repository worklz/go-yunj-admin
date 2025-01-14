/**
 * TableColEnum
 */
layui.define(['TableColTemplet', 'jquery', 'yunj'], function (exports) {

    let TableColTemplet = layui.TableColTemplet;
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class TableColEnum extends TableColTemplet {

        constructor(options) {
            super(options);
        }

        async renderBefore() {
            let that = this;
            // options
            let options = that.args.options;
            if (!yunj.isObj(options)) {
                throw new Error(`表头模板[enum]的配置属性[options]需为{key:value}或{key:{text:'xxx','bgColor':'xxx'}}键值对`);
            }
            for (let k in options) {
                if (!options.hasOwnProperty(k)) {
                    continue;
                }
                let option = options[k];
                if (!yunj.isObj(option)) {
                    option = {text: option};
                }
                option = yunj.objSupp(option, {text: '', bgColor: ''});
                options[k] = option;
            }
            return 'done';
        }

        layout() {
            let that = this;
            let options = that.args.options;
            if (options.length <= 0) return '';
            // 将 “{{”替换为“{ {”、“}}”替换为“} }” 避免与laytpl语法冲突
            let optionsConfig = JSON.stringify(options).replace('{{', '{ {').replace('}}', '} }');
            return `{{# 
                        let options = ${optionsConfig};
                        let vals = d.${that.key};
                        if(yunj.isString(vals)&&vals.length>0) 
                            vals = yunj.isJson(vals)?JSON.parse(vals):(vals.indexOf(",")!==-1?vals.split(","):[vals]);
                        else if(yunj.isNumber(vals)) 
                            vals = [vals];
                        if(!yunj.isArray(vals)) vals = [];
                        let enumHtml = "";
                        for(let i=0,l=vals.length;i<l;i++){
                            let val = vals[i];
                            if(options.hasOwnProperty(val)) {
                                let option = options[val];
                                let styleContent = '';
                                if (option.bgColor) {
                                    styleContent = 'style="color:#fff;background-color:'+option.bgColor+';"';
                                }
                                let itemHtml = '<span class="item" title="点击复制" '+styleContent+'>'+option.text+'</span>';
                                enumHtml += itemHtml;
                            }
                        }
                     }}
                     <div class="table-row-enum" title="点击复制">{{- enumHtml }}</div>`;
        }

        defineExtraEventBind() {
            let that = this;

            // 防止重复绑定事件
            if (yunj.isUndefined(win.TABLE_ROW_ENUM_CLICK_COPY_EVENT_BIND)) {
                win.TABLE_ROW_ENUM_CLICK_COPY_EVENT_BIND = true;
                $(doc).on('click', '.table-row-enum .item', function (e) {
                    yunj.copy($(this).html());
                    e.stopPropagation();
                });
            }
        }

    }

    exports('TableColEnum', TableColEnum);
});
/**
 * TableColAction
 */
layui.define(['TableColTemplet', 'ydropdown', 'laytpl'], function (exports) {

    let TableColTemplet = layui.TableColTemplet;
    let laytpl = layui.laytpl;

    class TableColAction extends TableColTemplet {

        constructor(options) {
            super(options);
        }

        layout() {
            let that = this;
            let rawOptions = that.args.options;
            if (rawOptions.length <= 0) return '';
            // 将 “{{”替换为“{ {”、“}}”替换为“} }” 避免与laytpl语法冲突
            let rawOptionsConfig = JSON.stringify(rawOptions).replace('{{', '{ {').replace('}}', '} }');
            return `{{# 
                        let rawOptions = ${rawOptionsConfig};
                        let options = {};
                        let fieldKey = '${that.key}';
                        if(d.hasOwnProperty(fieldKey)){
                            let val = d[fieldKey];
                            if(yunj.isArray(val)&&val.length>0){
                                for(let i = 0;i<val.length;i++){
                                    let k = val[i];
                                    if(rawOptions.hasOwnProperty(k)) options[k] = rawOptions[k];
                                }
                            }
                        }else{
                            options = rawOptions;
                        }
                        let templet = '';
                        let buildTable = window.yunj.table['${that.tableId}'].getCurrBuildTable();
                        let itemTemplet = '';
                        let dropdownTemplet = '';
                        let isMobile = yunj.isMobile();
                        for(let k in options){
                            let option = Object.assign({},{
                                'type':'',
                                'title':'',
                                'class':'',
                                'url':'',
                                'confirmText':'',
                                'dropdown':false,
                                'show':true
                            },options[k]);
                            let show = option.show;
                            if(show && yunj.isString(show)){
                                show = eval(show);
                            }
                            if(!show) {
                                continue;
                            }
                            let layEvent = buildTable.generateLayEvent(buildTable.layEventLocation.action,k,option);
                            !isMobile&&!option.dropdown
                                ?(itemTemplet += '<button type="button" class="layui-btn layui-btn-xs layui-btn-primary '+yunj.iconClass(option.class)+'" lay-event="'+layEvent+'">'+option.title+'</button>')
                                :(dropdownTemplet += '<dd class="'+yunj.iconClass(option.class)+'" lay-event="'+layEvent+'">'+option.title+'</dd>');
                        }
                        if (itemTemplet) templet += '<div class="layui-btn-group" style="margin-right: 10px">'+itemTemplet+'</div>';
                        if (dropdownTemplet) templet += yunj.dropdown.layout(dropdownTemplet);
                    }}
                    <div class="layui-btn-container" yunj-id="${that.tableId}">{{- templet }}</div>`;
        }

    }

    exports('TableColAction', TableColAction);
});
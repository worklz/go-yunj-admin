/**
 * TableColDatetime
 */
layui.define(['TableColTemplet','jquery','yunj'], function (exports) {

    let TableColTemplet = layui.TableColTemplet;
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class TableColDatetime extends TableColTemplet{

        constructor(options) {
            super(options);
        }

        layout(){
            let that=this;
            return `{{# 
                        let value = d.${that.key};
                        let datetime = '';
                        if(yunj.isDatetime(value)){
                            value = yunj.datetimeToTimestamp(value);
                        }
                        if(yunj.isTimestamp(value)){
                            datetime = yunj.timestampFormat(value);
                        }
                        if(datetime) { 
                    }}
                     <span class="layui-badge layui-bg-gray table-row-datetime" title="{{ datetime }}">{{ datetime }}</span>
                    {{# } }}`;
        }

        defineExtraEventBind(){
            let that=this;

            // 防止重复绑定事件
            if (yunj.isUndefined(win.TABLE_ROW_DATETIME_CLICK_COPY_EVENT_BIND)) {
                win.TABLE_ROW_DATETIME_CLICK_COPY_EVENT_BIND = true;
                $(doc).on('click','.table-row-datetime',function (e) {
                    yunj.copy($(this).text());
                    e.stopPropagation();
                });
            }
        }

    }

    exports('TableColDatetime', TableColDatetime);
});
/**
 * TableColJson
 */
layui.define(['TableColTemplet', 'jquery', 'yunj'], function (exports) {

    let TableColTemplet = layui.TableColTemplet;
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class TableColJson extends TableColTemplet {

        constructor(options) {
            super(options);
        }

        layout() {
            let that = this;
            return `{{# 
                        let val = d.${that.key};
                        if(yunj.isObj(val) || yunj.isArray(val) ){
                            val = JSON.stringify(val);
                        }
                        if(val === '[]' || val === '{}'){
                            val = '';
                        }
                     }}
                    {{#  if(d.is_export || !val || !yunj.isJson(val)){  }}
                        {{val}}
                    {{#  }else{  }}
                        <div class="table-row-json">
                            <span class="txt">{{val}}</span>
                            <span class="layui-badge layui-bg-blue btn-json-view" data-json='{{val}}' title="查看">查看</span>
                        </div>
                    {{#  }  }}`;
        }

        defineExtraEventBind() {
            let that = this;

            // 防止重复绑定事件
            if (yunj.isUndefined(win.TABLE_ROW_JSON_CLICK_VIEW_EVENT_BIND)) {
                win.TABLE_ROW_JSON_CLICK_VIEW_EVENT_BIND = true;
                $(doc).on('click', '.table-row-json .btn-json-view', function (e) {
                    let json = $(this).data('json');
                    let jsonStr = JSON.stringify(json);
                    json = JSON.stringify(json, null, 4);
                    yunj.open({
                        title: false,
                        content: `<pre>${json}</pre>`,
                        shadeClose: true,
                        btn: ['复制'],
                        yes: function (index, layero) {
                            yunj.copy(jsonStr);
                            return false;
                        },
                    });
                    e.stopPropagation();
                });
            }
        }

    }

    exports('TableColJson', TableColJson);
});
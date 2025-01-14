/**
 * TableColIcon
 */
layui.define(['TableColTemplet', 'jquery', 'yunj'], function (exports) {

    let TableColTemplet = layui.TableColTemplet;
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class TableColIcon extends TableColTemplet {

        constructor(options) {
            super(options);
        }

        layout() {
            let that = this;
            return `{{# 
                        let val = d.${that.key};
                        if(!yunj.isString(val)) {
                            val = "";
                        }
                        val = yunj.iconClass(val);
                     }}
                    {{#  if(d.is_export || !val){  }}
                        {{val}}
                    {{#  }else{  }}
                        <div class="table-row-icon" title="{{val}}">
                            <i class="{{val}}"></i>
                        </div>
                    {{#  }  }}`;
        }

        defineExtraEventBind() {
            let that = this;

            // 防止重复绑定事件
            if (yunj.isUndefined(win.TABLE_ROW_ICON_CLICK_VIEW_EVENT_BIND)) {
                win.TABLE_ROW_ICON_CLICK_VIEW_EVENT_BIND = true;
                $(doc).on('click', '.table-row-icon', function (e) {
                    let title = $(this).attr('title');
                    yunj.copy(title);
                    e.stopPropagation();
                });
            }
        }

    }

    exports('TableColIcon', TableColIcon);
});
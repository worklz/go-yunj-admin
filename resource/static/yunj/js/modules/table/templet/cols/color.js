/**
 * TableColColor
 */
layui.define(['TableColTemplet','jquery','yunj'], function (exports) {

    let TableColTemplet = layui.TableColTemplet;
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class TableColColor extends TableColTemplet{

        constructor(options) {
            super(options);
        }

        layout(){
            let that=this;
            return `{{# let color = d.${that.key}; }}
                     {{# if(color){ }}
                     <div class="table-row-color" title="复制色号:{{ color }}" data-color="{{ color }}" style="border-color:{{ color }};">
                        {{ color }}
                    </div>
                     {{# } }}`;
        }

        defineExtraEventBind(){
            let that=this;

            // 防止重复绑定事件
            if (yunj.isUndefined(win.TABLE_ROW_COLOR_CLICK_COPY_EVENT_BIND)) {
                win.TABLE_ROW_COLOR_CLICK_COPY_EVENT_BIND = true;
                $(doc).on('click','.table-row-color',function (e) {
                    yunj.copy($(this).data('color'));
                    e.stopPropagation();
                });
            }
        }

    }

    exports('TableColColor', TableColColor);
});
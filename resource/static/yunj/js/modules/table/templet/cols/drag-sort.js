/**
 * TableColDragSort
 */
layui.define(['TableColTemplet', 'jquery', 'yunj'], function (exports) {

    let TableColTemplet = layui.TableColTemplet;
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class TableColDragSort extends TableColTemplet {

        constructor(options) {
            super(options);
            this.tableSortable = null;              // 当前表格数据排序对象
            this.tableSortableBoxFlag = null;       // 当前表格数据排序容器标识
        }

        async renderBefore() {
            let that = this;
            that.tableSortableBoxFlag = `div[lay-table-id=yunj_table_${that.tableId}] .layui-table-box .layui-table-main tbody`;
            await yunj.includeJs('/static/yunj/libs/Sortable/Sortable.min.js');
            return 'done'
        }

        layout() {
            let that = this;
            let pk = that.table.getCurrPk();
            let iconClass = yunj.iconClass(that.args.iconClass);
            return `{{#  
                        let val = d.${that.key};
                        let content = "";
                        if(yunj.isUndefined(val)){
                            content = "<i class='${iconClass}'></i>";
                        }else{
                            content = "<div class='content' title='"+val+"'><i class='${iconClass}'></i>"+val+"</div>";
                        }
                     }}
                    <div class="yunj-table-drag-sort-item" data-${pk}="{{ d.${pk} }}" title="拖拽排序">{{- content }}</div>`;
        }

        defineExtraEventBind() {
            let that = this;

            // 防止重复绑定事件
            let dragSortEventBindKey = `yunj_table_${that.tableId}_render_table_done_event_bind_row_drag_sort`;
            if (yunj.isUndefined(win[dragSortEventBindKey])) {
                win[dragSortEventBindKey] = true;
                $(doc).bind(`yunj_table_${that.tableId}_render_table_done`, function () {
                    let sortableConfig = {
                        handle: `.yunj-table-drag-sort-item`,
                        animation: 150,
                        ghostClass: 'yunj-table-drag-sort-item-checked',
                        onUpdate: function (evt) {
                            that.tableSortExec(evt);
                        },
                    };
                    that.tableSortable = new Sortable(doc.querySelector(that.tableSortableBoxFlag), sortableConfig);
                });
            }

            if (yunj.isUndefined(win.TABLE_ROW_DRAG_SORT_CLICK_COPY_EVENT_BIND)) {
                win.TABLE_ROW_DRAG_SORT_CLICK_COPY_EVENT_BIND = true;
                $(doc).on('click', '.yunj-table-drag-sort-item .content', function (e) {
                    yunj.copy($(this).attr('title'));
                    e.stopPropagation();
                });
            }
        }

        // 排序执行
        tableSortExec(evt) {
            let that = this;
            let args = {
                title: '排序',
                event: 'sort',
            };
            let pk = that.table.getCurrPk();
            let pksKey = that.table.getCurrPksKey();
            args[pksKey] = [];

            // 防止页面有多个拖拽排序的表头
            $(`${that.tableSortableBoxFlag} td[data-field=${that.key}] .yunj-table-drag-sort-item`).each(function () {
                args[pksKey].push($(this).data(pk));
            });
            that.tableSortable.option("disabled", true);
            that.table.buildMap.table.asyncEventRequest(args).then(() => {
                that.tableSortable.option("disabled", false);
            }).catch(err => {
                yunj.error(err);
                that.tableSortable.option("disabled", false);
                // 复原拖拽之前的 dom
                let oldIdx = evt.oldIndex;  // 拖拽前的索引
                let newIdx = evt.newIndex;  // 拖拽后的索引
                let tagName = evt.item.tagName;
                let items = evt.from.getElementsByTagName(tagName);
                if (oldIdx > newIdx) {
                    // evt.from 推拽前列表
                    evt.from.insertBefore(evt.item, items[oldIdx + 1]);
                } else {
                    evt.from.insertBefore(evt.item, items[oldIdx]);
                }
            });

        }

    }

    exports('TableColDragSort', TableColDragSort);
});
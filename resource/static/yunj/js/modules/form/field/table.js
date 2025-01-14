/**
 * FormFieldTable
 */
layui.define(['FormField', 'yunj', 'jquery', 'table'], function (exports) {

    let win = window;
    let doc = document;
    let FormField = layui.FormField;
    let $ = layui.jquery;
    let table = layui.table;

    class FormFieldTable extends FormField {

        constructor(options = {}) {
            super(options);
            this.layTableId = '';
            this.layTable = null;                   // 当前lay表格对象
            this.layTableSortable = null;           // 当前lay表格数据排序对象
            this.layTableSortableBoxFlag = null;    // 当前lay表格数据排序容器标识
        }

        defineExtraArgs() {
            let that = this;
            return {
                maxHeight: '300',
                cols: [],
                addAction: true,
                delAction: true,
                sortAction: true,
            };
        }

        handleArgs(args) {
            // maxHeight
            let maxHeight = args.maxHeight;
            if (maxHeight) {
                args.maxHeight = args.maxHeight.toString().replace('px', '');
            }
            // cols
            let cols = args.cols;
            cols = cols ? cols : [];
            if (cols) {
                if (!yunj.isArray(cols)) {
                    throw new Error('类型[table]配置[cols]格式错误');
                }
                for (let i = 0; i < cols.length; i++) {
                    let col = cols[i];
                    if (!yunj.isObj(col)) {
                        throw new Error(`类型[table]配置[cols][${i}]格式错误`);
                    }
                    col = yunj.objSupp(col, {
                        title: '',
                        field: '',
                        width: '',
                        verify: '',
                        readonly: false
                    });
                    if (!col.title) {
                        throw new Error(`类型[table]配置[cols][${i}][title]不能为空`);
                    }
                    if (!col.field) {
                        throw new Error(`类型[table]配置[cols][${i}][field]不能为空`);
                    }
                    if (col.verify.indexOf("table") !== -1) {
                        throw new Error(`类型[table]配置[cols][${i}][verify]验证规则不能包含table`);
                    }
                    if (!yunj.isBool(col.readonly)) {
                        throw new Error(`类型[table]配置[cols][${i}][readonly]格式错误`);
                    }
                    cols[i] = col;
                }
                args.cols = cols;
            }
            // verify
            let verify = args.verify;
            if (verify.indexOf("table") === -1)
                args.verify += (verify ? "|" : "") + 'table:' + yunj.base64Encode(JSON.stringify(args.cols));

            return args;
        }

        async renderBefore() {
            let that = this;

            let layTableId = `${that.id}_table`;
            that.layTableId = layTableId;

            // 监听表格加载完成，设置表格表头必填标识
            let colsRequireMarkEventBindKey = `${that.layTableId}_event_bind_cols_require_mark`;
            if (yunj.isUndefined(win[colsRequireMarkEventBindKey])) {
                win[colsRequireMarkEventBindKey] = true;
                $(doc).bind(`${that.layTableId}_render_done`, function () {
                    let layTableHeadEl = $(`.layui-table-view[lay-table-id="${that.layTableId}"] .layui-table-box .layui-table-header table thead tr`);
                    that.args.cols.forEach(col => {
                        let {field, verify} = col;
                        let colEl = layTableHeadEl.find(`th[data-field="${field}"] .layui-table-cell`);
                        if (verify.indexOf('require') !== -1 && colEl.length > 0 && colEl.find('span.require').length <= 0) {
                            colEl.append(`<span class="require">*</span>`);
                        }
                    });
                });
            }

            if (!that.args.readonly && that.args.sortAction) {
                that.layTableSortableBoxFlag = `div[lay-table-id=${layTableId}] .layui-table-box .layui-table-main tbody`;
                await yunj.includeJs('/static/yunj/libs/Sortable/Sortable.min.js');

                // 监听表格内拖拽排序事件
                let dragSortEventBindKey = `${that.layTableId}_event_bind_sort`;
                if (yunj.isUndefined(win[dragSortEventBindKey])) {
                    win[dragSortEventBindKey] = true;
                    $(doc).bind(`${that.layTableId}_render_done`, function () {
                        let sortableConfig = {
                            handle: `.yunj-form-table-sort-item`,
                            animation: 150,
                            ghostClass: 'yunj-form-table-sort-item-checked',
                            onUpdate: function (evt) {
                                that.layTableSortExec(evt);
                            },
                        };
                        that.layTableSortable = new Sortable(doc.querySelector(that.layTableSortableBoxFlag), sortableConfig);
                    });
                }
            }

            return 'done';
        }

        layoutControl() {
            let that = this;
            let controlHtml = `<table class="layui-table" id="${that.layTableId}" lay-filter="${that.layTableId}"></table>`;
            return `<div class="layui-input-inline yunj-form-item-control">${controlHtml}</div>`;
        }

        async renderDone() {
            let that = this;
            let tableArgs = {
                elem: `#${that.layTableId}`,
                loading: false,
                maxHeight: 300,
                data: [],
                done: function (res) {
                    table.resize(this.id);
                    // 渲染表格完成事件触发
                    $(doc).trigger(`${that.layTableId}_render_done`);
                }
            };
            // maxHeight
            if (that.args.maxHeight) {
                tableArgs.maxHeight = that.args.maxHeight;
            }
            // cols
            tableArgs.cols = [that.getLayTableArgsByCols()];
            // pagebar
            if (!that.args.readonly && that.args.addAction) {
                let actionHtml = `<script type="text/html" id="${that.id}_pagebar_templet">
                                        <div class="layui-btn-group">
                                            <button type="button" class="layui-btn layui-btn-xs" lay-event="add">
                                                <i class="layui-icon layui-icon-addition"></i>追加
                                            </button>
                                        </div>
                                    </script>`;
                $(doc).find('body').append(actionHtml);
                tableArgs.pagebar = `#${that.id}_pagebar_templet`;
            }

            //console.log(tableArgs);
            that.layTable = table.render(tableArgs);
            return 'done';
        }

        // 获取表格表头配置
        getLayTableArgsByCols() {
            let that = this;
            let tableCols = [];
            // sort
            if (!that.args.readonly && that.args.sortAction) {
                let actionHtml = `<script type="text/html" id="${that.layTableId}_sort_templet">
                                        <div class="yunj-form-table-sort-item" title="拖拽排序" data-idx="{{d.LAY_INDEX}}">
                                            <i class="yunj-icon yunj-icon-sort-circle"></i>
                                        </div>
                                    </script>`;
                $(doc).find('body').append(actionHtml);
                tableCols.push({
                    title: '排序',
                    width: 40,
                    align: 'center',
                    templet: `#${that.layTableId}_sort_templet`
                });
            }
            // 配置表头
            for (let i = 0; i < that.args.cols.length; i++) {
                let col = that.args.cols[i];
                let tableCol = {
                    title: col.title,
                    field: col.field,
                };
                if (col.width) {
                    tableCol.width = col.width;
                }
                if (!that.args.readonly && !col.readonly) {
                    tableCol.edit = 'text';
                }
                tableCols.push(tableCol);
            }
            // action
            if (!that.args.readonly) {
                let actionBtnGroupHtml = '';
                if (that.args.delAction) {
                    actionBtnGroupHtml += `<button type="button" class="layui-btn layui-btn-xs layui-bg-red" lay-event="del">
                                            <i class="layui-icon layui-icon-delete"></i>
                                        </button>`;
                }
                if (actionBtnGroupHtml) {
                    let actionHtml = `<script type="text/html" id="${that.layTableId}_action_templet">
                                        <div class="layui-btn-group">${actionBtnGroupHtml}</div>
                                    </script>`;
                    $(doc).find('body').append(actionHtml);
                    tableCols.push({
                        title: '操作',
                        width: 80,
                        align: 'center',
                        // fixed: 'right',
                        templet: `#${that.layTableId}_action_templet`
                    });
                }
            }
            return tableCols;
        }

        // 设置值
        setValue(val = "") {
            let that = this;
            if (val && yunj.isString(val) && yunj.isJson(val)) {
                val = JSON.parse(val);
            }
            if (!val || !yunj.isArray(val)) {
                val = [];
            }

            that.layTable.reload({
                data: val
            });
        }

        getValue() {
            let that = this;
            return table.getData(that.layTableId);
        }

        // 排序执行
        layTableSortExec(evt) {
            let that = this;
            // 复原拖拽之前的 dom
            let oldIdx = evt.oldIndex;  // 拖拽前的索引
            let newIdx = evt.newIndex;  // 拖拽后的索引

            let datas = that.getValue();
            // 从数组中移除元素
            let data = datas.splice(oldIdx, 1)[0];
            // 将移除的元素插入到新的位置
            datas = datas.slice(0, newIdx).concat(data, datas.slice(newIdx));
            // 重新设置元素值
            that.setValue(datas);
        }

        // 定义事件绑定
        defineExtraEventBind() {
            let that = this;

            if (!that.args.readonly) {
                // 监听表格内操作列事件
                table.on(`tool(${that.layTableId})`, function (obj) {
                    let rowIdx = obj.index;
                    switch (obj.event) {
                        case 'del':
                            let datas = that.getValue();
                            datas = [...datas.slice(0, rowIdx), ...datas.slice(rowIdx + 1)];
                            that.setValue(datas);
                            break;
                    }
                });

                // 监听表格内分页栏事件
                table.on(`pagebar(${that.layTableId})`, function (obj) {
                    switch (obj.event) {
                        case 'add':
                            // 增加一行
                            let datas = that.getValue();
                            let newRowVal = {};
                            that.args.cols.forEach(col => {
                                newRowVal[col.field] = '';
                            });
                            datas.push(newRowVal);
                            that.setValue(datas);
                            break;
                    }
                });
            }

        }

    }

    exports('FormFieldTable', FormFieldTable);
});
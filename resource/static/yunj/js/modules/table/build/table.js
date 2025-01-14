/**
 * TableBuildTable
 */
layui.define(['jquery', 'yunj', "TableBuild", 'treeTable'], function (exports) {

    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let table = layui.treeTable;
    let TableBuild = layui.TableBuild;

    class TableBuildTable extends TableBuild {

        constructor(table) {
            super(table, "table");

            this.fieldSort = {};                // 表格字段排序

            this.itemsCount = 0;                // 当前表格数据项数量

            this.items = [];                    // 当前表格数据项

            this.layTableId = `yunj_table_${this.tableId}`;     // 当前lay表格id

            this.layTable = null;               // 当前lay表格对象

            this.layTableCurrTd = null;         // 当前lay表格操作格子，用于触发工具栏展开绑定事件无效

            this.layEventMark = 'yunjTableLayEvent';    // 当前lay表格event事件标识（标识这个lay-event为云静table的事件）

            this.layEventLocation = {toolbar: 'toolbar', defaultToolbar: 'defaultToolbar', action: 'action'};    // 当前lay表格event事件标记（标识这个lay-event为云静table的事件的位置）

            // 树形表格默认值
            this.treeDef = {
                customName: {
                    children: 'YUNJ_TREE_TABLE_CHILDREN',
                    isParent: 'YUNJ_TREE_TABLE_IS_PARENT',
                    icon: 'YUNJ_TREE_TABLE_ICON'
                }
            }

            this._initLayTable();
        }

        // 初始化build
        _initBuild() {
        }

        // 初始化
        _initLayTable() {
            let that = this;
            if (!that.isSetCols()) throw new Error(`表格[${that.tableId}]未设置[cols]`);

            let buildBoxElClass = "yunj-table-lay-table-box";
            that.tableBoxEl.append(`<div class="${buildBoxElClass}" style="padding-top: 0">
                                        <table class="layui-table" id="${that.layTableId}" lay-filter="${that.layTableId}"></table>
                                    </div>`);
            that.buildBoxEl = that.tableBoxEl.find(`.${buildBoxElClass}`);
        }

        /**
         * 渲染
         * @param mode  渲染方式(YunjTable.RENDER_MODE)
         * @return {Promise<void>}
         */
        async render(mode = '') {
            let that = this;
            that._renderBefore();
            let rawArgs = that.table.rawArgs;
            let state = that.isSetState() ? that.getCurrState() : null;
            let filter = that.getCurrRequestFilter();
            let args = {
                elem: '#' + that.layTableId,
                url: that.table.url,
                method: 'post',
                where: {
                    [yunj.config('builder.id_key')]: that.tableId,
                    [yunj.config('builder.async_type_key')]: 'items',
                    filter: filter,
                    sort: that.getCurrRequestSort()
                },
                contentType: 'application/json',
                parseData: function (res) {
                    let data = res.data;
                    let items = yunj.isObj(data) && data.hasOwnProperty('items') && data.items ? data.items : [];
                    items.map(item => {
                        item.is_export = false;
                        return item;
                    });
                    that.items = that._handleItems(items);

                    return {
                        "code": res.errcode,
                        "msg": res.msg,
                        "count": that.itemsCount,
                        "data": that.items
                    };
                },
                tree: {
                    customName: {
                        children: '',
                        isParent: '',
                        name: '',
                        id: '',
                        pid: '',
                        icon: ''
                    },
                    view: {
                        iconClose: '',
                        iconOpen: '',
                        iconLeaf: ''
                    }
                },
                loading: true,
                text: {none: '暂无相关数据'},
                autoSort: false,
                defaultToolbar: [],
                cols: [],
                done: function (res) {
                    that.resize();
                    // 渲染表格完成事件触发
                    $(doc).trigger(`yunj_table_${that.tableId}_render_table_done`);
                }
            };

            // page
            if (that.isSetPage()) {
                if (that.isSetState()) {
                    args.page = yunj.isObj(rawArgs.page) && rawArgs.page.hasOwnProperty(state) ? rawArgs.page[state] : true;
                } else {
                    args.page = yunj.isBool(rawArgs.page) ? rawArgs.page : true;
                }
                // limit
                if (that.isSetLimit()) {
                    if (that.isSetState()) {
                        args.limit = yunj.isObj(rawArgs.limit) && rawArgs.limit.hasOwnProperty(state) ? rawArgs.limit[state] : 20;
                    } else {
                        args.limit = yunj.isPositiveInt(rawArgs.limit) ? rawArgs.limit : 20;
                    }
                }
                // limits
                if (that.isSetLimits()) {
                    if (that.isSetState()) {
                        args.limits = yunj.isObj(rawArgs.limits) && rawArgs.limits.hasOwnProperty(state) ? rawArgs.limits[state] : [10, 20, 30, 40, 50, 60, 70, 80, 90];
                    } else {
                        args.limits = yunj.isPositiveIntArray(rawArgs.limits) ? rawArgs.limits : [10, 20, 30, 40, 50, 60, 70, 80, 90];
                    }
                }
            }

            if (!yunj.isEmptyObj(that.fieldSort)) {
                let field = Object.keys(that.fieldSort)[0];
                args.initSort = {field: field, type: that.fieldSort[field]};
            }

            // 表格头部工具栏
            if (that.isSetToolbar()) await that._setTableArgsByToolbar(args);

            // 表格头部右侧工具栏
            if (that.isSetDefaultToolbar()) that._setTableArgsByDefaultToolbar(args);

            // 表格树形配置
            if (that.isSetTree()) that._setTableArgsByTree(args);

            // 表头
            await that._setTableArgsByCols(args);

            // 提前进入loading，防止在进行状态栏切换时，由于itemsCount的网络请求导致前面一段时间一直显示原始状态的表格结构和数据
            let layTableViewEl = that.buildBoxEl.find('.layui-table-view');
            if (layTableViewEl.length > 0) {
                layTableViewEl.html(`<div style="flex: 1;text-align: center;">
                                        <i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop" style="margin-left: -15px"></i>
                                    </div>`);
            }

            // 数据量
            await that._setItemsCount(filter);

            that.layTable = table.render(args);

            console.log(args, that.layTable);

            that._renderAfter();
        }

        // 设置表格头部工具栏参数
        async _setTableArgsByToolbar(args) {
            let that = this;
            let rawArgs = that.table.rawArgs;

            let tableToolbarOptions = {
                tableId: that.tableId,
                key: 'toolbar',
            };
            if (that.isSetState()) {
                let state = that.getCurrState();
                if (!rawArgs.toolbar.hasOwnProperty(state)) return;
                tableToolbarOptions.state = state;
                tableToolbarOptions.options = rawArgs.toolbar[state];
            } else {
                tableToolbarOptions.options = rawArgs.toolbar;
            }
            await new Promise(resolve => {
                layui.use("tableToolbar", () => {
                    layui.tableToolbar(tableToolbarOptions).render().then(obj => {
                        args.toolbar = `#${obj.id}`;
                        resolve();
                    });
                });
            });
        }

        // 设置表格头部右侧工具栏参数
        _setTableArgsByDefaultToolbar(args) {
            let that = this;
            let rawArgs = that.table.rawArgs;
            let state = that.getCurrState();
            let defaultToolbar = [];
            let rawDefaultToolbar = [];
            if (that.isSetState()) {
                rawDefaultToolbar = yunj.isObj(rawArgs.defaultToolbar) && rawArgs.defaultToolbar.hasOwnProperty(state) ? rawArgs.defaultToolbar[state] : {};
            } else {
                rawDefaultToolbar = yunj.isObj(rawArgs.defaultToolbar) ? rawArgs.defaultToolbar : {};
            }
            for (let k in rawDefaultToolbar) {
                if (!rawDefaultToolbar.hasOwnProperty(k)) continue;
                let v = rawDefaultToolbar[k];
                v.class = yunj.iconClass(v.class);
                if (k === 'filter' || k === 'print') {
                    defaultToolbar.push(k);
                } else if (k === 'export') {
                    defaultToolbar.push({title: '数据导出', layEvent: 'export', icon: 'layui-icon-export'});
                } else {
                    defaultToolbar.push({
                        title: v.title,
                        layEvent: that.generateLayEvent(that.layEventLocation.defaultToolbar, k, v),
                        icon: v.class
                    });
                }
            }

            if (defaultToolbar.length > 0) {
                if (!args.hasOwnProperty('toolbar')) args.toolbar = true;
                args.defaultToolbar = defaultToolbar;
            } else {
                args.defaultToolbar = [];
            }
        }

        // 设置表格树形配置参数
        _setTableArgsByTree(args) {
            let that = this;
            let rawArgs = that.table.rawArgs;
            let state = that.getCurrState();
            let rawTree;
            if (that.isSetState()) {
                rawTree = yunj.isObj(rawArgs.tree) && rawArgs.tree.hasOwnProperty(state) ? rawArgs.tree[state] : {};
            } else {
                rawTree = yunj.isObj(rawArgs.tree) ? rawArgs.tree : {};
            }
            if (!rawTree || yunj.isEmptyObj(rawTree)) {
                return;
            }
            let pk = that.getCurrPk();
            args.tree.customName = {
                children: that.treeDef.customName.children,
                isParent: that.treeDef.customName.isParent,
                name: "name",
                id: pk,
                pid: that.treeItemParentField(),
                icon: that.treeDef.customName.icon
            };
        }

        // 树形表格单条数据表示归属父级的字段
        treeItemParentField() {
            let that = this;
            return `p${that.getCurrPk()}`;
        }

        // 设置表格表头参数
        async _setTableArgsByCols(args) {
            let that = this;
            let rawArgs = that.table.rawArgs;
            let state = that.getCurrState();
            let cols = [];
            let rawCols = [];
            if (that.isSetState()) {
                if (!rawArgs.cols.hasOwnProperty(state)) return;
                rawCols = rawArgs.cols[state];
            } else {
                rawCols = rawArgs.cols;
            }

            let isSetTree = that.isSetTree();

            for (let k in rawCols) {
                if (!rawCols.hasOwnProperty(k)) continue;
                let rawCol = JSON.parse(JSON.stringify(rawCols[k]));
                let col = yunj.objSupp(rawCol, {
                    field: '',
                    title: '',
                    type: 'normal',
                    align: 'left',
                    sort: false,
                    fixed: false,
                    hide: false,
                    templet: '',
                    minWidth: 80
                });
                col = JSON.parse(JSON.stringify(col));
                // 判断是否纯数据类型，不用于表头展示
                if (col.type === 'data') {
                    continue;
                }
                // 处理hide
                col.hide = false;
                if (yunj.isBool(rawCol.hide)) {
                    // bool
                    col.hide = rawCol.hide;
                } else if (yunj.isString(rawCol.hide)) {
                    // string
                    let hideStr = rawCol.hide.toLowerCase();
                    if (hideStr === 'yes' || hideStr === 'y') {
                        col.hide = true;
                    } else if (hideStr === 'mobilehide') {
                        col.hide = yunj.isMobile();
                    }
                }
                // 处理templet
                let rawTemplet = rawCol['templet'];
                // 树形表格不支持拖拽排序
                if (rawTemplet === 'dragSort' && isSetTree) {
                    rawTemplet = '';
                }
                if (rawTemplet.length > 0) {
                    let templetArgs = {
                        tableId: that.tableId,
                        key: rawCol.field,
                        args: rawCol,
                    };
                    if (that.isSetState()) templetArgs.state = state;

                    await new Promise(resolve => {
                        yunj.tableCol(rawTemplet, templetArgs).then(colObj => {
                            colObj.render().then(res => {
                                col['templet'] = `#${colObj.id}`;
                                resolve();
                            }).catch(err => {
                                console.log(err);
                                yunj.error(err);
                                resolve();
                            });
                        });
                    });
                }

                if (rawTemplet === 'action') col.minWidth = 80;
                cols.push(col);
            }
            args.cols = [cols];
        }

        /**
         * 处理响应数据
         * @param {array} items
         * @private
         */
        _handleItems(items) {
            let that = this;
            if (items.length <= 0) {
                return;
            }
            if (that.isSetTree()) {
                let pkField = that.getCurrPk();
                let parentField = that.treeItemParentField();
                items = that._handleTreeItems(pkField, parentField, null, items);
            }
            return items;
        }

        /**
         * 处理树形表格响应数据
         * @param {string} pkField
         * @param {string} parentField
         * @param {string|number} parent
         * @param {array} waitItems
         * @private
         */
        _handleTreeItems(pkField, parentField, parent, waitItems,) {
            let that = this;
            let treeItems = [];
            for (let i = 0; i < waitItems.length; i++) {
                let item = waitItems[i];
                let itemPk = item[pkField];
                let itemParent = item[parentField];

                if (
                    (parent && parent === itemParent)   // 有传入父节点
                    || (!parent && !itemParent)         // 没有传入父节点，顶级
                ) {
                    let childItems = that._handleTreeItems(pkField, parentField, itemPk, waitItems);
                    item[that.treeDef.customName.children] = childItems;
                    item[that.treeDef.customName.isParent] = childItems.length > 0;
                    treeItems.push(item);
                }
            }
            return treeItems;
        }

        /**
         * 设置当前条件下的表格数据量
         * @param filter
         * @param renderMode    渲染模式(YunjTable.RENDER_MODE)
         * @return {Promise<unknown>}
         * @private
         */
        _setItemsCount(filter = null, renderMode = '') {
            let that = this;
            filter = filter || that.getCurrRequestFilter();
            return new Promise(resolve => {
                yunj.request(that.table.url, {
                    [yunj.config('builder.id_key')]: that.tableId,
                    [yunj.config('builder.async_type_key')]: 'count',
                    filter: filter
                }, "post").then(res => {
                    let count = res.data.count;
                    that.itemsCount = yunj.isPositiveInteger(count) ? count : 0;
                    resolve();
                }).catch(e => {
                    yunj.error(e);
                });
            });
        }

        // 渲染前
        _renderBefore() {
            let that = this;

            // 绑定获取请求filter data的触发事件
            let eventRepeatKey = `YUNJ_TABLE_${that.tableId}_GET_REQUEST_FILTER_DATA_EVENT_BIND_BY_LAY_TABLE`;
            if (yunj.isUndefined(win[eventRepeatKey])) {
                win[eventRepeatKey] = true;
                $(doc).bind(`yunj_table_${that.tableId}_get_request_filter_data`, function (e, data, args) {
                    let pk = that.getCurrPk();
                    let pksKey = that.getCurrPksKey();
                    if (!args[pksKey]) {
                        return;
                    }
                    data[pksKey] = table.checkStatus(that.layTableId).data.map(row => {
                        return row[pk];
                    });
                });
            }
        }

        // 渲染后
        _renderAfter() {
        }

        // 因为数据变化产生的渲染
        async renderByDataChange() {
            let that = this;
            if (that.isSetState()) await that.table.buildMap.state.renderCount();
            await that.render();
        }

        // 重置表格尺寸
        resize() {
            let that = this;
            table.resize(that.layTable.config.id);
        }

        /**
         * 重载
         * @param {boolean} isFirstPage [是否从第一页开始]
         */
        reload(isFirstPage = true) {
            let that = this;
            let args = {
                where: {
                    id: that.tableId,
                    type: 'items',
                    filter: that.getCurrRequestFilter(),
                    sort: that.getCurrRequestSort()
                }
            };
            if (isFirstPage) args.page = {curr: 1};
            that.layTable.reload(args);
        }

        setEventBind() {
            let that = this;

            // 绑定筛选表单提交的触发事件
            $(doc).bind(`yunj_table_${that.tableId}_filter_submit`, function (e) {
                that.render();
            });

            // 当前展开格子
            let target = `.yunj-table-lay-table-box div[lay-id=${that.layTableId}] .layui-table-grid-down`;
            $(doc).off('mousedown', target).on('mousedown', target, function () {
                that.layTableCurrTd = $(this).closest('td');
            });

            // 展开格子事件
            target = `.layui-table-tips-main .layui-btn-container[yunj-id=${that.tableId}] [lay-event]`;
            $(doc).off('click', target).on('click', target, function () {
                if (!that.layTableCurrTd) return;
                let el = $(this);
                let layEvent = el.attr('lay-event');
                let layerIdx = el.closest('.layui-table-tips').attr('times');
                layer.close(layerIdx);
                that.layTableCurrTd.find(`[lay-event="${layEvent}"]`).first().click();
            });

            // 监听工具栏事件
            if (that.isSetToolbar() || that.isSetDefaultToolbar()) {
                table.on(`toolbar(${that.layTableId})`, function (obj) {
                    if (obj.event.indexOf(that.layEventMark) !== -1) return that.handleLayEvent(obj);
                    switch (obj.event) {
                        case 'export':
                            yunj.tableExport(that.table);
                            break;
                    }
                });
            }

            // 监听表格内操作列事件
            table.on(`tool(${that.layTableId})`, function (obj) {
                if (obj.event.indexOf(that.layEventMark) !== -1) return that.handleLayEvent(obj);
            });

            // 监听表头排序事件
            table.on(`sort(${that.layTableId})`, function (obj) {
                that.fieldSort = ['asc', 'desc'].indexOf(obj.type) === -1 ? {} : {[obj.field]: obj.type};
                that.reload(false);
            });
        }

        /**
         * 处理lay-event事件
         * @param layEventObj
         */
        handleLayEvent(layEventObj) {
            let that = this;
            let [location, event, args] = that.parseLayEvent(layEventObj.event);

            let handle = function () {
                let pk = that.getCurrPk();
                let pksKey = that.getCurrPksKey();
                switch (args.type) {
                    case 'openPopup':
                        let popupParam = {rawTable: that.tableId};
                        let popupTitle = args.title;
                        if (location === that.layEventLocation.action) {
                            let rowPk = layEventObj.data[pk];
                            popupTitle += ` ${pk}:${rowPk}`;
                            popupParam[pk] = rowPk;
                        }
                        yunj.openPopup(yunj.handlePageUrl(yunj.urlPushParam(args.url, popupParam)), popupTitle, true);
                        break;
                    case 'openTab':
                        let tabParam = {rawTable: that.tableId};
                        let tabTitle = args.title;
                        if (location === that.layEventLocation.action) {
                            let rowPk = layEventObj.data[pk];
                            tabTitle += ` ${pk}:${rowPk}`;
                            tabParam[pk] = rowPk;
                        }
                        yunj.openTab(yunj.handlePageUrl(yunj.urlPushParam(args.url, tabParam)), tabTitle, true);
                        break;
                    case 'asyncEvent':
                        args[pksKey] = location === that.layEventLocation.action ? [layEventObj.data[pk]]
                            : table.checkStatus(layEventObj.config.id).data.map(row => {
                                return row[pk];
                            });
                        if ((!yunj.isArray(args[pksKey]) || yunj.isEmptyArray(args[pksKey])) && (location !== that.layEventLocation.defaultToolbar)) {
                            yunj.msg('请勾选要操作的数据列');
                            return;
                        }
                        args.event = event;
                        that.asyncEventRequest(args).catch(err => {
                            yunj.error(err);
                        });
                        break;
                    default:
                        // 触发前端事件
                        console.log(`yunj_table_${that.tableId}_${event}`);
                        $(doc).trigger(`yunj_table_${that.tableId}_${event}`, [layEventObj]);
                }
            };

            if (args.confirmText)
                yunj.confirm(args.confirmText, function () {
                    handle();
                });
            else
                handle();
        }

        /**
         * 请求条件sort
         * @returns {string}
         */
        getCurrRequestSort() {
            return JSON.stringify(this.fieldSort);
        }

        // 表格异步事件请求
        asyncEventRequest(param) {
            let that = this;
            let pksKey = that.getCurrPksKey();
            let defParam = {title: '操作请求', event: '', url: ''};
            defParam[pksKey] = [];
            param = yunj.objSupp(param, defParam);
            let filter = {
                state: that.getCurrState()
            };
            filter[pksKey] = param[pksKey];
            let requestParam = {
                [yunj.config('builder.id_key')]: that.tableId,
                [yunj.config('builder.async_type_key')]: 'event',
                [yunj.config('builder.async_event_key')]: param.event,
                filter: JSON.stringify(filter)
            };

            return new Promise((resolve, reject) => {
                yunj.request({
                    url: param.url ? param.url : that.url,
                    data: requestParam,
                    type: 'post',
                    loading: true
                }).then(res => {
                    let requestData = requestParam.filter;
                    let event = requestData.event;

                    if (yunj.isObj(res.data) && res.data.hasOwnProperty('reload') && res.data.reload) {
                        that.renderByDataChange().then(() => {
                            that.asyncEventRequestDone(event, requestData, res);
                        });
                        resolve();
                        return;
                    }
                    that.asyncEventRequestDone(event, requestData, res);
                    resolve();
                }).catch(e => {
                    reject(e);
                });
            });
        }

        // 异步事件请求完成
        asyncEventRequestDone(event, requestData, responseRes) {
            let that = this;
            $(doc).trigger(`yunj_table_${that.tableId}_event_done`, [event, requestData, responseRes]);
            $(doc).trigger(`yunj_table_${that.tableId}_event_${event}_done`, [requestData, responseRes]);
        }

        /**
         * 生成lay-event名称
         * @param {string} location 位置：toolbar、defaultToolbar、action
         * @param {string} key  事件key
         * @param {object} config  事件配置
         * @returns {string}
         */
        generateLayEvent(location, key, config) {
            let that = this;
            return `${that.layEventMark}==>${location}==>${key}==>` + encodeURIComponent(JSON.stringify(config));
        }

        /**
         * 解析lay-event名称
         * @param layEvent
         */
        parseLayEvent(layEvent) {
            let that = this;
            let [layEventMark, location, event, args] = layEvent.split('==>');
            args = JSON.parse(decodeURIComponent(args));
            return [location, event, args];
        }

    }

    exports('TableBuildTable', TableBuildTable);
});
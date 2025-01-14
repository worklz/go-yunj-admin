/**
 * ImportStepThree
 */
layui.define(['jquery', 'yunj', "ImportStepTypeTable"], function (exports) {

    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let ImportStepTypeTable = layui.ImportStepTypeTable;

    class ImportStepThree extends ImportStepTypeTable {

        constructor(importObj) {
            super(importObj, "three", "导入数据");
            this.typeSort = ['all', 'success', 'fail'];
            this.typeConfig = {
                all: {
                    desc: '所有数据',
                    importBtnStatus: {
                        wait: {desc: '开始导入'},
                        importing: {desc: '正在导入...'},
                        completed: {desc: '导入完成/关闭'},
                        go_on: {desc: '继续导入'},
                    },
                },
                success: {desc: '成功数据'},
                fail: {desc: '失败数据'},
            };
            this.itemImportStatus = {
                wait: {code: 'wait', desc: '等待导入'},
                importing: {code: 'importing', desc: '正在导入'},
                success: {code: 'success', desc: '导入成功'},
                fail: {code: 'fail', desc: '导入失败', error: {}},
            }
            this.currType = 'all';
            this.isImporting = false;   // 是否导入中
        }

        async render(refresh = false) {
            let that = this;
            if (!refresh) {
                return;
            }
            that.initData();
            that.setContentBoxHtml();
            that.handleItems();
            that.setCurrType('all');
            that.setImportProgress();
        }

        // 设置当前类型
        setCurrType(type) {
            let that = this;
            super.setCurrType(type, () => {
                if (type === 'fail') {
                    that.setTypeTabTablesCheckCount(type);
                }
            });
        }

        initData() {
            let that = this;
            super.initData();
            that.isImporting = true;
        }

        // 处理所有上传数据
        handleItems() {
            let that = this;
            let items = that.getCheckedImportItems();
            if (yunj.isObj(items)) {
                for (let sheet in items) {
                    if (!items.hasOwnProperty(sheet)) {
                        continue;
                    }
                    items[sheet].forEach(item => {
                        item._importStatus = that.itemImportStatus.wait;
                        that.addAllItem(item);
                    });
                }
            } else {
                items.forEach(item => {
                    item._importStatus = that.itemImportStatus.wait;
                    that.addAllItem(item);
                });
            }
            that.renderTypeCount('all');
        }

        // 新增所有的item
        addAllItem(item) {
            let that = this;
            that.addTypeItem('all', item);
        }

        // 新增成功的item
        addSuccessItem(item) {
            let that = this;
            that.addTypeItem('success', item);
        }

        // 新增失败的item
        addFailItem(item) {
            let that = this;
            that.addTypeItem('fail', item);
        }

        // 删除失败的item
        delFailItem(item) {
            let that = this;
            that.delTypeItem('fail', item);
        }

        // 判断指定item是否可以导入
        checkItemIsCanImport(item) {
            return item && yunj.isObj(item) && item.hasOwnProperty('_importStatus') && item._importStatus.code === 'wait';
        }

        // 获取所有的数据量
        getAllItemsCount(sheet = false) {
            let that = this;
            return that.getTypeItemsCount('all', sheet);
        }

        // 获取成功的数据量
        getSuccessItemsCount() {
            let that = this;
            return that.getTypeItemsCount('success');
        }

        // 获取错误的数据量
        getFailItemsCount() {
            let that = this;
            return that.getTypeItemsCount('fail');
        }

        // 渲染所有类型的操作html
        renderAllActionHtml() {
            let that = this;
            let formId = that.getCurrTypeActionFormId();
            that.typeActionEl.append(`<div class="action all">
                                            <div class="tips">已上传<em class="import-rate"></em></div>
                                            <form class="layui-form layui-form-pane" lay-filter="${formId}">
                                                <div class="layui-form-item" style="margin: 0">
                                                    <button type="button" class="layui-btn layui-btn-sm btn-import" data-status="wait">
                                                        ${that.typeConfig.all.importBtnStatus.wait.desc}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>`);
            // 绑定事件
            that.typeActionEl.on('click', '.all .layui-form .btn-import', function (e) {
                let btnEl = $(this);
                let status = btnEl.data('status');
                if (status === 'importing') {
                    yunj.msg('数据正在导入中...');
                } else if (status === 'completed') {
                    yunj.confirm('数据导入完成，确认退出？', function () {
                        yunj.closeCurr();
                    });
                } else if (status === 'wait' || status === 'go_on') {
                    if (that.getAllItemsCount() <= 0) {
                        yunj.msg('暂无可导入数据');
                    } else {
                        yunj.confirm("确认导入？", function () {
                            that.importHandle().then(() => {
                                yunj.msg('数据导入完成');
                                if (that.getSuccessItemsCount() > 0) {
                                    let rawTable = yunj.rawTable();
                                    rawTable && rawTable.render();
                                }
                            }).catch(e => {
                                console.log(e);
                                yunj.error(e);
                            });
                        });
                    }
                }
                e.stopPropagation();
            });
        }

        // 设置失败类型的html
        renderFailActionHtml() {
            let that = this;
            let formId = that.getCurrTypeActionFormId();
            let checkAllFilter = that.getTypeCheckAllFilter('fail');
            that.typeActionEl.append(`<div class="action fail">
                                            <div class="tips">选中<em class="check-count">0</em>条</div>
                                            <form class="layui-form layui-form-pane" lay-filter="${formId}">
                                                <div class="layui-form-item" style="margin: 0">
                                                    <input type="checkbox" title="全选" lay-filter="${checkAllFilter}">
                                                    <button type="button" class="layui-btn layui-btn-sm btn-check-submit">验证/提交至所有</button>
                                                </div>
                                            </form>
                                        </div>`);
            that.actionNoticeEl.html('注意：可对失败数据修改后点击【验证/提交至所有】按钮重新导入数据！')
            that.layForm.render('checkbox', formId);
            // 监听选中事件
            that.layForm.on(`checkbox(${checkAllFilter})`, function (data) {
                that.setCurrTypeTabTablesCheckAll(data.elem.checked);
            });
            that.typeActionEl.find(`.action.fail input[type=checkbox][lay-filter='${checkAllFilter}']`).prop("checked", true);
            that.layForm.render('checkbox', formId);

            // 失败数据验证并提交
            that.contentBoxEl.on('click', '.type-action .action.fail .btn-check-submit', function (e) {
                that.failItemsCheckSubmit();
                e.stopPropagation();
            });
        }

        // 失败数据验证并提交
        failItemsCheckSubmit() {
            let that = this;
            super.typeTabTableItemsCheckSubmit('fail', (item) => {
                // 成功
                item._importStatus = that.itemImportStatus.wait;
                that.delFailItem(item);
                that.addAllItem(item);
            }, (item, validate) => {
                // 失败
                item._importStatus = that.itemImportStatus.fail;
                item._importStatus.desc = validate.getError();
                item._importStatus.error = validate.getFieldError();
                that.changeItem(item);
            }, (successCount, errorCount) => {
                // 已完成
                if (successCount) {
                    that.reloadTypeHtml('fail');
                    that.setTypeTabTablesCheckCount('fail');
                    that.reloadTypeHtml('all');
                    that.setImportProgress();
                    that.setAllActionImportBtnStatus('go_on');
                }
                if (errorCount) {
                    yunj.msg(`仍有${errorCount}条数据错误，请修改后重新提交`);
                }
            });
        }

        // 失败表格单元格数据校验
        failCellCheck(cellEl) {
            let that = this;
            super.checkCellData(cellEl, (rowData, field, validate) => {
                // 校验失败执行
                rowData._importStatus.error[field] = validate.getError();
            });
        }

        // 设置所有数据状态下导入按钮状态
        setAllActionImportBtnStatus(status) {
            let that = this;
            let statusConfig = that.typeConfig.all.importBtnStatus[status];
            that.typeActionEl.find('.all .layui-form .btn-import').data('status', status).html(statusConfig.desc);
        }

        // 获取指定类型tab表格tab切换栏标题附加元素
        getTypeTabTableTabTitleAppendHtml(type, sheet) {
            let that = this;
            if (type === 'all') {
                let allCount = that.getAllItemsCount(sheet);
                return `<span class="layui-badge count wait layui-bg-cyan" title="${allCount}条数据等待导入" >${allCount}</span>
                        <span class="layui-badge count importing layui-bg-blue" title="暂无导入中数据">0</span>
                        <span class="layui-badge count success layui-bg-green" title="暂无导入成功数据">0</span>
                        <span class="layui-badge count fail" title="暂无导入失败数据">0</span>
                            <i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>`;
            }
            return `<span class="layui-badge count ${type === 'success' ? 'layui-bg-green' : ''}">${that.getTypeItemsCount(type, sheet)}</span>`;
        }

        // 获取指定类型tab表格表头
        getTypeTabTableCols(type, sheet = false) {
            let that = this;
            let cols = that.getCols(sheet);
            let layTableCols = [];
            if (type === 'fail') {
                layTableCols.push({field: '_id', type: 'checkbox', LAY_CHECKED: true});
            }
            if (type === 'all' || type === 'fail') {
                layTableCols.push({
                    field: '_importStatus',
                    title: '导入状态',
                    templet: function (d) {
                        return `<div class="import-status-cell ${d._importStatus.code}" id="import_status_${type}_cell_${d._id}" title="${d._importStatus.desc}">${d._importStatus.desc}</div>`;
                    }
                });
            }
            for (let field in cols) {
                if (!cols.hasOwnProperty(field)) {
                    continue;
                }
                let col = {field: field, type: 'normal', title: cols[field].title};
                if (type === 'fail') {
                    col.edit = 'text';
                    // 判断是否错误字段
                    col.templet = function (d) {
                        if (d._importStatus.hasOwnProperty('error') && yunj.isObj(d._importStatus.error)
                            && d._importStatus.error.hasOwnProperty(field)) {
                            let fieldError = d._importStatus.error[field];
                            return `<div class="fail-cell" title="${fieldError}" data-field="${field}" data-row-data='${JSON.stringify(d)}'>${d[field]}</div>`;
                        }
                        return d[field];
                    };
                }
                layTableCols.push(col);
            }
            return layTableCols;
        }

        // 渲染指定类型tab表格后执行
        renderTypeTabTableDone(tableObj, type, sheet) {
            let that = this;
            that.layTable.resize(tableObj.id);

            if (type === 'fail') {
                // 设置指定类型的选中数量
                that.setTypeTabTablesCheckCount(type);

                that.layTable.on(`checkbox(${tableObj.id})`, function (obj) {
                    if (obj.type === 'all') {
                        that.setItemsChecked(obj.checked, type, sheet);
                    } else {
                        that.setItemChecked(obj.checked, type, obj.data);
                    }
                    that.setTypeTabTablesCheckCount(type);
                });
                // 取消全选
                let checkAllEl = that.typeTabTablesEl.find(`.layui-table-view[lay-id=${this.id}] .layui-table-header thead:first tr:first th:first .layui-form-checkbox`);
                let isChecked = checkAllEl.hasClass("layui-form-checked");
                if (isChecked) {
                    checkAllEl.click();
                }
            }
        }

        // 修改指定item导入状态
        changeItemImportStatus(item, status = false) {
            let that = this;
            if (status) {
                item._importStatus = status;
            }
            that.changeItem(item);
            // 设置单元格样式
            let importStatusCellEl = that.typeTabTablesEl.find(`.tab-tables.all #import_status_all_cell_${item._id}`);
            if (importStatusCellEl.length > 0) {
                status = item._importStatus;
                importStatusCellEl.attr('class', `import-status-cell ${status.code}`).attr('title', status.desc).html(status.desc);
            }
        }

        // 设置导入切换栏表格标题loading
        setImportTabTableTitleLoading(sheets) {
            let that = this;
            let titleEl = that.typeTabTablesEl.find(`.tab-tables.all .layui-tab-title`);
            if (titleEl.length <= 0) {
                return;
            }
            // 隐藏全部
            let loadingEl = titleEl.find('li .layui-icon-loading');
            if (loadingEl.length > 0) {
                loadingEl.removeClass('importing');
            }

            if (!sheets || sheets.length <= 0) {
                return;
            }
            // 设置loading
            sheets.forEach(sheet => {
                let loadingEl = titleEl.find(`li.${sheet} .layui-icon-loading`);
                if (loadingEl.length > 0) {
                    loadingEl.addClass('importing');
                }
            });
        }

        /**
         * 设置导入进度，并返回是否导入完成
         * @return {boolean}
         */
        setImportProgress() {
            let that = this;
            // 导入数量
            let importCount = 0;
            let sheetCount = {};
            for (let id in that.typeAllItems) {
                if (!that.typeAllItems.hasOwnProperty(id)) {
                    continue;
                }
                let item = that.typeAllItems[id];
                let sheet = item._sheet;
                let importStatus = item._importStatus;
                if (!sheetCount.hasOwnProperty(sheet)) {
                    sheetCount[sheet] = {wait: 0, importing: 0, success: 0, fail: 0};
                }
                sheetCount[sheet][importStatus.code]++;
                if (importStatus.code === 'success' || importStatus.code === 'fail') {
                    importCount++;
                }
            }
            // 设置单个工作簿进度
            if (!yunj.isEmptyObj(sheetCount)) {
                for (let sheet in sheetCount) {
                    if (!sheetCount.hasOwnProperty(sheet)) {
                        continue;
                    }
                    for (let status in sheetCount[sheet]) {
                        if (!sheetCount[sheet].hasOwnProperty(status)) {
                            continue;
                        }
                        let countEl = that.typeTabTablesEl.find(`.tab-tables.all .layui-tab-title li.${sheet} .count.${status}`);
                        if (countEl.length > 0) {
                            let count = sheetCount[sheet][status];
                            let statusDesc = that.itemImportStatus[status].desc;
                            let title = count > 0 ? `${statusDesc}：${count}` : `暂无${statusDesc}的数据`;
                            countEl.attr('title', title).html(count);
                        }
                    }
                }
            }
            // 设置总进度
            let allCount = that.getAllItemsCount();
            that.typeActionEl.find(`.action.all .import-rate`).html(importCount + '/' + allCount);
            return importCount === allCount;
        }

        // 导入处理
        async importHandle() {
            let that = this;
            // 开始
            that.importStart();
            // 导入数据
            let itemIds = [];
            let allItemIds = that.getTypeItemIds('all');
            if (yunj.isObj(allItemIds)) {
                for (let sheet in allItemIds) {
                    if (allItemIds.hasOwnProperty(sheet) && yunj.isArray(allItemIds[sheet])) {
                        itemIds.push(...allItemIds[sheet]);
                    }
                }
            } else if (yunj.isArray(allItemIds)) {
                itemIds = allItemIds;
            }
            if (itemIds.length <= 0) {
                that.importEnd();
                return;
            }
            let obj = {
                itemIds: itemIds,
                startIdx: 0,
                maxIdx: itemIds.length - 1,
                limit: that.importObj.rawArgs.limit
            };
            // 开始导入
            while (true) {
                let isComplete = await that.importExec(obj);
                if (isComplete === true) {
                    break;
                }
            }
            // 导入结束
            that.importEnd();
        }

        // 导入执行
        importExec(obj) {
            let that = this;
            return new Promise(resolve => {
                if (!that.isImporting) {
                    resolve(true);
                    return;
                }
                let items = [];
                let itemSheets = [];
                while (items.length < obj.limit && obj.startIdx <= obj.maxIdx) {
                    let itemId = obj.itemIds[obj.startIdx];
                    if (that.typeAllItems.hasOwnProperty(itemId)) {
                        let item = that.typeAllItems[itemId];
                        // 判断是否可以导入
                        if (that.checkItemIsCanImport(item)) {
                            // 设置数据状态
                            that.changeItemImportStatus(item, that.itemImportStatus.importing);
                            items.push(item);
                            if (item._sheet) {
                                itemSheets.push(item._sheet);
                            }
                        }
                    }
                    obj.startIdx++;
                }
                if (items.length <= 0) {
                    resolve(true);
                    return;
                }

                // 设置标题loading
                that.setImportTabTableTitleLoading(itemSheets);
                // 设置导入中的数据量
                that.setImportProgress();

                let requestData = {
                    [yunj.config('builder.id_key')]: that.importId,
                    [yunj.config('builder.async_type_key')]: "import",
                    items: JSON.stringify(items)
                };
                yunj.request(yunj.url(true), requestData, "post").then(res => {
                    let dataItems = res.data.items;
                    // 更新上传数据状态
                    let hasSuccessItem = false;
                    let hasFailItem = false;
                    dataItems.forEach(item => {
                        let itemId = item._id;
                        let importStatus = item._importStatus;
                        if (that.typeAllItems.hasOwnProperty(itemId)) {
                            let itemData = that.typeAllItems[itemId];
                            itemData._importStatus = importStatus;
                            that.changeItemImportStatus(itemData);
                            if (importStatus.code === 'success') {
                                that.addSuccessItem(itemData);
                                hasSuccessItem = true;
                            } else if (importStatus.code === 'fail') {
                                that.addFailItem(itemData);
                                hasFailItem = true;
                            }
                        }
                    });
                    // 重载表格
                    hasSuccessItem && that.reloadTypeHtml('success');
                    hasFailItem && that.reloadTypeHtml('fail');
                    // 设置当前类型的切换栏表格显示
                    that.setTypeTabTablesActive();
                    // 设置导入进度，并返回是否导入完成
                    let isCompleted = that.setImportProgress();
                    if (isCompleted) {
                        that.setImportTabTableTitleLoading();
                    }
                    resolve(isCompleted);
                }).catch(e => {
                    throw e;
                });
            });
        }

        // 导入开始
        importStart() {
            let that = this;
            that.isImporting = true;
            that.setAllActionImportBtnStatus('importing');
        }

        // 导入完成
        importEnd() {
            let that = this;
            this.isImporting = false;
            that.setAllActionImportBtnStatus('completed');
            that.importStepBoxEl.children('.item.curr').removeClass('curr').addClass('finish')
        }

        setEventBind() {
            let that = this;

            // 错误失败修改后验证
            that.contentBoxEl.on('DOMNodeInserted', '.type-tab-tables .tab-tables.fail .fail-cell', function (e) {
                that.failCellCheck($(this));
                e.stopPropagation();
            });

        }

    }

    exports('ImportStepThree', ImportStepThree);
});
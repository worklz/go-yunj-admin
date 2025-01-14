/**
 * ImportStepTypeTable
 */
layui.define(['jquery', 'table', 'form', 'yunj', 'validate', 'ImportStep'], function (exports) {

    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let ImportStep = layui.ImportStep;
    let validate = layui.validate;

    class ImportStepTypeTable extends ImportStep {

        constructor(importObj, name = "", desc = "") {
            super(importObj, name, desc);
            this.layTable = layui.table;
            this.layForm = layui.form;
            this.colsValidateAttr = {}; // 表头验证器参数，有sheet：{sheet1:{rule:{...},dataTitle:{...}},...}，无sheet：{rule:{...},dataTitle:{...}}
            this.typesEl;
            this.typeActionEl;
            this.typeTabTablesEl;
            this.actionNoticeEl;
            this.typeSort = [];
            this.typeConfig = {};   // {all:{desc:'所有可选',itemIds:[]}}
            this.typeAllItems = {}; // 所有的数据
            this.currType;
        }

        // 初始化数据
        initData() {
            let that = this;
            that.typeAllItems = {};
            let typeConfig = that.typeConfig;
            for (let type in typeConfig) {
                if (typeConfig.hasOwnProperty(type) && yunj.isObj(typeConfig[type]) && typeConfig[type].hasOwnProperty('itemIds')) {
                    delete typeConfig[type].itemIds;
                }
            }
            that.contentBoxEl.html('');
        }

        // 设置内容区域html
        setContentBoxHtml() {
            let that = this;

            that.contentBoxEl.html(`<div class="yunj-import-step-content-row action-box">
                                        <div class="types"></div>
                                        <div class="type-action"></div>
                                    </div>
                                    <div class="yunj-import-step-content-row action-box action-notice"></div>
                                    <div class="yunj-import-step-content-row action-box type-tab-tables"></div>`);
            that.typesEl = that.contentBoxEl.find(".types");
            that.typeActionEl = that.contentBoxEl.find(".type-action");
            that.typeTabTablesEl = that.contentBoxEl.find(".type-tab-tables");
            that.actionNoticeEl = that.contentBoxEl.find(".action-notice");
            that.setTypesHtml();
        }

        // 设置types的html
        setTypesHtml() {
            let that = this;
            let typeSort = that.typeSort;
            let typeshtml = '';
            for (let i = 0; i < typeSort.length; i++) {
                if (i !== 0) {
                    typeshtml += `<span class="split">|</span>`;
                }
                let type = typeSort[i];
                let typeItem = that.typeConfig[type];
                let count = 0;
                let typeItemsCountMethod = `get${yunj.ucfirst(type)}ItemsCount`;
                if (typeof that[typeItemsCountMethod] === 'function') {
                    count = that[typeItemsCountMethod]();
                }
                typeshtml += `<a href="javascript:void(0);" class="${type}" data-type="${type}">${typeItem.desc} <span class="count">${count}</span></a>`;
            }
            that.typesEl.html(typeshtml);
            // 监听事件
            that.contentBoxEl.on('click', '.types a', function (e) {
                that.setCurrType($(this).data('type'));
                e.stopPropagation();
            });
        }

        // 设置当前类型
        setCurrType(type, afterCall) {
            let that = this;
            // 设置指定类型的切换显示
            that.setTypeActive(type);

            // 设置当前类型的操作html
            that.setCurrTypeActionHtml();

            // 设置当前类型的切换栏表格html
            that.setTypeTabTablesHtml();

            // 设置当前类型的切换栏表格显示
            that.setTypeTabTablesActive();

            afterCall && afterCall();
        }

        // 设置指定类型的切换显示
        setTypeActive(type) {
            let that = this;
            that.currType = type;
            that.typesEl.find('a').removeClass('active');
            that.typesEl.find(`a.${type}`).addClass('active');
        }

        // 获取当前类型tab表格id
        getCurrTypeActionFormId() {
            let that = this;
            return `yunj_import_${this.importId}_step_${that.name}_${that.currType}_form_action`;
        }

        // 设置当前类型操作栏html
        setCurrTypeActionHtml() {
            let that = this;
            let type = that.currType;
            if (that.typeActionEl.find(`.action.${type}`).length <= 0) {
                let renderTypeActionHtmlMethod = 'render' + yunj.ucfirst(type) + 'ActionHtml';
                if (typeof (that[renderTypeActionHtmlMethod]) === "function") {
                    that[renderTypeActionHtmlMethod]();
                }
            }
            let actionEls = that.typeActionEl.find('.action');
            if (actionEls.length > 0) {
                actionEls.removeClass('active');
            }
            let actionEl = that.typeActionEl.find(`.action.${type}`);
            if (actionEl.length > 0) {
                actionEl.addClass('active');
            }
        }

        // 设置当前类型选中全部
        setCurrTypeTabTablesCheckAll(checkAll) {
            let that = this;
            that.typeTabTablesEl.find(`.tab-tables.${that.currType} .layui-tab-content .layui-tab-item`).each(function (e) {
                let checkAllEl = $(this).find(".layui-table-header thead:first tr:first th:first .layui-form-checkbox");
                let isChecked = checkAllEl.hasClass("layui-form-checked");
                if (checkAll) {
                    if (isChecked) {
                        return true;
                    }
                } else {
                    if (!isChecked) {
                        return true;
                    }
                }
                checkAllEl.click();
            });
        }

        // 设置指定类型（默认当前）切换栏表格html
        setTypeTabTablesHtml(type) {
            let that = this;
            if (!type) {
                type = that.currType;
            }
            if (that.typeTabTablesEl.find(`.tab-tables.${type}`).length) {
                return;
            }
            let itemIds = that.getTypeItemIds(type);
            if (itemIds.length <= 0) {
                return;
            }
            that.typeTabTablesEl.append(`<div class="layui-tab tab-tables ${type}"></div>`);
            let tabTableEl = that.typeTabTablesEl.find(`.tab-tables.${type}`);
            let titleHtml = `<ul class="layui-tab-title"></ul>`;
            let contentHtml = `<div class="layui-tab-content"></div>`;
            if (yunj.isObj(itemIds)) {
                tabTableEl.html(titleHtml + contentHtml);
                let titleBoxEl = tabTableEl.find(".layui-tab-title");
                let contentBoxEl = tabTableEl.find(".layui-tab-content");
                let i = 0;
                for (let sheet in itemIds) {
                    if (!itemIds.hasOwnProperty(sheet)) {
                        continue;
                    }
                    let sheetItemIds = itemIds[sheet];
                    if (sheetItemIds.length <= 0) {
                        continue;
                    }
                    let titleAppendHtml = that.getTypeTabTableTabTitleAppendHtml(type, sheet);
                    titleBoxEl.append(`<li class="${sheet} ${i === 0 ? 'layui-this' : ''}">${sheet}${titleAppendHtml}</li>`);
                    contentBoxEl.append(that.getTypeTabTableLayout(i === 0, type, sheet));
                    that.renderTypeTabTable(type, sheet);
                    i++;
                }
            } else {
                if (itemIds.length <= 0) {
                    return;
                }
                tabTableEl.html(contentHtml);
                let contentBoxEl = tabTableEl.find(".layui-tab-content");
                contentBoxEl.append(that.getTypeTabTableLayout(true, type));
                that.renderTypeTabTable(type);
            }
        }

        // 获取指定类型tab表格tab切换栏标题附加元素
        getTypeTabTableTabTitleAppendHtml(type, sheet) {
            let that = this;
            return '';
        }

        // 设置指定类型（默认当前）切换栏表格展示
        setTypeTabTablesActive(type) {
            let that = this;
            if (!type) {
                type = that.currType;
            }

            let tabTablesEls = that.typeTabTablesEl.find('.tab-tables');
            if (tabTablesEls.length > 0) {
                tabTablesEls.removeClass('active');
            }
            let tabTablesEl = that.typeTabTablesEl.find(`.tab-tables.${type}`);
            if (tabTablesEl.length > 0) {
                tabTablesEl.addClass('active');
            }
        }

        // 重载指定类型html
        reloadTypeHtml(type) {
            let that = this;

            // 重置数量
            that.typesEl.find(`a.${type} .count`).html(that.getTypeItemsCount(type));

            // 删除表格元素ml
            let tabTablesEl = that.typeTabTablesEl.find(`.tab-tables.${type}`);
            if (tabTablesEl.length) {
                tabTablesEl.remove();
            }
            // 重新设置表格html
            that.setTypeTabTablesHtml(type);
        }

        // 删除指定类型切换栏指定表格html
        delTypeTabTableHtml(type, sheet = false) {
            let that = this;
            let tabTablesEl = that.typeTabTablesEl.find(`.tab-tables.${type}`);
            if (tabTablesEl.length <= 0) {
                return;
            }
            if (sheet) {
                let tabTableTitleEl = tabTablesEl.find(`.layui-tab-title > li.${sheet}`);
                tabTableTitleEl.length > 0 && tabTableTitleEl.remove();
                let tabTableContentEl = tabTablesEl.find(`.layui-tab-content > .layui-tab-item.${sheet}`);
                tabTableContentEl.length > 0 && tabTableContentEl.remove();
                if (tabTablesEl.find(`.layui-tab-title > li.layui-this`).length <= 0) {
                    tabTablesEl.find(`.layui-tab-title > li`).removeClass('layui-this');
                    tabTablesEl.find(`.layui-tab-content > .layui-tab-item`).removeClass('layui-this');
                    // 没有显示的切换栏，默认显示第一个
                    let firstTabTableTitleEl = tabTablesEl.find(`.layui-tab-title > li:first`);
                    firstTabTableTitleEl.length > 0 && firstTabTableTitleEl.addClass('layui-this');
                    let firstTabTableContentEl = tabTablesEl.find(`.layui-tab-content > .layui-tab-item:first`);
                    firstTabTableContentEl.length > 0 && firstTabTableContentEl.addClass('layui-show');
                }
            } else {
                tabTablesEl.html('');
            }
        }

        // 获取指定类型tab表格id
        getTypeTabTableId(type, sheet = false) {
            let that = this;
            return `yunj_import_${this.importId}_step_${that.name}_${type}_table${sheet ? `_${sheet}` : ""}`;
        }

        // 获取指定类型tab表格结构
        getTypeTabTableLayout(isShow, type, sheet = false) {
            let that = this;
            let id = this.getTypeTabTableId(type, sheet);
            let classStr = 'layui-tab-item';
            if (sheet) {
                classStr += ' ' + sheet;
            }
            if (isShow) {
                classStr += ' layui-show';
            }
            return `<div class="${classStr}">
                        <table class="layui-table" id="${id}" lay-filter="${id}" data-sheet="${sheet}"></table>
                    </div>`;
        }

        // 渲染当前类型tab表格
        renderTypeTabTable(type, sheet = false) {
            let that = this;

            let tabTableId = that.getTypeTabTableId(type, sheet);
            let args = {
                elem: `#${tabTableId}`,
                url: '/' + YUNJ_ADMIN_ENTRANCE + '/empty',
                method: 'post',
                contentType: 'application/json',
                parseData: function (res) {
                    let items = that.getTypeItems(type, sheet);
                    return {
                        "code": 0,
                        "msg": 'success',
                        "count": 0,
                        "data": items
                    };
                },
                page: false,
                loading: true,
                text: {none: '暂无相关数据'},
                cols: [that.getTypeTabTableCols(type, sheet)],
                done: function (res) {
                    that.renderTypeTabTableDone(this, type, sheet);
                }
            };
            that.layTable.render(args);
        }

        // 获取指定类型tab表格表头
        getTypeTabTableCols(type, sheet = false) {
            return [];
        }

        // 渲染指定类型tab表格后执行
        renderTypeTabTableDone(tableObj, type, sheet = false) {
            let that = this;
            that.layTable.resize(tableObj.id);
        }

        // 设置指定类型tab表格选中数量
        setTypeTabTablesCheckCount(type) {
            let that = this;
            let count = 0;
            if (!type) {
                type = that.currType;
            }
            that.typeTabTablesEl.find(`.tab-tables.${type} .layui-tab-item > .layui-table`).each(function () {
                let tableEl = $(this);
                let tableId = tableEl.attr('id');
                let checkCount = that.layTable.checkStatus(tableId).data.length;
                let sheet = tableEl.data('sheet');
                if (sheet) {
                    that.typeTabTablesEl.find(`.tab-tables.${type} .layui-tab-title li.${sheet} .check-count`).html(checkCount);
                }
                count += checkCount;
            });
            that.typeActionEl.find(`.action.${type} .check-count`).html(count);

            // 判断是否全部选中
            that.typeActionEl.find(`.action.${type} input[type=checkbox][lay-filter='${that.getTypeCheckAllFilter(type)}']`).prop("checked", count && count === that.getTypeItemsCount());
            that.layForm.render('checkbox', that.getCurrTypeActionFormId());
        }

        // 获取指定类型的全选filter
        getTypeCheckAllFilter(type) {
            let that = this;
            return `yunj_import_${this.importId}_step_${that.name}_${type}_check_all}`;
        }

        // 批量设置数据选中状态
        setItemsChecked(checked, type, sheet = false) {
            let that = this;
            let itemIds = that.getTypeItemIds(type, sheet);

            if (yunj.isObj(itemIds)) {
                let sheets = sheet ? [sheet] : Object.keys(items);
                sheets.forEach(s => {
                    itemIds[s].forEach(itemId => {
                        if (that.typeAllItems.hasOwnProperty(itemId)) {
                            that.typeAllItems[itemId].LAY_CHECKED = !!checked;
                        }
                    });
                });
            } else if (yunj.isArray(itemIds)) {
                itemIds.forEach(itemId => {
                    if (that.typeAllItems.hasOwnProperty(itemId)) {
                        that.typeAllItems[itemId].LAY_CHECKED = !!checked;
                    }
                });
            }
        }

        // 设置单条数据选中
        setItemChecked(checked, type, item) {
            let that = this;
            item.LAY_CHECKED = !!checked;
            that.changeItem(type, item);
        }

        // 获取表头校验属性，rule和dataTitle
        getColsValidateAttr(sheet = false) {
            let that = this;
            let colsValidateAttr = that.colsValidateAttr;
            if (!yunj.isEmptyObj(colsValidateAttr)) {
                if (sheet === false) {
                    return colsValidateAttr;
                } else {
                    if (colsValidateAttr.hasOwnProperty(sheet)) {
                        return colsValidateAttr[sheet];
                    }
                }
            }
            let _attr = {rule: {}, dataTitle: {}};
            let cols = that.getCols(sheet);
            for (let k in cols) {
                if (!cols.hasOwnProperty(k)) {
                    continue;
                }
                let col = cols[k];
                if (col.verify.length <= 0) {
                    continue;
                }
                _attr.rule[k] = col.verify;
                _attr.dataTitle[k] = col.title;
            }
            sheet === false ? (colsValidateAttr = _attr) : (colsValidateAttr[sheet] = _attr);
            that.colsValidateAttr = colsValidateAttr;
            return _attr;
        }

        // 新增指定类型item
        addTypeItem(type, item) {
            let that = this;
            let itemId = item._id;
            let typeAllItems = that.typeAllItems;
            if (!typeAllItems.hasOwnProperty(itemId)) {
                typeAllItems[itemId] = item;
            }
            let typeConfig = that.typeConfig[type];
            let sheet = item._sheet;
            if (sheet) {
                if (!typeConfig.hasOwnProperty('itemIds') || !yunj.isObj(typeConfig.itemIds)) {
                    typeConfig.itemIds = {};
                }
                let itemIds = typeConfig.itemIds;
                if (!itemIds.hasOwnProperty(sheet) || !yunj.isArray(itemIds[sheet])) {
                    itemIds[sheet] = [];
                }
                if (itemIds[sheet].indexOf(itemId) === -1) {
                    itemIds[sheet].push(itemId);
                }
            } else {
                if (!typeConfig.hasOwnProperty('itemIds') || !yunj.isArray(typeConfig.itemIds)) {
                    typeConfig.itemIds = [];
                }
                if (typeConfig.itemIds.indexOf(itemId) === -1) {
                    typeConfig.itemIds.push(itemId);
                }
            }
            that.renderTypeCount(type);
        }

        // 删除指定类型item
        delTypeItem(type, item) {
            let that = this;
            let itemId = item._id;
            let typeAllItems = that.typeAllItems;
            if (typeAllItems.hasOwnProperty(itemId)) {
                delete typeAllItems[itemId];
            }
            let sheet = item._sheet;
            let itemIds = that.getTypeItemIds(type, sheet);
            let itemIdIdx = itemIds.indexOf(itemId);
            if (itemIdIdx === -1) {
                return;
            }
            itemIds.splice(itemIdIdx, 1);
            if (sheet) {
                that.typeConfig[type].itemIds[sheet] = itemIds;
            } else {
                that.typeConfig[type].itemIds = itemIds;
            }
            that.renderTypeCount(type);
        }

        // 修改指定item
        changeItem(item) {
            let that = this;
            let itemId = item._id;
            let typeAllItems = that.typeAllItems;
            if (typeAllItems.hasOwnProperty(itemId)) {
                typeAllItems[itemId] = Object.assign({}, typeAllItems[itemId], item);
            }
        }

        // 渲染指定类型数据量
        renderTypeCount(type) {
            let that = this;
            let countEl = that.typesEl.find(`a.${type} .count`);
            if (countEl.length) {
                let getTypeItemsCountMethod = 'get' + yunj.ucfirst(type) + 'ItemsCount';
                countEl.html(that[getTypeItemsCountMethod]());
            }
        }

        // 获取指定类型数据
        getTypeItems(type, sheet = false) {
            let that = this;
            let items = [];
            let itemIds = that.getTypeItemIds(type, sheet);
            itemIds.forEach(itemId => {
                if (that.typeAllItems.hasOwnProperty(itemId)) {
                    items.push(that.typeAllItems[itemId]);
                }
            });
            return items;
        }

        // 获取指定类型数据ids
        getTypeItemIds(type, sheet = false) {
            let that = this;
            let itemIds = [];
            if (!that.typeConfig[type].hasOwnProperty('itemIds')) {
                return itemIds;
            }
            if (sheet) {
                if (yunj.isObj(that.typeConfig[type].itemIds) && that.typeConfig[type].itemIds.hasOwnProperty(sheet)) {
                    itemIds = that.typeConfig[type].itemIds[sheet];
                }
            } else {
                itemIds = that.typeConfig[type].itemIds;
            }
            return itemIds;
        }

        // 获取指定类型数据量
        getTypeItemsCount(type, sheet = false) {
            let that = this;
            let count = 0;
            if (!type) {
                type = that.currType;
            }
            let itemIds = that.getTypeItemIds(type, sheet);
            if (yunj.isObj(itemIds)) {
                for (let sheet in itemIds) {
                    if (itemIds.hasOwnProperty(sheet) && yunj.isArray(itemIds[sheet])) {
                        count += itemIds[sheet].length;
                    }
                }
            } else if (yunj.isArray(itemIds)) {
                count = itemIds.length;
            }
            return count;
        }

        // 指定类型tab表格数据验证并提交
        typeTabTableItemsCheckSubmit(type, successCall, errorCall, completeCall) {
            let that = this;
            let tablesEl = that.typeTabTablesEl.find(`.tab-tables.${type} .layui-tab-item > .layui-table`);
            if (tablesEl.length <= 0) {
                yunj.msg('暂无可选错误数据');
                return;
            }
            let items = [];
            tablesEl.each(function () {
                let tableId = $(this).attr('id');
                let checkData = that.layTable.checkStatus(tableId).data;
                if (checkData.length <= 0) {
                    return true;
                }
                items.push(...checkData);
            });
            if (items.length <= 0) {
                yunj.msg('请选择要验证提交的数据');
                return;
            }

            let errorCount = 0;
            let successCount = 0;
            items.forEach(item => {
                // 进行数据校验
                let validateAttr = that.getColsValidateAttr(item._sheet);
                validate.create({
                    rule: validateAttr.rule
                });
                let res = validate.check(item, validateAttr.dataTitle);
                if (!res) {
                    errorCall && errorCall(item, validate);
                    errorCount++;
                } else {
                    successCall && successCall(item);
                    successCount++;
                }
            });
            completeCall && completeCall(successCount, errorCount);
            // 设置当前类型的切换栏表格显示
            that.setTypeTabTablesActive(type);
        }

        // 校验表格单元格数据
        checkCellData(cellEl, errorCall) {
            let that = this;
            // 判断是否修改了数据
            let rowData = cellEl.data('rowData');
            let field = cellEl.data('field');
            let val = cellEl.html();
            // 验证数据
            let validateAttr = that.getColsValidateAttr(rowData._sheet);
            if (validateAttr.rule.hasOwnProperty(field)) {
                let rule = {};
                rule[field] = validateAttr.rule[field];
                let dataTitle = {};
                dataTitle[field] = validateAttr.dataTitle[field];
                let data = {};
                data[field] = val;
                validate.create({
                    rule: rule,
                    batch: true
                });
                let res = validate.check(data, dataTitle);
                if (!res) {
                    errorCall && errorCall(rowData, field, validate);
                    cellEl.attr('title', error);
                } else {
                    cellEl.css({'background': '#fff', 'color': '#189f92'});
                    cellEl.attr('title', '');
                }
            }
            rowData[field] = val;
            cellEl.data('rowData', rowData);
        }

    }

    exports('ImportStepTypeTable', ImportStepTypeTable);
});
/**
 * FormFieldDropdownSearch
 */
layui.define(['FormField', 'FormFieldActions', 'yunj', 'jquery'], function (exports) {

    let FormField = layui.FormField;
    let FormFieldActions = layui.FormFieldActions;
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class FormFieldDropdownSearch extends FormField {

        constructor(options = {}) {
            super(options);
            this.showBoxEl = null;
            this.itemsBoxEl = null;
            this.selectPopupContentEl = null;
            this.xhr = null;                          // 数据请求对象
            this.keywordsChangeSearchTimer = null;    // 关键字改变引起的搜索items的定时器
        }

        defineExtraArgs() {
            let that = this;
            return {
                multi: true,
                options: [],
                optionIdKey: 'id',
                optionNameKey: 'name'
            };
        }

        defineBoxHtml() {
            let that = this;
            return `<div class="layui-form-item yunj-form-item yunj-form-dropdown-search" id="${that.id}">__layout__</div>`;
        }

        layoutControl() {
            let that = this;
            let controlHtml = `<div class="show-box">
                                    <div class="items-box"></div>
                                </div>`;
            return `<div class="layui-input-inline yunj-form-item-control">${controlHtml}</div>`;
        }

        renderDone() {
            let that = this;
            that.showBoxEl = that.boxEl.find('.show-box');
            that.itemsBoxEl = that.boxEl.find('.items-box');
            // 设置字段操作项：内容清理、选择弹窗
            that.fieldActions = new FormFieldActions({
                fieldObj: that,
                fieldValueElSelector: `.show-box>.items-box`,
                actions: {
                    contentClear: null,
                    selectPopup: {
                        contentHtml: that.getSelectPopupContentHtml,
                        showAfter: that.renderSelectItems,
                    },
                }
            });
            that.selectPopupContentEl = that.fieldActions.getActionObj('selectPopup').selectContentEl;
        }

        setValue(val = '') {
            let that = this;

            if (yunj.isScalar(val) && val)
                val = yunj.isJson(val) ? JSON.parse(val) : (yunj.isString(val) && val.indexOf(",") !== -1 ? val.split(",") : [val]);
            if (!yunj.isArray(val)) val = [];

            that.itemsClear();
            if (val.length <= 0) return;
            that.getSelectedItems({[that.getOptionIdsKey()]: val.join(',')}).then(items => {
                that.itemsAppend(items);
            });
        }

        getValue() {
            let that = this;
            let itemsEl = that.itemsBoxEl.find('.item');
            if (itemsEl.length <= 0) return "";

            let val = [];
            itemsEl.each(function () {
                val.push($(this).data('value').toString());
            });
            if (val.length <= 0) return "";
            return that.args.multi ? val : val[0];
        }

        itemsAppend(items) {
            let that = this;
            if (!yunj.isArray(items) || yunj.isEmptyArray(items)) return;
            items.forEach((item, index) => {
                let id = item[that.args.optionIdKey];
                let name = item[that.args.optionNameKey];
                if (that.itemsBoxEl.find(`.item[data-value="${id}"]`).length <= 0) {
                    let remove = that.args.readonly ? '' : '<i class="layui-icon layui-icon-close-fill item-remove" title="删除"></i>';
                    let itemContent = `<div class="item" data-value="${id}">
                                    <span class="txt" title="${name}">${name}</span>
                                    ${remove}
                                </div>`;
                    that.itemsBoxEl.append(itemContent);
                }
                let ddEl;
                if (that.selectPopupContentEl && (ddEl = that.selectPopupContentEl.find(`dd[data-value="${id}"]`)) && ddEl.length > 0) {
                    ddEl.addClass('active');
                }
            });
        }

        itemsClear() {
            let that = this;
            that.itemsBoxEl.html("");
            that.selectPopupContentEl && that.selectPopupContentEl.find('dd').removeClass('active');
        }

        itemsRemove(values) {
            let that = this;
            if (!yunj.isArray(values) || yunj.isEmptyArray(values)) return;
            values.forEach((value) => {
                let itemEl = that.itemsBoxEl.find(`.item[data-value="${value}"]`);
                if (itemEl.length > 0) {
                    itemEl.remove();
                }
                let ddEl;
                if (that.selectPopupContentEl && (ddEl = that.selectPopupContentEl.find(`dd[data-value="${value}"]`)) && ddEl.length > 0) {
                    ddEl.removeClass('active');
                }
            });
        }

        // 获取可选项
        getSelectedItems(param = {}) {
            let that = this;
            param = yunj.objSupp(param, {
                keywords: '',
                [that.getOptionIdsKey()]: '',
            });
            // 接口获取可选项
            if (yunj.isString(that.args.options)) {
                $(doc).trigger(`yunj_form_field_${that.id}_request_param`, [param]);
                let url = yunj.urlPushParam(that.args.options, param);
                if (that.xhr) that.xhr.abort();
                return new Promise((resolve, reject) => {
                    that.xhr = new XMLHttpRequest();
                    that.xhr.open('GET', url, true);
                    that.xhr.responseType = 'json';
                    that.xhr.onload = function () {
                        if (that.xhr.status !== 200) {
                            reject(that.xhr.status);
                            return false;
                        }
                        let res = that.xhr.response;
                        if (res.errcode !== 0) {
                            reject(res.msg);
                            return false;
                        }
                        resolve(res.data);
                    };
                    that.xhr.send();
                });
            }
            // 可选项筛选
            if (yunj.isArray(that.args.options)) {
                let keywords = param.keywords;
                let ids = param[that.getOptionIdsKey()];
                let keywordsPattern = new RegExp(keywords, 'i'); // 不区分大小写匹配
                ids = ids ? (ids.indexOf(",") !== -1 ? ids.split(",") : [ids.toString()]) : [];
                let items = [];
                let options = that.args.options;
                for (let i = 0; i < options.length; i++) {
                    let option = options[i];
                    if (ids.length > 0 && ids.indexOf(option[that.args.optionIdKey].toString()) === -1) {
                        continue;
                    }
                    if (keywords && option[that.args.optionNameKey].toString().search(keywordsPattern) === -1) {
                        continue;
                    }
                    items.push(option);
                }
                return new Promise((resolve, reject) => {
                    resolve(items);
                });
            }
        }

        // 获取选择弹窗内容html
        getSelectPopupContentHtml = (data) => {
            let that = this;
            let {isUp} = data;
            return new Promise((resolve, reject) => {
                let keywordsContent = `<input type="text" class="layui-input" name="keywords" placeholder="关键词" autocomplete="off">`;
                let dlItemsContent = `<dl class="items-box"></dl>`;
                let contentHtml = "";
                if (isUp) {
                    contentHtml = dlItemsContent + keywordsContent;
                } else {
                    contentHtml = keywordsContent + dlItemsContent;
                }
                resolve(contentHtml);
            });
        }

        // 渲染筛选items
        renderSelectItems = () => {
            let that = this;
            let itemsBox = that.selectPopupContentEl.find('.items-box');
            let keywordsEl = that.selectPopupContentEl.find('input[name=keywords]');
            itemsBox.html(`<dd>搜索中...</dd>`);
            let param = {keywords: keywordsEl.length > 0 ? keywordsEl.val() : ''};
            that.getSelectedItems(param).then(items => {
                if (items.length <= 0) {
                    itemsBox.html(`<dd>暂无内容</dd>`);
                    return;
                }
                let vals = that.getValue();
                vals = yunj.isArray(vals) ? vals : [vals];
                let itemsContent = '';
                items.forEach((item, index) => {
                    let id = item[that.args.optionIdKey];
                    let name = item[that.args.optionNameKey];
                    itemsContent += `<dd class="${vals.indexOf(id.toString()) !== -1 ? 'active' : ''}" data-value="${id}" title="${name}">${name}</dd>`;
                });
                itemsBox.html(itemsContent);
            });
        }

        defineExtraEventBind() {
            let that = this;

            that.boxEl.on('keyup', 'input[name=keywords]', function (e) {
                if (that.keywordsChangeSearchTimer) clearTimeout(that.keywordsChangeSearchTimer);
                that.keywordsChangeSearchTimer = setTimeout(function () {
                    that.renderSelectItems();
                }, 500);
            });

            that.boxEl.on('click', '.items-box dd', function (e) {
                e.stopPropagation();
                let dd = $(this);
                if (!dd.hasClass('active')) {
                    // 选中
                    let items = [
                        {
                            [that.args.optionIdKey]: dd.data('value'),
                            [that.args.optionNameKey]: dd.attr('title')
                        }
                    ];
                    if (!that.args.multi) {
                        that.itemsClear();
                    }
                    that.itemsAppend(items);
                } else {
                    // 删除
                    let removeValues = [dd.data('value')];
                    that.itemsRemove(removeValues);
                }
            });

            that.boxEl.on('click', '.show-box .item', function (e) {
                e.stopPropagation();
                yunj.copy($(this).find('.txt').text());
            });

            that.boxEl.on('click', '.item-remove', function (e) {
                e.stopPropagation();
                if (that.args.readonly) return;
                let itemEl = $(this).parent(".item");
                let removeValues = [itemEl.data("value")];
                that.itemsRemove(removeValues);
            });

        }

        getOptionIdsKey() {
            let that = this;
            return that.args.optionIdKey + 's';
        }

    }

    exports('FormFieldDropdownSearch', FormFieldDropdownSearch);
});
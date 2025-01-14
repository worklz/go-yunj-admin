/**
 * FormFieldIcon
 */
layui.define(['FormField', 'FormFieldActions', 'yunj', 'jquery'], function (exports) {

    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let FormField = layui.FormField;
    let FormFieldActions = layui.FormFieldActions;

    class FormFieldIcon extends FormField {

        constructor(options = {}) {
            super(options);
            this.options = null;
            this.contentEl = null;
            this.iconBoxEl = null;
            this.iconPreviewEl = null;

            this.selectPopupContentEl = null;
        }

        defineExtraArgs() {
            let that = this;
            return {
                placeholder: "图标class类名"
            };
        }

        async renderBefore() {
            let that = this;
            await new Promise(resolve => {
                yunj.icon_options().then(options => {
                    that.options = options;
                    resolve('done');
                });
            });
            return 'done';
        }

        layoutControl() {
            let that = this;
            return `<div class="layui-input-inline yunj-form-item-control">
                        <div class="icon-box">
                            <input type="text" name="${that.id}" ${that.args.readonly ? 'readonly' : ''}
                                placeholder="${that.args.placeholder}" value="" autocomplete="off" class="layui-input icon-input">
                        </div>
                        <div class="icon-preview"></div>
                    </div>`;
        }

        renderDone() {
            let that = this;
            that.contentEl = that.boxEl.find(`input[name=${that.id}]`);
            that.iconBoxEl = that.boxEl.find('.icon-box');
            that.iconPreviewEl = that.boxEl.find('.icon-preview');
            // 设置字段操作项：内容清理、选择弹窗
            that.fieldActions = new FormFieldActions({
                fieldObj: that,
                fieldValueElSelector: `input[name=${that.id}]`,
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
            that.contentEl.val(val);
            that.setPreviewIconClass();
        }

        getValue() {
            let that = this;
            return that.contentEl.val();
        }

        // 设置预览的icon class
        setPreviewIconClass() {
            let that = this;
            let val = that.getValue();
            let iconClass = yunj.iconClass(val || '');
            that.iconPreviewEl.html(`<i class="${iconClass}" title="${iconClass}"></i>`);
        }

        // 获取选择弹窗内容html
        getSelectPopupContentHtml = (data) => {
            let that = this;
            let {isUp} = data;
            return new Promise((resolve, reject) => {
                let inputBoxContent = `<div class="input-box"><input type="text" placeholder="关键词" class="layui-input keyowrds-input"></div>`;
                let resultBoxContent = `<div class="result-box"></div>`;
                let contentHtml = "";
                if (isUp) {
                    contentHtml = resultBoxContent + inputBoxContent;
                } else {
                    contentHtml = inputBoxContent + resultBoxContent;
                }
                resolve(contentHtml);
            });
        }

        // 渲染筛选内容
        renderSelectItems = () => {
            let that = this;
            let keywords = that.selectPopupContentEl.find('.keyowrds-input').val();
            let reslut = JSON.parse(JSON.stringify(that.options));
            if (keywords) {
                let pattern = new RegExp(keywords, 'i'); // 不区分大小写匹配
                reslut.forEach(v => {
                    let num = 0;
                    let iconArr = [];
                    for (let i = 0; i < v.icon.length; i++) {
                        if (num >= 20) {
                            break;
                        }
                        let icon = v.icon[i];
                        if ((icon.name && icon.name.search(pattern) !== -1) || icon.class && icon.class.search(pattern) !== -1) {
                            iconArr.push(icon);
                            num++;
                        }
                    }
                    v.icon = iconArr;
                });
            }
            let resultHtml = '';
            reslut.forEach(v => {
                let resultItemHtml = '';
                if (v.icon.length > 0) {
                    v.icon.forEach(icon => {
                        let iconFullClass = yunj.iconClass(icon.class);
                        resultItemHtml += `<li title="${iconFullClass}">
                                            <i class="${iconFullClass}"></i>
                                            <div class="icon-name">${icon.name}</div>
                                        </li>`;
                    });
                } else {
                    resultItemHtml = '暂无匹配值...';
                }
                resultHtml += `<div class="result-item">
                                    <div class="title">${v.title}：</div>
                                    <ul class="content">${resultItemHtml}</ul>
                                </div>`;
            });
            that.selectPopupContentEl.find('.result-box').html(resultHtml);
        };

        defineExtraEventBind() {
            let that = this;

            // 渲染文本框的值为预览icon class
            that.boxEl.on('input', `input[name=${that.id}]`, function (e) {
                that.setPreviewIconClass();
            });

            // 搜索关键字
            that.boxEl.on('keyup', '.keyowrds-input', function (e) {
                that.renderSelectItems();
            });

            // 选中图标值
            that.boxEl.on('click', '.result-box li', function (e) {
                let iconClass = $(this).attr('title');
                that.setValue(iconClass);
                e.stopPropagation();
            });

            that.boxEl.on('click', '.icon-preview i', function (e) {
                e.stopPropagation();
                let iconClass = $(this).attr('class');
                iconClass && yunj.copy(iconClass);
            });

        }

    }

    exports('FormFieldIcon', FormFieldIcon);
});
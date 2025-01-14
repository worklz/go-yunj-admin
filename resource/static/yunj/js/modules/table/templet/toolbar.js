/**
 * tableToolbar
 */
layui.define(['TableTemplet', 'jquery', 'ydropdown'], function (exports) {

    let doc = document;
    let $ = layui.jquery;
    let TableTemplet = layui.TableTemplet;

    class TableToolbar extends TableTemplet {

        constructor(options) {
            options = Object.assign({}, {
                tableId: "",
                state: "",
                key: "",
                options: []
            }, options);
            super(options);
            this.actionOptions = {};     // 操作项
        }

        async renderBefore() {
            let that = this;
            that.actionOptions = that.options.options;
            return 'done';
        }

        layout() {
            let that = this;
            if (that.actionOptions.length <= 0) return '';
            if ($(doc).find(`body #${that.id}`).length > 0) return that.id;

            // 生成结构
            let templet = '';
            let actionOptions = that.actionOptions;
            let buildTable = that.table.getCurrBuildTable();
            if (yunj.isMobile()) {
                for (let k in actionOptions) {
                    if (!actionOptions.hasOwnProperty(k)) continue;
                    let option = actionOptions[k];
                    let layEvent = buildTable.generateLayEvent(buildTable.layEventLocation.toolbar,k,option);
                    templet += `<dd class="${option.class}" lay-event="${layEvent}">${option.title}</dd>`;
                }
                templet = yunj.dropdown.layout(templet);
            } else {
                let itemTemplet = '';
                let dropdownTemplet = '';
                for (let k in actionOptions) {
                    if (!actionOptions.hasOwnProperty(k)) continue;
                    let option = actionOptions[k];
                    let layEvent = buildTable.generateLayEvent(buildTable.layEventLocation.toolbar,k,option);
                    option.dropdown ? dropdownTemplet += `<dd class="${option.class}" lay-event="${layEvent}">${option.title}</dd>`
                        : itemTemplet += `<button type="button" class="layui-btn layui-btn-xs layui-btn-primary ${option.class}" lay-event="${layEvent}">${option.title}</button>`;
                }
                if (itemTemplet) templet += `<div class="layui-btn-group" style="margin-right: 10px">${itemTemplet}</div>`;
                if (dropdownTemplet) templet += yunj.dropdown.layout(dropdownTemplet);
            }

            return templet;
        }

    }

    let tableToolbar = (args) => {
        return new TableToolbar(args);
    };

    exports('tableToolbar', tableToolbar);
});
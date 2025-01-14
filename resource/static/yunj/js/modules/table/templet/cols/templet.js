/**
 * TableColTemplet
 */
layui.define(['TableTemplet'], function (exports) {

    let TableTemplet = layui.TableTemplet;

    class TableColTemplet extends TableTemplet {

        constructor(options) {
            options = Object.assign({}, {
                tableId: "",
                state: "",
                key: "",
                args: {},
            }, options);
            super(options);
            this.args = options.args;
        }

        _setData() {
            let that = this;
            that._setId();
            that.args = that.options.args;
            that._setBoxHtml();
        }

    }

    exports('TableColTemplet', TableColTemplet);
});
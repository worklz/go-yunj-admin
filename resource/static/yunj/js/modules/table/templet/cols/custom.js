/**
 * TableColCustom
 */
layui.define(['TableColTemplet'], function (exports) {

    let TableColTemplet = layui.TableColTemplet;

    class TableColCustom extends TableColTemplet{

        constructor(options) {
            super(options);
        }

        layout(){
            let that=this;
            return that.args.html;
        }

    }

    exports('TableColCustom', TableColCustom);
});
/**
 * TableColShowTime
 */
layui.define(['TableColTemplet'], function (exports) {

    let TableColTemplet = layui.TableColTemplet;

    class TableColShowTime extends TableColTemplet{

        constructor(options) {
            super(options);
        }

        // 字段结构
        layout(){
            let that=this;
            return `<span class="layui-badge layui-bg-gray">{{ yunj.timestampFormat(d.${that.key},'${that.args.format}') }}</span>`;
        }

    }

    exports('TableColShowTime', TableColShowTime);
});
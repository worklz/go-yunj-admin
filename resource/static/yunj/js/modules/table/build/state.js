/**
 * TableBuildState
 */
layui.define(['jquery', 'yunj', 'element', "TableBuild"], function (exports) {

    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let element = layui.element;
    let TableBuild = layui.TableBuild;

    class TableBuildState extends TableBuild {

        constructor(table) {
            super(table, "state");
            this.value = null; // 当前state值
        }

        /**
         * 渲染
         * @param mode  渲染方式(YunjTable.RENDER_MODE)
         * @return {Promise<void>}
         */
        async render(mode = '') {
            let that = this;
            let isInit = that.buildBoxEl.find('li').length <= 0;    // 是否初始化
            if (isInit) {
                that._renderBefore();
                let states = that.buildArgs;
                let layout = '';
                for (let i = 0; i < states.length; i++) {
                    layout += `<li data-state="${states[i].key}">${states[i].title}(<span class="count">0</span>)</li>`;
                }
                layout = `<div class="layui-tab layui-tab-brief state-box" lay-filter="state_${that.tableId}"><ul class="layui-tab-title">${layout}</ul></div>`;
                that.buildBoxEl.html(layout);
                that.buildBoxEl.find('.layui-tab-title li:first').addClass('layui-this');
            }
            // 设置当前状态值
            that.setValue();
            // 渲染数量(状态栏切换引起的渲染不重新获取状态栏数量)
            if (mode !== YunjTable.RENDER_MODE.STATE_SWITCH) {
                await that.renderCount();
            }
            if (isInit) {
                that._renderAfter();
            }
        }

        // 设置当前状态值
        setValue() {
            this.value = this.buildBoxEl.find('.layui-this').data('state');
        }

        // 获取当前状态值
        getValue() {
            return this.value;
        }

        // 渲染数量
        renderCount() {
            let that = this;
            return new Promise((resolve, reject) => {
                let requestData = {
                    [yunj.config('builder.id_key')]: that.tableId,
                    [yunj.config('builder.async_type_key')]: 'stateCount'
                };
                yunj.request(that.table.url, requestData, "post").then(res => {
                    let states = res.data;
                    if (!yunj.isEmptyObj(states)) {
                        for (let state in states) {
                            if (!states.hasOwnProperty(state)) continue;
                            let stateEl = that.buildBoxEl.find(`.state-box li[data-state=${state}]`);
                            if (stateEl.length > 0) stateEl.find('.count').html(states[state]);
                        }
                    }
                    resolve();
                }).catch(e => {
                    yunj.error(e);
                    reject(e);
                });
            });
        }

        // 渲染前
        _renderBefore() {
        }

        // 渲染后
        _renderAfter() {
            let that = this;

            // 绑定获取请求filter data的触发事件
            let eventRepeatKey = `YUNJ_TABLE_${that.tableId}_GET_REQUEST_FILTER_DATA_EVENT_BIND_BY_STATE`;
            if (yunj.isUndefined(win[eventRepeatKey])) {
                win[eventRepeatKey] = true;
                $(doc).bind(`yunj_table_${that.tableId}_get_request_filter_data`, function (e, data, args) {
                    data.state = args.state;
                });
            }
        }

        setEventBind() {
            let that = this;

            element.on(`tab(state_${that.tableId})`, function (data) {
                let state = $(this).data('state');
                let lastState = that.getValue();
                if (state === lastState) return false;

                that.table.render(YunjTable.RENDER_MODE.STATE_SWITCH);
            });
        }

    }

    exports('TableBuildState', TableBuildState);
});
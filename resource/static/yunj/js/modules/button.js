/**
 * YunjButton
 */
layui.define(['jquery'], function (exports) {
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class YunjButton {

        constructor(key, args) {
            args = this.handleArgs(key, args);
            this.args = args;

            this.key = key;             // 类型
            this.desc = args.desc;      // 描述
            this.class = args.class;    // class标记
            this.icon = args.icon;      // 图标
            this.formId = args.formId;  // 表单id
        }

        // 处理args
        handleArgs(key, args) {
            // 传入字符串时默认为配置formId
            if (yunj.isString(args)) {
                args = {formId: args};
            }
            // 默认配置
            let defaultTypes = yunj.config('form.button', {});
            let defaultTypeArgs = {};
            if (defaultTypes.hasOwnProperty(key)) {
                defaultTypeArgs = defaultTypes[key];
            }
            // 有默认配置时，填充空字符串内容
            if (!yunj.isEmptyObj(defaultTypeArgs)) {
                for (let k in args) {
                    if (yunj.isString(args[k]) && !args[k] && defaultTypeArgs.hasOwnProperty(k)) {
                        args[k] = defaultTypeArgs[k];
                    }
                }
            }
            args = Object.assign({}, {
                desc: '',
                class: '',
                icon: '',
                mobileDropDown: false,
                formId: '',
            }, defaultTypeArgs, args);
            return args;
        }

        // 生成id
        generateId() {
            let that = this;
            let id = that.formId;
            if (id) id += '_';
            id += that.key;
            return id;
        }

        /**
         * 渲染
         * @param boxFilter    渲染所在容器的filter
         * @param outLayout    外部结构 当传入外部结构时，如：<div>__layout__</div>，会用生成的结构替换掉关键词 __layout__
         */
        render(boxFilter = '', outLayout = '') {
            let that = this;
            let layout = that.layout();
            if (yunj.isString(outLayout) && outLayout.indexOf('__layout__') !== -1) layout = outLayout.replace('__layout__', layout);
            $(boxFilter).append(layout);
            return that;
        }

        /**
         * 布局
         * @param isDropdown 是否下拉
         * @returns {string}
         */
        layout(isDropdown = false) {
            let that = this;

            let id = that.generateId();
            let iconClass = yunj.iconClass(that.icon);
            let icon = iconClass ? `<i class="${iconClass}"></i> ` : '';
            return isDropdown ? `<dd id="${id}" title="${that.desc}" class="yunj-btn-${that.key}">${that.desc}</dd>`
                : `<button type="button" class="layui-btn layui-btn-sm ${that.class} yunj-btn-${that.key}" id="${id}" title="${that.desc}">${icon} ${that.desc}</button>`;
        }

    }


    let button = (key, args = {}) => {
        return new YunjButton(key, args);
    }

    exports('button', button);
});
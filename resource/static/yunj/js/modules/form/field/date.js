/**
 * FormFieldDate
 */
layui.define(['FormField', 'FormFieldActions', 'laydate'], function (exports) {

    let FormField = layui.FormField;
    let FormFieldActions = layui.FormFieldActions;
    let laydate = layui.laydate;

    class FormFieldDate extends FormField {

        constructor(options = {}) {
            super(options);
            this.layType = 'date';
            this.layFormat = "yyyy-MM-dd";
            this.yunjFormat = "Y-m-d";
        }

        defineExtraArgs() {
            let that = this;
            return {
                placeholder: "",
                min: "",
                max: "",
                range: false,
                shortcuts: [],
            };
        }

        handleArgs(args) {
            let that = this;
            // verify
            args = that.handleArgsVerify(args);
            return args;
        }

        handleArgsVerify(args) {
            let that = this;
            let type = args.type;
            let verify = args.verify;
            let range = args.range;
            if (range === false) {
                // 不是范围
                if (verify.indexOf(type) === -1) verify += (verify ? '|' : '') + type;
            } else {
                // 范围
                if (verify.indexOf('timeRange') === -1)
                    verify += (verify ? '|' : '') + ('timeRange:' + type);
            }
            args.verify = verify;
            return args;
        }

        // 定义字段外部包裹元素html结构，id和__layout__必须
        defineBoxHtml() {
            let that = this;
            return `<div class="layui-form-item yunj-form-item yunj-form-date yunj-form-${that.args.type}" id="${that.id}">__layout__</div>`;
        }

        layoutControl() {
            let that = this;
            let controlHtml = "<i class='layui-icon layui-icon-date'></i>";
            if (that.isRange()) {
                controlHtml += `<input type="text" class="start" placeholder="开始时间" autocomplete="off" ${that.args.readonly ? 'readonly' : ''}>
                                <span class="range">到</span>
                                <input type="text" class="end" placeholder="结束时间" autocomplete="off" ${that.args.readonly ? 'readonly' : ''}>`
            } else {
                controlHtml += `<input type="text" placeholder="${that.args.placeholder}" autocomplete="off" ${that.args.readonly ? 'readonly' : ''}>`
            }
            controlHtml = `<div class="show-box ${that.isRange() ? 'range' : ''}">${controlHtml}</div>`;
            return `<div class="layui-input-inline yunj-form-item-control">${controlHtml}</div>`;
        }

        setValue(val = '') {
            let that = this;
            if (that.isRange()) {
                if (!yunj.isObj(val)) {
                    val = yunj.isJson(val) ? JSON.parse(val) : {};
                }
                let start = val.start || '';
                let end = val.end || '';
                that.setInputValue(`input.start`, start);
                that.setInputValue(`input.end`, end);
            } else {
                that.setInputValue(`input`, val);
            }
        }

        // 设置输入框值
        setInputValue(inputSelector, value) {
            let that = this;
            if (!yunj.isScalar(value)) value = "";
            if (yunj.isTimestamp(value)) value = yunj.timestampFormat(value, that.yunjFormat);
            that.boxEl.find(inputSelector).val(value);
        }

        getValue() {
            let that = this;
            if (that.isRange()) {
                let start = that.boxEl.find(`input.start`).val();
                let end = that.boxEl.find(`input.end`).val();
                return !start && !end ? "" : {
                    start: that.boxEl.find(`input.start`).val(),
                    end: that.boxEl.find(`input.end`).val()
                }
            } else {
                return that.boxEl.find(`input`).val();
            }
        }

        async renderDone() {
            let that = this;
            if (that.args.readonly) return;
            let args = {
                type: that.layType,
                format: that.layFormat,
                trigger: 'click',
                position: 'absolute',
            };
            if (that.args.min) args.min = that.args.min;
            if (that.args.max) args.max = that.args.max;
            // 是否范围选择
            if (that.isRange()) {
                args.elem = `#${that.id} .show-box`;
                args.range = [`#${that.id} .show-box input.start`, `#${that.id} .show-box input.end`];
                args.rangeLinked = true;
            } else {
                args.elem = `#${that.id} .show-box input`;
            }
            // 快捷选择栏
            if (that.args.shortcuts && yunj.isArray(that.args.shortcuts) && that.args.shortcuts.length > 0) {
                let shortcuts = [];
                for (let i = 0; i < that.args.shortcuts.length; i++) {
                    let item = that.args.shortcuts[i];
                    // 判断字符串是否是：年/月/年月/日期/日期时间/时间 等类型的数据，反之都是可执行的js代码
                    if (yunj.isString(item.value) && !yunj.isDatetimeVal(item.value)) {
                        item.value = eval(item.value)
                    }
                    shortcuts.push(item);
                }
                args.shortcuts = shortcuts;
            }
            laydate.render(args);
            // 设置字段操作项：内容清理
            that.fieldActions = new FormFieldActions({
                fieldObj: that,
                fieldValueElSelector: `.show-box`,
                fieldValueElNoAutoIndent: true,    // 字段值展示容器宽度不自动缩进
                actions: {
                    contentClear: null,
                }
            });
        }

        defineExtraEventBind() {
            let that = this;

            if (that.isReadonly()) return;

            if (!that.isRange()) {
                that.boxEl.on('click', '.show-box', function (e) {
                    that.boxEl.find(`input`).click();
                });

                that.boxEl.on('click', '.show-box input', function (e) {
                    e.stopPropagation();
                });
            }

        }

        // 是否范围选择
        isRange() {
            return !!this.args.range;
        }

    }

    exports('FormFieldDate', FormFieldDate);
});
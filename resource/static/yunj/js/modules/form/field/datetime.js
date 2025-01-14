/**
 * FormFieldDatetime
 */
layui.define(['FormFieldDate'], function (exports) {

    let FormFieldDate = layui.FormFieldDate;

    class FormFieldDatetime extends FormFieldDate {

        constructor(options = {}) {
            super(options);
            this.layType = 'datetime';
            this.layFormat = "yyyy-MM-dd HH:mm:ss";
            this.yunjFormat = "Y-m-d H:i:s";
        }

    }

    exports('FormFieldDatetime', FormFieldDatetime);
});
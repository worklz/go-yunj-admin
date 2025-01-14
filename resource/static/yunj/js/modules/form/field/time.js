/**
 * FormFieldTime
 */
layui.define(['FormFieldDate'], function (exports) {

    let FormFieldDate = layui.FormFieldDate;

    class FormFieldTime extends FormFieldDate {

        constructor(options={}) {
            super(options);
            this.layType = 'time';
            this.layFormat = "HH:mm:ss";
            this.yunjFormat = "H:i:s";
        }

    }

    exports('FormFieldTime', FormFieldTime);
});
/**
 * FormFieldYearMonth
 */
layui.define(['FormFieldDate'], function (exports) {

    let FormFieldDate = layui.FormFieldDate;

    class FormFieldYearMonth extends FormFieldDate {

        constructor(options={}) {
            super(options);
            this.layType = 'month';
            this.layFormat = "yyyy-MM";
            this.yunjFormat = "Y-m";
        }

    }

    exports('FormFieldYearMonth', FormFieldYearMonth);
});
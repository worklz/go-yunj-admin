/**
 * FormFieldYear
 */
layui.define(['FormFieldDate'], function (exports) {

    let FormFieldDate = layui.FormFieldDate;

    class FormFieldYear extends FormFieldDate {

        constructor(options={}) {
            super(options);
            this.layType = 'year';
            this.layFormat = "yyyy";
            this.yunjFormat = "Y";
        }

    }

    exports('FormFieldYear', FormFieldYear);
});
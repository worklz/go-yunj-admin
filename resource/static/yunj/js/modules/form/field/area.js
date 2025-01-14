/**
 * FormFieldArea
 */
layui.define(['FormField', 'yunj', 'jquery', 'form'], function (exports) {

    let FormField = layui.FormField;
    let $ = layui.jquery;
    let form = layui.form;

    class FormFieldArea extends FormField {

        constructor(options = {}) {
            super(options);
            this.options = null;
            this.acc = 'district';    // 精度
            this.province_el = null;  // 省dom元素
            this.city_el = null;      // 市dom元素
            this.district_el = null;  // 区/县dom元素
            this.last_value = null;   // 最近一次的值
        }

        defineExtraArgs() {
            let that = this;
            return {
                acc: 'district'
            };
        }

        handleArgs(args) {
            if (args.verify.indexOf("area") === -1)
                args.verify += (args.verify ? "|" : "") + `area:${args.acc}`;
            return args;
        }

        defineBoxHtml() {
            let that = this;
            return `<div class="layui-form-item yunj-form-item yunj-form-area" id="${that.id}">__layout__</div>`;
        }

        async renderBefore() {
            let that = this;
            await new Promise(resolve => {
                yunj.area_options().then(options => {
                    that.options = options;
                    resolve('done');
                });
            });
            that.acc = that.args.acc;
            return 'done';
        }

        layoutControl() {
            let that = this;
            let controlHtml = `<select name="${that.id}_province" data-type="province" lay-filter="${that.id}_province" ${that.args.readonly ? 'disabled' : 'lay-search'}></select>`;
            controlHtml = that.layout_control_acc(controlHtml);
            return `<div class="layui-input-inline yunj-form-item-control">${controlHtml}</div>`;
        }

        layout_control_acc(content) {
            let that = this;
            if (that.acc === 'province') return content;
            content += `<select name="${that.id}_city" data-type="city" lay-filter="${that.id}_city" ${that.args.readonly ? 'disabled' : 'lay-search'}></select>`;
            if (that.acc === 'city') return content;
            content += `<select name="${that.id}_district" data-type="district" lay-filter="${that.id}_district" ${that.args.readonly ? 'disabled' : 'lay-search'}></select>`;
            return content;
        }

        renderDone() {
            let that = this;
            that.province_el = that.boxEl.find(`select[name=${that.id}_province]`);
            if (that.acc === 'province') return true;
            that.city_el = that.boxEl.find(`select[name=${that.id}_city]`);
            if (that.acc === 'city') return true;
            that.district_el = that.boxEl.find(`select[name=${that.id}_district]`);
        }

        setValue(val = '') {
            let that = this;

            if (yunj.isString(val)) val = yunj.isJson(val) ? JSON.parse(val) : {province: '', city: '', district: ''};
            if (!yunj.isObj(val) || yunj.isEmptyObj(val) || !val.hasOwnProperty("province")
                || (that.args.acc === "city" && !val.hasOwnProperty("city"))
                || (that.args.acc === "district" && (!val.hasOwnProperty("city") || !val.hasOwnProperty("district"))))
                val = {province: '', city: '', district: ''};

            // province
            that.set_value_province(val);
            if (that.args.acc === 'province') {
                form.render('select', that.tabFormFilter);
                that.last_value = val;
                return true;
            }

            // city
            that.set_value_city(val);
            if (that.args.acc === 'city') {
                form.render('select', that.tabFormFilter);
                that.last_value = val;
                return true;
            }

            // district
            that.set_value_district(val);
            form.render('select', that.tabFormFilter);
            that.last_value = val;
        }

        set_value_province(val) {
            let that = this;

            if (that.boxEl.find(`select[name=${that.id}_province] option`).length > 0) {
                that.province_el.find('option').prop('selected', false);
                if (val.province.toString().length > 0) that.province_el.find(`option[value=${val.province}]`).prop('selected', true);
                return true;
            }

            let provinceOptions = that.options[0];
            let provinceOptionsHtml = '<option value="">请选择</option>';
            for (let code in provinceOptions) {
                if (!provinceOptions.hasOwnProperty(code)) continue;
                provinceOptionsHtml += `<option value="${code}" ${val.hasOwnProperty('province') && code === val.province ? 'selected' : ''}>${provinceOptions[code]}</option>`;
            }
            that.province_el.html(provinceOptionsHtml);
        }

        set_value_city(val) {
            let that = this;

            if (val.province.toString().length <= 0) {
                that.city_el.html('<option value="">请选择</option>');
                that.city_el.attr('disabled', true);
                that.city_el.removeAttr('lay-search');
                return true;
            }
            if (!that.args.readonly) {
                that.city_el.attr('disabled', false);
                that.city_el.attr('lay-search', true);
            }

            let cityOptions = that.options[`0,${val.province}`];
            let cityFirstCode = Object.keys(cityOptions)[0];

            if (that.city_el.find(`option[value=${cityFirstCode}]`).length > 0) {
                that.city_el.find('option').prop('selected', false);
                if (val.city.toString().length > 0) that.city_el.find(`option[value=${val.city}]`).prop('selected', true);
                return true;
            }

            let cityOptionsHtml = '';
            for (let code in cityOptions) {
                if (!cityOptions.hasOwnProperty(code)) continue;
                cityOptionsHtml += `<option value="${code}" ${val.hasOwnProperty('city') && code === val.city ? 'selected' : ''}>${cityOptions[code]}</option>`;
            }
            that.city_el.html(cityOptionsHtml);
        }

        set_value_district(val) {
            let that = this;

            if (val.city.toString().length <= 0) {
                that.district_el.html('<option value="">请选择</option>');
                that.district_el.attr('disabled', true);
                that.district_el.removeAttr('lay-search');
                return true;
            }
            if (!that.args.readonly) {
                that.district_el.attr('disabled', false);
                that.district_el.attr('lay-search', true);
            }

            let districtOptions = that.options[`0,${val.province},${val.city}`];
            let districtFirstCode = Object.keys(districtOptions)[0];

            if (that.district_el.find(`option[value=${districtFirstCode}]`).length > 0) {
                that.district_el.find('option').prop('selected', false);
                if (val.district.toString().length > 0) that.district_el.find(`option[value=${val.district}]`).prop('selected', true);
                return true;
            }

            let districtOptionsHtml = '';
            for (let code in districtOptions) {
                if (!districtOptions.hasOwnProperty(code)) continue;
                districtOptionsHtml += `<option value="${code}" ${val.hasOwnProperty('district') && code === val.district ? 'selected' : ''}>${districtOptions[code]}</option>`;
            }
            that.district_el.html(districtOptionsHtml);
        }

        getValue() {
            let that = this;
            let province = that.province_el.val();
            if (province.toString().length <= 0) return '';
            let val = {};
            that.boxEl.find('select').each(function () {
                val[$(this).data('type')] = $(this).val();
            });
            return yunj.isEmptyObj(val) ? "" : val;
        }

        defineExtraEventBind() {
            let that = this;

            form.on(`select(${that.id}_province)`, function (data) {
                let province = that.province_el.val();
                if (province === that.last_value.province) return true;
                let val = {province: province};
                if (that.acc === 'province') {
                    that.setValue(val);
                    return true;
                }
                val.city = province.toString().length > 0 ? Object.keys(that.options[`0,${province}`])[0] : '';
                if (that.acc === 'city') {
                    that.setValue(val);
                    return true;
                }
                val.district = val.city.toString().length > 0 ? Object.keys(that.options[`0,${province},${val.city}`])[0] : '';
                that.setValue(val);
            });

            form.on(`select(${that.id}_city)`, function (data) {
                let city = that.city_el.val();
                if (city === that.last_value.city) return true;
                let val = {province: that.province_el.val(), city: city};
                if (that.acc === 'city') {
                    that.setValue(val);
                    return true;
                }
                val.district = Object.keys(that.options[`0,${val.province},${city}`])[0];
                that.setValue(val);
            });

            form.on(`select(${that.id}_district)`, function (data) {
                let district = that.district_el.val();
                if (district === that.last_value.district) return true;
                let val = that.getValue();
                that.setValue(val);
            });

        }

    }

    exports('FormFieldArea', FormFieldArea);
});
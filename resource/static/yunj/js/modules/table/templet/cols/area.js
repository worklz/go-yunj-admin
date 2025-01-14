/**
 * TableColArea
 */
layui.define(['TableColTemplet', 'jquery', 'yunj'], function (exports) {

    let TableColTemplet = layui.TableColTemplet;
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class TableColArea extends TableColTemplet {

        constructor(options) {
            super(options);
            this.areaOptions = null;
            this.acc = 'district';    // 精度
        }

        async renderBefore() {
            let that = this;
            await new Promise(resolve => {
                yunj.area_options().then(options => {
                    that.areaOptions = options;
                    resolve('done');
                });
            });
            that.acc = that.args.acc;
            return 'done';
        }

        layout() {
            let that = this;
            return `{{# 
                        let options = JSON.parse('${JSON.stringify(that.areaOptions)}');
                        let acc = '${that.acc}';
                        let area = d.${that.key};
                        area = typeof area==='object'?area:{};
                        let province = '';
                        if(area.hasOwnProperty('province')&&area.province.toString().length>0){
                            let provinceOptions=options[0];
                            province = provinceOptions.hasOwnProperty(area.province)?provinceOptions[area.province]:'';
                        }
                        
                        let city='';
                        if(area.hasOwnProperty('city')&&area.city.toString().length>0&&province.length>0&&options.hasOwnProperty('0,'+area.province)){
                            let cityOptions=options['0,'+area.province];
                            city = cityOptions.hasOwnProperty(area.city)?cityOptions[area.city]:'';
                        }
                        
                        let district='';
                        if(area.hasOwnProperty('district')&&area.district.toString().length>0&&city.length>0&&options.hasOwnProperty('0,'+area.province+','+area.city)){
                            let districtOptions=options['0,'+area.province+','+area.city];
                            district = districtOptions.hasOwnProperty(area.district)?districtOptions[area.district]:'';
                        }
                        
                        let text = '';
                        switch(acc){
                            case 'province':
                                text=province;
                                break;
                            case 'city':
                                text=province+(city.length>0?' / '+city:'');
                                break;
                            case 'district':
                                text=province+(city.length>0?' / '+city:'')+(district.length>0?' / '+district:'');
                                break;
                        }
                     }}
                     <div class="table-row-area" title="复制地区:{{ text }}">{{ text }}</div>`;
        }

        defineExtraEventBind() {
            let that = this;

            // 防止重复绑定事件
            if (yunj.isUndefined(win.TABLE_ROW_AREA_CLICK_COPY_EVENT_BIND)) {
                win.TABLE_ROW_AREA_CLICK_COPY_EVENT_BIND = true;
                $(doc).on('click', '.table-row-area', function () {
                    yunj.copy($(this).html());
                    e.stopPropagation();
                });
            }
        }

    }

    exports('TableColArea', TableColArea);
});
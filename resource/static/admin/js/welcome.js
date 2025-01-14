layui.use(["jquery", 'yunj'], function () {
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class Dashboard {

        constructor() {
            this.type = 'pv';
            this.typeDesc = '浏览量 PV';
            this.topActionPanelEl = $('.top-action-panel');

            // 数据
            this.numberPanelEl = $('.number-panel');
            this.numberData = null;
            // 折线图
            this.lineChartPanelEl = $('.line-chart-panel');
            this.lineChartData = null;
            this.lienChartObj = null;
            // 地图
            this.mapChartPanelEl = $('.map-chart-panel');
            this.mapChartData = null;
            this.mapChartObj = null;
            // 柱状图
            this.barChartPanelEl = $('.bar-chart-panel');
            this.barChartData = null;
            this.barChartObj = null;
            this.init();
        }

        init() {
            let that = this;
            that.render().then(res => {
                that.setEventBind();
            });
        }

        /**
         * 初始化结构
         * @param {boolean} requeryData  重新查询数据
         */
        async render(requeryData = false) {
            let that = this;
            await that.numberRender(requeryData);
            await that.lineChartRender(requeryData);
            await that.mapChartRender(requeryData);
            await that.barChartRender(requeryData);
        }

        // 数字渲染
        async numberRender(requeryData) {
            let that = this;
            let numberPanelEl = that.numberPanelEl;

            let numberData = await that.getNumberData(requeryData);
            if (!numberData) {
                numberPanelEl.find('.item .val').html('--');
                numberPanelEl.find('.item .trend').html('');
                return;
            }

            for (let k in numberData) {
                if (!numberData.hasOwnProperty(k)) {
                    continue;
                }
                let itemEl = numberPanelEl.find(`.item.${k}`);
                if (!itemEl) {
                    continue;
                }
                let itemData = numberData[k];
                itemEl.find('.val').html(itemData.value);
                let trendHtml = '';
                let trendFlag = itemData.trend.flag;
                if (trendFlag) {
                    trendHtml = `<i class="yunj-icon yunj-icon-${trendFlag}">${itemData.trend.ratio}</i>%`;
                }
                itemEl.find('.trend').html(trendHtml);
            }
        }

        // 获取数字数据
        getNumberData(requeryData) {
            let that = this;
            return new Promise(resolve => {
                let numberData = that.numberData;
                if (numberData && !requeryData) {
                    resolve(numberData);
                    return;
                }
                let numberPanelEl = that.numberPanelEl;
                yunj.request({
                    type: 'post',
                    url: numberPanelEl.data('url'),
                }).then(res => {
                    numberData = res.data;
                    that.numberData = numberData;
                    resolve(numberData);
                }).catch(err => {
                    console.log(err);
                    that.numberData = null;
                    resolve(null);
                });
            });
        }

        // 折线图渲染
        async lineChartRender(requeryData) {
            let that = this;
            let lineChartPanelEl = that.lineChartPanelEl;

            let lineChartData = await that.getLineChartData(requeryData);

            let {todaySeriesData, yesterdaySeriesData} = lineChartData[that.type];

            let todayColor = '#4fa8f9';
            let todayAreaColor = '#e5f2fe';
            let yesterdayColor = '#b9dcfd';
            let option = {
                tooltip: {
                    trigger: 'axis',
                    padding: 0,
                    borderWidth: 0,
                    className: 'tooltip-box line-chart',
                    textStyle: {
                        fontSize: 12,
                    },
                    formatter: function (params) {
                        let startH = params[0].axisValueLabel;
                        let endH = startH.replace(':00', ':59');
                        let currTime = yunj.currTimestamp();
                        let header = {
                            left: startH + '-' + endH,
                            right: that.typeDesc,
                        };
                        let items = [];
                        params.reverse().forEach(param => {
                            let name = param.seriesName;
                            let desc = yunj.timestampFormat(name === 'today' ? currTime : (currTime - 86400), 'Y-m-d');
                            items.push({
                                name: name,
                                desc: desc,
                                value: param.value,
                            });
                        });
                        return that.tooltipFormatter(header, items);
                    }
                },
                xAxis: {
                    axisLabel: {
                        interval: 3  // 每间隔3个展示一个标签
                    },
                    boundaryGap: false,  // 刻度从0开始
                    data: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"]
                },
                yAxis: [
                    {}
                ],
                grid: {left: '40px', right: '15px', bottom: '30px',},
                series: [
                    {
                        name: 'today',
                        type: 'line',
                        showSymbol: false,
                        itemStyle: {
                            emphasis: {  // 拐点鼠标移上去的颜色
                                color: todayColor,
                                borderColor: todayColor,
                                borderWidth: 2,
                            }
                        },
                        lineStyle: { // 折线样式
                            normal: {
                                color: todayColor
                            }
                        },
                        areaStyle: {
                            color: todayAreaColor
                        },
                        data: todaySeriesData
                    }
                ]
            };
            if (lineChartPanelEl.find('#yesterday_data_show').prop('checked')) {
                option.series.unshift({
                    name: 'yesterday',
                    type: 'line',
                    showSymbol: false,
                    itemStyle: {
                        emphasis: {  // 拐点鼠标移上去的颜色
                            color: yesterdayColor,
                            borderColor: yesterdayColor,
                            borderWidth: 2,
                        }
                    },
                    lineStyle: { // 折线样式
                        normal: {
                            color: yesterdayColor
                        }
                    },
                    data: yesterdaySeriesData
                });
            }
            if (!that.lienChartObj) {
                let height = parseInt(lineChartPanelEl.width() / 2);
                lineChartPanelEl.find('.line-chart').css('height', height + 'px');
                that.lienChartObj = echarts.init(doc.querySelector('.line-chart-panel .line-chart'));
            }
            // true表示进行重新渲染
            that.lienChartObj.setOption(option, true);
        }

        // 获取折线图数据
        getLineChartData(requeryData) {
            let that = this;
            let itemDefaultData = {
                'todaySeriesData': [],
                'yesterdaySeriesData': [],
            };
            let defaultData = {};
            ['pv', 'uv'].forEach(item => {
                defaultData[item] = itemDefaultData
            });
            return new Promise(resolve => {
                let lineChartData = that.lineChartData;
                if (lineChartData && !requeryData) {
                    resolve(lineChartData || defaultData);
                    return;
                }
                let lineChartPanelEl = that.lineChartPanelEl;
                yunj.request({
                    type: 'post',
                    url: lineChartPanelEl.data('url'),
                }).then(res => {
                    lineChartData = res.data;
                    that.lineChartData = lineChartData;
                    resolve(lineChartData || defaultData);
                }).catch(err => {
                    console.log(err);
                    that.lineChartData = null;
                    resolve(defaultData);
                });
            });
        }

        // 地图渲染
        async mapChartRender(requeryData) {
            let that = this;
            let mapChartPanelEl = that.mapChartPanelEl;

            let mapChartData = await that.getMapChartData(requeryData);
            mapChartData = mapChartData[that.type];

            let {legend, values} = mapChartData;
            let option = {
                tooltip: {
                    trigger: 'item',
                    padding: 0,
                    borderWidth: 0,
                    className: 'tooltip-box map-chart',
                    textStyle: {
                        fontSize: 12,
                    },
                    formatter: function (params) {
                        let value = params.value;
                        if (isNaN(value) || !value) {
                            return;
                        }
                        let ratioVal = (value / mapChartData.total) * 100;
                        if((ratioVal % 1) > 0){
                            // 有小数，保留两位小数
                            ratioVal = Math.floor(ratioVal * 100) / 100;
                        }else{
                            // 没有小数取整
                            ratioVal = parseInt(ratioVal);
                        }

                        let ratio = ratioVal + '%';

                        let header = {
                            left: params.name,
                        };
                        let items = [
                            {name: that.type, desc: that.typeDesc, value: value},
                            {name: 'ratio', desc: '占比', value: ratio}
                        ];
                        return that.tooltipFormatter(header, items);
                    }
                },
                grid: {left: 0, right: 0, top: 0, bottom: 0},
                visualMap: {
                    show: false,
                    color: ["#3385e3", "#5b9ce9", "#90bcf0", "#c6ddf7", "#ebf3fc"],
                    splitNumber: 5,
                    min: legend.min,
                    max: legend.max,
                },
                series: [
                    {
                        name: "省份数据",
                        type: "map",
                        map: "china",
                        zoom: 1.25,
                        data: values
                    }
                ]
            };

            $.getJSON('/static/admin/welcome/china.json', function (chinaJson) {
                echarts.registerMap('china', chinaJson);
                if (!that.mapChartObj) {
                    let height = parseInt(mapChartPanelEl.width() * 0.75);
                    mapChartPanelEl.find('.map-chart').css('minHeight', height + 'px');
                    that.mapChartObj = echarts.init(doc.querySelector('.map-chart-panel .map-chart'));
                }
                // true表示进行重新渲染
                that.mapChartObj.setOption(option, true);
            });
        }

        // 获取地图数据
        getMapChartData(requeryData) {
            let that = this;
            let itemDefaultData = {
                'legend': {
                    'min': 0,
                    'max': 0,
                },
                'total': 0,
                'values': [],
            };
            let defaultData = {};
            ['pv', 'uv'].forEach(item => {
                defaultData[item] = itemDefaultData
            });
            return new Promise(resolve => {
                let mapChartData = that.mapChartData;
                if (mapChartData && !requeryData) {
                    resolve(mapChartData || defaultData);
                    return;
                }
                let mapChartPanelEl = that.mapChartPanelEl;
                yunj.request({
                    type: 'post',
                    url: mapChartPanelEl.data('url'),
                }).then(res => {
                    mapChartData = res.data;
                    that.mapChartData = mapChartData;
                    resolve(mapChartData || defaultData);
                }).catch(err => {
                    console.log(err);
                    that.mapChartData = null;
                    resolve(defaultData);
                });
            });
        }

        // 柱状图渲染
        async barChartRender(requeryData) {
            let that = this;
            let barChartPanelEl = that.barChartPanelEl;

            let barChartData = await that.getBarChartData(requeryData);
            barChartData = barChartData[that.type];

            let {yAxisData, values, total} = barChartData;
            let option = {
                tooltip: {
                    trigger: 'item',
                    padding: 0,
                    borderWidth: 0,
                    className: 'tooltip-box bar-chart',
                    textStyle: {
                        fontSize: 12,
                    },
                    formatter: function (params) {
                        let value = params.value;
                        if (isNaN(value) || !value) {
                            return;
                        }
                        let ratioVal = (value / total) * 100;
                        if((ratioVal % 1) > 0){
                            // 有小数，保留两位小数
                            ratioVal = Math.floor(ratioVal * 100) / 100;
                        }else{
                            // 没有小数取整
                            ratioVal = parseInt(ratioVal);
                        }

                        let ratio = ratioVal + '%';

                        let header = {
                            left: params.name,
                        };
                        let items = [
                            {name: that.type, desc: that.typeDesc, value: value},
                            {name: 'ratio', desc: '占比', value: ratio}
                        ];
                        return that.tooltipFormatter(header, items);
                    }
                },
                grid: {
                    top: '15px',
                    left: '15px',
                    right: '15px',
                    bottom: 0,
                    containLabel: true
                },
                yAxis: [
                    {
                        type: 'category',
                        data: yAxisData,
                        axisTick: {
                            alignWithLabel: true
                        }
                    }
                ],
                xAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name: '访客数 UV',
                        type: 'bar',
                        barWidth: '60%',
                        itemStyle: {
                            normal: {
                                color: '#4fa8f9'
                            }
                        },
                        data: values
                    }
                ]
            };
            if (!that.barChartObj) {
                let height = parseInt(barChartPanelEl.width() * 0.75);
                let _height = 20 * values.length;
                if (_height > height) {
                    height = _height;
                }
                barChartPanelEl.find('.bar-chart').css('height', height + 'px');
                that.barChartObj = echarts.init(doc.querySelector('.bar-chart-panel .bar-chart'));
            }
            // true表示进行重新渲染
            that.barChartObj.setOption(option, true);
        }

        // 获取柱状图数据
        getBarChartData(requeryData) {
            let that = this;

            let itemDefaultData = {
                'yAxisData': [],
                'values': [],
                'total': 0,
            };
            let defaultData = {};
            ['pv', 'uv'].forEach(item => {
                defaultData[item] = itemDefaultData
            });

            return new Promise(resolve => {
                let barChartData = that.barChartData;
                if (barChartData && !requeryData) {
                    resolve(barChartData || defaultData);
                    return;
                }
                let barChartPanelEl = that.barChartPanelEl;
                yunj.request({
                    type: 'post',
                    url: barChartPanelEl.data('url'),
                }).then(res => {
                    barChartData = res.data;
                    that.barChartData = barChartData;
                    resolve(barChartData || defaultData);
                }).catch(err => {
                    console.log(err);
                    that.barChartData = null;
                    resolve(defaultData);
                });
            });
        }

        // 事件绑定
        setEventBind() {
            let that = this;

            // 折线图pv/uv切换
            that.topActionPanelEl.on('click', '.types .type', function (e) {
                let type = $(this).data('type');
                that.setType(type);
                e.stopPropagation();
            });

            // 折线图前一日
            that.lineChartPanelEl.on('click', '#yesterday_data_show', function (e) {
                that.lineChartRender();
                e.stopPropagation();
            });

            // 缓存刷新
            $(doc).on('click', '#btn_cache_refresh', function (e) {
                let btnEl = $(this);
                if (btnEl.prop('disable')) {
                    yunj.msg('缓存刷新中，请稍后再试');
                    return;
                }
                btnEl.attr('disable', true);
                yunj.request({
                    type: 'post',
                    url: btnEl.data('url'),
                    loading: true,
                    complete: function () {
                        btnEl.attr('disable', false);
                    }
                }).then(res => {
                    that.render(true);
                }).catch(err => {
                    yunj.error(err);
                });
                e.stopPropagation();
            });

            // 图片下载
            $(doc).on('click', '#btn_img_download', function (e) {
                let btnEl = $(this);
                if (btnEl.prop('disable')) {
                    yunj.msg('图片下载中，请稍后再试');
                    return;
                }
                btnEl.attr('disable', true);

                html2canvas(doc.querySelector('.main')).then(function (canvas) {
                    let imgUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                    let currTime = yunj.currTimestamp(true);
                    let imgName = yunj.timestampFormat(currTime, 'YmdHis') + '.png';
                    yunj.download(imgUrl, imgName);
                });

                btnEl.attr('disable', false);
                e.stopPropagation();
            });
        }

        // 设置type
        setType(type = 'pv') {
            let that = this;
            let topActionPanelEl = that.topActionPanelEl;
            let typesEl = topActionPanelEl.find('.types');
            typesEl.find('.type').removeClass('active');
            let typeEl = typesEl.find(`.type[data-type=${type}]`);
            typeEl.addClass('active');
            let typeDesc = typeEl.text();
            if (that.type === type && that.typeDesc === typeDesc) {
                return;
            }
            that.type = type;
            that.typeDesc = typeDesc;
            that.render();
        }

        /**
         * 图标提示窗格式
         * @param {object} header
         * @param {array} items
         * @return {string}
         */
        tooltipFormatter(header, items) {
            let itemsHtml = '';
            items.forEach(item => {
                itemsHtml += `<div class="item ${item.name}">
                                    <div class="label">
                                        <span class="icon">●</span>
                                        <span class="desc">${item.desc}</span>
                                    </div>
                                    <div class="value">${item.value}</div>
                                </div>`;
            });
            return `<div class="header">
                        <div class="left">${header.left || ''}</div>
                        <div class="right">${header.right || ''}</div>
                    </div>
                    <div class="body">
                        ${itemsHtml}
                    </div>`;
        }

    }

    $(doc).ready(function () {
        new Dashboard();
    });

});
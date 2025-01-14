/**
 * 云静Admin父页面
 */
layui.use(['jquery', 'yunj', 'layer', 'element', 'md5'], function () {
    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let layer = layui.layer;
    let element = layui.element;
    let md5 = layui.md5;

    class YunjPage {

        constructor() {
            // 页面选项卡filter标识
            this.pageTabFilter = 'xbs_tab';

            this.leftNavEl = null;
            // 左侧菜单栏展开页面内容遮罩层
            this.leftNavOpenPageContentMask = null;

            this.iframeTabBoxEl = null;
            // 我的桌面lay-id
            this.homeTabLayId = '';
            // tab面板记录缓存key
            this.tabRecordsKey = 'tabRecords';
            // tab关闭面板
            this.iframeTabClosePanelEl = null;
            // tab关闭面板内容遮罩层
            this.iframeTabClosePanelContentMask = null;

            // 全局搜索
            this.globalSearchEl = null;
            // 全局搜索记录缓存key
            this.globalSearchRecordsKey = 'globalSearchRecords';
            // 全局搜索无结果的key
            this.globalSearchNoResultKey = 'no_result';

            // 文件下载
            this.fileDownloadEl = null;

            this.init();
        }

        init() {
            let that = this;
            that.initAttr();
            that.setEventBind();
            // 初始化记录的tab页面
            that.initRecordsTab();
        }

        initAttr() {
            let that = this;
            let memberId = yunj.getLoginMemberId();
            that.leftNavEl = $('.left-nav');
            that.leftNavOpenPageContentMask = $('#left_nav_open_page_content_mask');
            that.iframeTabBoxEl = $(".page-content .layui-tab-title");
            that.iframeTabClosePanelEl = $("#tab_close_panel");
            that.iframeTabClosePanelContentMask = $("#tab_close_panel_content_mask");
            that.homeTabLayId = that.iframeTabBoxEl.find('li>.home').attr('lay-id');
            that.tabRecordsKey = memberId + '_' + that.tabRecordsKey;
            that.globalSearchEl = $(".header .global-search");
            if (that.globalSearchEl.length >= 0) {
                that.globalSearchRecordsKey = memberId + '_' + that.globalSearchRecordsKey;
            }
            that.fileDownloadEl = $(".header .file-download");
        }

        // 初始化记录的tab页面
        initRecordsTab() {
            let that = this;
            let selectedTabLayId = that.homeTabLayId;
            let {tabIds, records} = that.getTabRecordsLocalStorage();
            for (let tabId in records) {
                if (!records.hasOwnProperty(tabId)) {
                    continue;
                }
                let record = records[tabId];
                if (!record.hasOwnProperty('args')) {
                    continue;
                }
                if (record.hasOwnProperty('isCurr') && record.isCurr) {
                    selectedTabLayId = tabId;
                }
                that.openTab(record.args);
            }
            element.tabChange(that.pageTabFilter, selectedTabLayId);
        }

        leftNavOpen() {
            let that = this;
            let leftNavEl = that.leftNavEl;
            leftNavEl.animate({width: '220px'}, 100);
            $('.page-content').animate({left: '220px'}, 100);
            $('.left-nav i').css('font-size', '14px');
            $('.left-nav cite,.left-nav .li-icon-right').show();
            if ($(win).width() < 768) that.leftNavOpenPageContentMask.show();
        }

        leftNavClose() {
            let that = this;
            let leftNavEl = that.leftNavEl;
            $('.left-nav .open').click();
            $('.left-nav i').css('font-size', '18px');
            leftNavEl.animate({width: '60px'}, 100);
            $('.left-nav cite,.left-nav .li-icon-right').hide();
            $('.page-content').animate({left: '60px'}, 100);
            if ($(win).width() < 768) that.leftNavOpenPageContentMask.hide();
        }

        // 展示全局搜索结果
        showGlobalSearchResult() {
            let that = this;
            let boxEl = that.globalSearchEl;
            let resultEl = boxEl.find('.result');
            let itemsEl = resultEl.find('.item');
            itemsEl.css('display', 'none');
            let keywordsEl = boxEl.find('input[name=global_search_keywords]');
            let keywords = keywordsEl.val();
            let keys = [];
            let recordSortKeys = that.getGlobalSearchResultRecordSortKeys();

            if (keywords) {
                let i = 1;
                let itemCount = itemsEl.length;
                itemsEl.each(function (e) {
                    let desc = $(this).data('desc');
                    let pattern = new RegExp(keywords, 'i'); // 不区分大小写匹配
                    if (desc && desc.search(pattern) !== -1) {
                        let key = $(this).data('key');
                        let recordSortIdx = -1;
                        if ((recordSortIdx = recordSortKeys.indexOf(key)) !== -1) {
                            keys[recordSortIdx] = key;
                        } else {
                            keys[itemCount + i] = key;
                        }
                        i++;
                    }
                });
            } else {
                keys = JSON.parse(JSON.stringify(recordSortKeys));
                let keysLen = keys.length;
                let i = 0;
                itemsEl.each(function (e) {
                    let key = $(this).data('key');
                    if (key === that.globalSearchNoResultKey || keys.indexOf(key) !== -1) return true;
                    keys[keysLen + i] = key;
                    i++;
                });
            }
            if (keys.length <= 0) keys = [that.globalSearchNoResultKey];

            keys = yunj.arrayUnique(keys);
            keys.forEach(function (key) {
                let itemEl = resultEl.find(`.item[data-key=${key}]`);
                resultEl.append(itemEl);
                itemEl.show();
            });

            boxEl.find('.result-mask').show();
            resultEl.css('display', 'flex');
        }

        // 隐藏全局搜索结果
        hideGlobalSearchResult() {
            let that = this;
            let boxEl = that.globalSearchEl;
            boxEl.find('.result').css('display', 'none');
            boxEl.find('.result-mask').hide();
            boxEl.find('.input-box input[name=global_search_keywords]').val('');
        }

        // 获取全局搜索结果记录排序后的key
        getGlobalSearchResultRecordSortKeys() {
            let that = this;
            let keys = [];
            let records = yunj.getLocalStorage(that.globalSearchRecordsKey, []);
            for (let i = 0; i < records.length; i++) {
                keys.push(records[i].key);
            }
            return yunj.arrayUnique(keys);
        }

        // 全局搜索结果记录
        setGlobalSearchResultRecord(key) {
            let that = this;
            let records = yunj.getLocalStorage(that.globalSearchRecordsKey, []);
            // 判断是否存在，存在则删除原来的
            for (let i = 0; i < records.length; i++) {
                if (records[i].key === key) {
                    records.splice(i, 1);    // 删除元素
                    break;
                }
            }
            records.unshift({key: key, time: yunj.currTimestamp()});
            yunj.setLocalStorage(that.globalSearchRecordsKey, records);
        }

        // 展示文件下载项
        showFileDownloadItems() {
            let that = this;
            let boxEl = that.fileDownloadEl;
            boxEl.find('.items-mask').show();
            boxEl.find('.items-box').css('display', 'flex');
        }

        // 隐藏文件下载项
        hideFileDownloadItems() {
            let that = this;
            let boxEl = that.fileDownloadEl;
            boxEl.find('.items-box').css('display', 'none');
            boxEl.find('.items-mask').hide();
        }

        // 取消文件下载项
        removeFileDownloadItem(id) {
            let that = this;
            let boxEl = that.fileDownloadEl;
            boxEl.find(`#${id}`).remove();
            if (boxEl.find('.items-box').html().trim() === '') {
                boxEl.find('.items-box').html('暂无文件下载中...');
            }
        }

        setEventBind() {
            let that = this;

            // 菜单下的li点击时触发
            that.leftNavEl.on('click', '#nav li', function (e) {
                let liEl = $(this);
                //当菜单收起来时点击打开
                if (that.leftNavEl.width() < 200) that.leftNavOpen();

                //去除所有a标签的active
                that.leftNavEl.find('a').removeClass('active');
                //添加当前li下一层的子元素a，添加active
                liEl.children('a').addClass('active');

                //如果当前li下有子菜单则展开
                if (liEl.children('.sub-menu').length) {
                    if (liEl.hasClass('open')) {
                        // 关闭
                        liEl.removeClass('open');
                        liEl.find('.li-icon-right').removeClass("layui-icon-down").addClass("layui-icon-left");
                        liEl.children('.sub-menu').stop(true, true).slideUp();
                        liEl.siblings().children('.sub-menu').slideUp();
                    } else {
                        // 展开
                        liEl.addClass('open');
                        liEl.children('a').find('.li-icon-right').removeClass("layui-icon-left").addClass("layui-icon-down");
                        liEl.children('.sub-menu').stop(true, true).slideDown();
                        liEl.siblings().children('.sub-menu').stop(true, true).slideUp();
                        liEl.siblings().find('.li-icon-right').removeClass("layui-icon-down").addClass("layui-icon-left");
                        liEl.siblings().removeClass('open');
                    }
                }
                e.stopPropagation();
            });

            // 左边菜单收起来时，鼠标移上去显示提示框的索引index
            that.leftNavEl.on('mouseenter', '#nav .left-nav-li', function (e) {
                let liEl = $(this);
                if (that.leftNavEl.width() < 200) liEl.attr("lay-tips-index", layer.tips(liEl.attr('lay-tips'), liEl));
            });

            //左边菜单收起来时，鼠标移开删除对应索引index的显示提示框
            that.leftNavEl.on('mouseout', '#nav .left-nav-li', function (e) {
                let liEl = $(this);
                let idx = liEl.attr("lay-tips-index");
                if (idx) {
                    layer.close(idx);
                    liEl.attr("lay-tips-index", 0);
                }
            });

            //顶部控制菜单栏的展开和收起
            $('.header .action .left-open i').click(function (e) {
                that.leftNavEl.width() > 200 ? that.leftNavClose() : that.leftNavOpen();
            });

            // 移动端菜单展开
            that.leftNavEl.on("click", function (e) {
                if ($(win).width() >= 768 || that.leftNavEl.width() > 200 || $(e.target).attr("class") !== that.leftNavEl.attr("class")) return;
                that.leftNavOpen();
            });

            // 移动端菜单关闭
            $(doc).on("click", function (e) {
                if ($(win).width() >= 768 || that.leftNavEl.width() < 200 || $(e.target).attr("id") !== that.leftNavOpenPageContentMask.attr("id")) return;
                that.leftNavClose();
            });

            // 去掉默认的鼠标contextmenu事件，否则会和右键事件同时出现
            that.iframeTabBoxEl.on('contextmenu', 'li', function (e) {
                e.preventDefault();
            });

            // 鼠标点击选项卡事件
            that.iframeTabBoxEl.on('mousedown', 'li', function (e) {
                let liEl = $(this);
                switch (e.button) {
                    case 0:
                        // 点了左键
                        break;
                    case 1:
                        // 点了滚轮，关闭
                        liEl.find('.layui-tab-close').click();
                        break;
                    case 2:
                        // 点了右键，显示面板
                        let tabLeft = liEl.position().left;
                        let tabWidth = liEl.width();
                        let idx = liEl.attr('lay-id');
                        that.iframeTabClosePanelEl.css({'left': tabLeft + tabWidth / 2}).show().attr("lay-id", idx || null);
                        that.iframeTabClosePanelContentMask.show();
                        break;
                }
                e.stopPropagation();
            });

            // 点击关闭当前/其它/全部时触发
            that.iframeTabClosePanelEl.on('click', 'dd', function (e) {
                let iframeTabBoxEl = that.iframeTabBoxEl;
                let type = $(this).attr('data-type');
                let layId = that.iframeTabClosePanelEl.attr('lay-id');
                let closeLiEl = null;
                if (type === 'this' && layId) {
                    closeLiEl = iframeTabBoxEl.find(`li[lay-id=${layId}]`);
                } else if (type === 'other') {
                    iframeTabBoxEl.find('li').eq(0).find('.layui-tab-close').remove();
                    closeLiEl = iframeTabBoxEl.find(layId ? `li[lay-id!=${layId}]` : 'li[lay-id]');
                } else if (type === 'all') {
                    closeLiEl = iframeTabBoxEl.find('li[lay-id]');
                }
                closeLiEl && closeLiEl.find('.layui-tab-close').click();
                that.iframeTabClosePanelEl.hide();
                that.iframeTabClosePanelContentMask.hide();
            });

            // 点击其他地方时隐藏关闭当前/其它/全部时触发面板
            $('.page-content,#tab_close_panel_content_mask,.container,.left-nav').click(function (e) {
                that.iframeTabClosePanelEl.hide();
                that.iframeTabClosePanelContentMask.hide();
            });

            // 设置主题
            $('.set-theme').on('click', function (e) {
                layer.open({
                    type: 5,
                    title: '主题设置',
                    shade: 0.2,
                    area: ['295px', '90%'],
                    offset: 'rb',
                    maxmin: true,
                    shadeClose: true,
                    closeBtn: false,
                    anim: 2,
                    content: $('#theme_tpl').html(),
                    success: function (layero, index) {
                        yunj.theme.setThemeTplActive();
                        $('.theme-box li').on('click', function () {
                            yunj.theme.set($(this).data('code'));
                            yunj.close(index);
                        });
                    }
                });
                return false;
            });

            // 监听tab切换
            element.on(`tab(${that.pageTabFilter})`, function () {
                let layId = this.getAttribute('lay-id');
                // 设置当前tab页选中记录，welcome没有时就清理掉其他页面的选中
                that.setSelectedTabRecordsLocalStorage(layId);
                if (!layId) return;
                let iframe = $(doc).find(`iframe[tab-id=${layId}]`);
                if (iframe.length <= 0) return;

                let tabPageWin = iframe[0].contentWindow;
                try {
                    // 防止跨域请求异常错误抛出
                    // 处理 table 重新resize大小
                    // 用于其他页面调用原页面table.render时大小发生变化
                    if (!tabPageWin.hasOwnProperty('yunj') || !yunj.isObj(tabPageWin.yunj)
                        || !tabPageWin.yunj.hasOwnProperty('table') || !yunj.isObj(tabPageWin.yunj.table)) return;
                    let table = tabPageWin.yunj.table;
                    for (let id in table) {
                        if (!table.hasOwnProperty(id)) continue;
                        let tableObj = table[id];
                        let buildTable = tableObj.getCurrBuildTable();
                        buildTable && buildTable.resize();
                    }
                } catch (err) {
                    console.log(err);
                }
            });

            // 监听tab删除前事件
            element.on(`tabBeforeDelete(${that.pageTabFilter})`, function (data) {
                let layId = this.getAttribute('lay-id');
                that.delTabRecordsLocalStorage(layId);
            });

            // 全局搜索（显示）
            that.globalSearchEl.on('click', '.input-box', function (e) {
                if (!that.globalSearchEl.find('.result').is(":visible")) {
                    // 如果隐藏就显示
                    that.showGlobalSearchResult();
                }
                e.stopPropagation();
            });

            // 全局搜索键入
            that.globalSearchEl.on('keyup', '.input-box input[name=global_search_keywords]', function (e) {
                that.showGlobalSearchResult();
            });

            // 全局搜索结果点击
            that.globalSearchEl.on('click', '.result>.item', function (e) {
                let key = $(this).data('key');
                if (!key || key === that.globalSearchNoResultKey) return;
                that.setGlobalSearchResultRecord(key);
                that.hideGlobalSearchResult();
            });

            // 文件下载（显示）
            that.fileDownloadEl.on('click', '.icon-box', function (e) {
                if (that.fileDownloadEl.find('.items-box').is(":visible")) {
                    that.hideFileDownloadItems();
                } else {
                    that.showFileDownloadItems();
                }
                e.stopPropagation();
            });

            // 文件下载（取消）
            that.fileDownloadEl.on('click', '.items-box .item .item-action .remove', function (e) {
                let id = $(this).closest('.item').attr('id');
                that.removeFileDownloadItem(id);
                e.stopPropagation();
            });

            $(doc).on('click', function (e) {
                // 全局搜索（隐藏）
                if (!$(e.target).closest('.header .global-search .result').length) {
                    // 如果显示就隐藏
                    if (that.globalSearchEl.find('.result').is(":visible")) {
                        that.hideGlobalSearchResult();
                    }
                }

                // 文件下载（隐藏）
                if (!$(e.target).closest('.header .file-download .items-box').length) {
                    // 如果显示就隐藏
                    if (that.fileDownloadEl.find('.items-box').is(":visible")) {
                        that.hideFileDownloadItems();
                    }
                }
            });
        }

        /**
         * 页面id
         * @param url
         */
        pageId(url) {
            let that = this;
            url = url.substr(0, 4) === 'http' ? url : location.protocol + "//" + location.host + url;
            return md5(url);
        }

        /**
         * 打开tab子页面
         * @param {string|object} url              页面地址
         * object:{
         *      url:"",
         *      title:"",
         *      rawPage:""
         * }
         * @param {string} title     页面标题
         * @param {string|null} rawPage    源页面标识
         * @return {void}
         */
        openTab(url, title = "", rawPage = null) {
            let that = this;
            let args = yunj.objSupp(yunj.isObj(url) ? url : {
                url: url,
                title: title,
                rawPage: rawPage
            }, {
                url: "",
                title: "",
                rawPage: null
            });

            // 判断是否携带源页面标识（必须在生成tabId前，防止获取tab页面标题时匹配不上）
            if (args.rawPage) args.url = yunj.urlPushParam(args.url, "rawPage", args.rawPage);
            let tabId = that.pageId(args.url);
            let tabFilter = that.pageTabFilter;

            //判断点击页面是否已打开
            for (let i = 0, len = $('.x-iframe').length; i < len; i++) {
                if ($('.x-iframe').eq(i).attr('tab-id') === tabId) {
                    element.tabChange(tabFilter, tabId);
                    return;
                }
            }

            // 关掉弹窗页面
            layer.closeAll();

            //新增tab iframe子页面
            element.tabAdd(tabFilter, {
                title: args.title,
                content: `<iframe tab-id="${tabId}" frameborder="0" src="${args.url}" scrolling="yes" class="x-iframe"></iframe>`,
                id: tabId
            });

            // 添加tab记录
            that.addTabRecordsLocalStorage(tabId, args);

            //切换选中
            element.tabChange(tabFilter, tabId);
            that.iframeTabBoxEl.find(`li[lay-id=${tabId}] .layui-tab-close`).unbind('click').on('click', function (e) {
                that.closeTab(tabId);
                e.stopPropagation();
            });
        };

        /**
         * 打开popup子页面
         * @param {string|object} url              页面地址
         * object:{
         *      url:"",
         *      title:"",
         *      rawPage:"",
         *      w:null,
         *      h:null
         * }
         * @param {string} title     页面标题
         * @param {string|null} rawPage    源页面标识
         * @param {string|int|null} w       [指定宽]（可选，可设置百分比或者像素，像素传入int）
         * @param {string|int|null} h       [指定高]（可选，同上）
         * @return {void}
         */
        openPopup(url, title = "", rawPage = null, w = null, h = null) {
            let that = this;
            let args = yunj.objSupp(yunj.isObj(title) ? title : {
                url: url,
                title: title,
                rawPage: rawPage,
                w: w,
                h: h
            }, {
                url: "",
                title: "",
                rawPage: null,
                w: null,
                h: null
            });


            let area = 'auto';
            if (args.w !== null && h !== null) {
                args.w = args.w.toString();
                args.h = args.h.toString();
                area = [args.w.indexOf('%') !== -1 ? args.w : `${args.w}px`, args.h.indexOf('%') !== -1 ? args.h : `${args.h}px`];
            } else {
                area = ['80%', '80%'];
            }
            let param = {isPopup: "yes"};
            args.url = yunj.urlPushParam(args.url, param);
            let layerArgs = {
                id: that.pageId(url),
                type: 2,
                title: args.title,
                content: args.rawPage ? yunj.urlPushParam(args.url, "rawPage", args.rawPage) : args.url,
                skin: "popup-page",
                area: area,
                closeBtn: 1,
                shadeClose: true,
                shade: 0.2,
                maxmin: true,
                success: function (layero, index) {
                    //弹出后的回调
                },
                end: function () {
                    //销毁后的回调
                }
            };
            // 关掉其他的弹窗页面
            layer.closeAll();
            return layer.open(layerArgs);
        };

        /**
         * 关闭指定tabId子页面（兼容移动端关闭后显示空白的问题）
         * @param tabId
         */
        closeTab(tabId) {
            let that = this;
            let currIdx = that.iframeTabBoxEl.find(`li[lay-id=${tabId}]`).index();
            let tabLiLen = that.iframeTabBoxEl.find("li").length;
            let showIdx = currIdx < (tabLiLen - 1) ? currIdx + 1 : currIdx - 1;
            that.iframeTabBoxEl.find('li').eq(showIdx).click();
            element.tabDelete(that.pageTabFilter, tabId);
        }

        // 设置tab面板记录缓存
        getTabRecordsLocalStorage() {
            let that = this;
            return yunj.getLocalStorage(that.tabRecordsKey, {
                tabIds: [],
                records: {},
            });
        }

        // 设置tab面板记录缓存
        setTabRecordsLocalStorage(tabIds, records) {
            let that = this;
            yunj.setLocalStorage(that.tabRecordsKey, {
                tabIds: tabIds,
                records: records,
            }, 60 * 60 + 24);
        }

        // 删除tab面板记录缓存
        delTabRecordsLocalStorage(tabId) {
            let that = this;
            let {tabIds, records} = that.getTabRecordsLocalStorage();
            let tabIdx = tabIds.indexOf(tabId);
            if (tabIdx !== -1) {
                tabIds = [...tabIds.slice(0, tabIdx), ...tabIds.slice(tabIdx + 1)];
            }
            if (records.hasOwnProperty(tabId)) {
                delete records[tabId];
            }
            // 设置缓存
            that.setTabRecordsLocalStorage(tabIds, records);
        }

        // 新增tab面板记录缓存
        addTabRecordsLocalStorage(tabId, args) {
            let that = this;
            let {tabIds, records} = that.getTabRecordsLocalStorage();
            if (tabIds.indexOf(tabId) === -1) {
                tabIds.push(tabId);
            }
            records[tabId] = {
                args: args,
            };
            // 设置缓存
            that.setTabRecordsLocalStorage(tabIds, records);
        }

        // 设置tab面板选中记录缓存
        setSelectedTabRecordsLocalStorage(tabId) {
            let that = this;
            let {tabIds, records} = that.getTabRecordsLocalStorage();
            if (tabId !== that.homeTabLayId && (tabIds.indexOf(tabId) === -1 || !records.hasOwnProperty(tabId))) {
                return;
            }
            // 删除当前页面标识
            for (let _tabId in records) {
                if (!records.hasOwnProperty(_tabId)) {
                    continue;
                }
                records[_tabId].isCurr = false;
            }
            // 设置当前页面标识，设置缓存
            tabId !== that.homeTabLayId && records.hasOwnProperty(tabId) && (records[tabId].isCurr = true) && that.setTabRecordsLocalStorage(tabIds, records);
        }

        /**
         * 重定向到指定tab子页面
         * @param tabId    [默认null指向首页]
         * @returns {*}
         */
        redirectTab(tabId = null) {
            let that = this;
            that.iframeTabBoxEl.find(`li${tabId === null ? '.home' : '[lay-id=' + tabId + ']'}`).click();
            return tabId;
        }

        // 当前显示tab页面的page_id
        currTabPageId() {
            let that = this;
            let ttlEl = that.iframeTabBoxEl.find('li.layui-this');
            if (ttlEl.length <= 0) return null;
            let layID = ttlEl.eq(0).attr('lay-id');
            return layID && yunj.isString(layID) ? layID : null;
        }

        // 当前显示popup页面的page_id
        currPopupPageId(popup_page_el = null) {
            let that = this;
            popup_page_el = popup_page_el || $(".layui-layer-iframe.popup-page");
            if (popup_page_el.length <= 0) return null;
            return popup_page_el.find(".layui-layer-content").eq(0).attr("id");
        }

    }

    win.yunj.page = new YunjPage();

});
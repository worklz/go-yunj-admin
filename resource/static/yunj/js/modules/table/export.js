/**
 * tableExport（表格导出）
 */
layui.define(['cookie', 'yunj', "jquery", "laytpl", "validate"], function (exports) {
    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let laytpl = layui.laytpl;
    let cookie = layui.cookie;
    let validate = layui.validate;

    class YunjTableExport {

        constructor(table) {
            this.table = table;                         // 要导出的表格对象
            this.tableId = table.id;                    // 要导出的表格ID
            this.tableBuildTable = table.getCurrBuildTable();    // 要导出的表格对象
            this.itemsTotalCount = this.tableBuildTable.itemsCount;            // 要导出的表格数据总量

            this.requestFilter = null;                                  // 请求filter条件
            this.requestSort = this.tableBuildTable.getCurrRequestSort();      // 请求sort条件

            this.file = null;                       // 文件，包含name、ext

            this.isCanRequest = true;               // 是否可以请求
            this.loadProgress = null;               // 加载进度对象

            this.hasCheckedRow = false;             // 存在数据行勾选

            this.cols = [];                         // 导出工作表表头
            this.sheet = [];                        // 导出工作表
            this.sheetRowNum = 0;                   // 导出工作表行数

            this.prompt().then(res => this.init());
        }

        // 提示
        prompt() {
            let that = this;

            return new Promise((resolve, reject) => {

                let key = yunj.currPageId() + ":" + that.tableId;

                let file = cookie.get(key);
                file = file && yunj.isJson(file) ? JSON.parse(file) : {
                    name: (doc.title ? `${doc.title}_${that.tableId}` : that.tableId),
                    ext: "xlsx"
                };
                file.name = file.name.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\_\-]+/g, "_");

                let content = `<div class="yunj-table-export-prompt-box">
                                    <div class="label">文件名</div>
                                    <div class="file-name">
                                        <input type="text" name="file_name" placeholder="汉字/字母/数字/_/-" value="${file.name}" autocomplete="off" class="layui-input">
                                    </div>
                                    <div class="file-ext">.xlsx</div>
                                </div>`;

                let options = {
                    type: 1,
                    title: "确认导出？",
                    content: content,
                    btn: ["确认", "取消"],
                    shadeClose: true,
                    yes: function (idx, layero) {
                        let promptBoxEl = layero.find(".yunj-table-export-prompt-box");
                        let file = {
                            name: promptBoxEl.find("input[name=file_name]").val(),
                            ext: "xlsx"
                        };
                        validate.create({
                            rule: {
                                name: "require|chsDash",
                                ext: "require|in:xlsx"
                            },
                            message: {
                                "name.require": "文件名不能为空",
                                "name.chsDash": "文件名仅允许汉字/字母/数字/下划线_/破折号-组合",
                                "ext.require": "文件格式不能为空",
                                "ext.in": "文件格式选择错误",
                            }
                        });
                        validate.checkTips(file);
                        that.file = file;
                        yunj.isExistParent() ? parent.layer.close(idx) : layer.close(idx);
                        cookie.set(key, JSON.stringify(that.file));
                        resolve("done");
                    }
                };

                yunj.isExistParent() ? parent.layer.open(options) : layer.open(options);
            });

        }

        async init() {
            let that = this;
            await that.initResource();
            that.initData();
            that.exec();
        }

        async initResource() {
            let that = this;
            await yunj.includeXlsxStyle();
            return "done";
        }

        // 初始化数据
        initData() {
            let that = this;
            that.setRequestFilter();
            that.isCanRequest = true;
            that.setCols();
            that.setSheetInit();
        }

        setRequestFilter() {
            let that = this;
            let pksKey = that.table.getCurrPksKey();
            let args = {
                convert: false
            };
            args[pksKey] = true;
            let requestFilter = that.table.getCurrRequestFilter(args);
            that.hasCheckedRow = requestFilter[pksKey].length > 0;
            that.requestFilter = JSON.stringify(requestFilter);
        }

        setCols() {
            let that = this;
            // 去掉操作栏（深拷贝，不影响原始值）
            let pk = that.tableBuildTable.getCurrPk();
            let cols = JSON.parse(JSON.stringify(that.tableBuildTable.layTable.config.cols))[0];
            for (let i = 0; i < cols.length; i++) {
                let col = cols[i];
                // 去掉主键表头、隐藏的表头和操作栏表头
                if ((col.field === pk) || (col.hasOwnProperty("hide") && col.hide) || (col.templet.length > 0 && /^#templet_[\w]*_action$/.test(col.templet))) {
                    cols.splice(i, 1);
                    i--;
                    continue;
                }
                // 标题为空的字段，field补充
                if (col.title.length <= 0) col.title = col.field;
                // 加上模板对象
                let tpl = col.templet.substr(0, 1) === "#" ? $(col.templet).html() : col.templet;
                col.tplObj = tpl.length > 0 ? laytpl(tpl) : null;
                cols[i] = col;
            }
            that.cols = cols;
        }

        setSheetInit() {
            let that = this;

            let sheet = [];
            let sheetColsWch = [];
            for (let i = 0, l = that.cols.length; i < l; i++) {
                let col = that.cols[i];
                let ref = XLSX.utils.encode_cell({c: i, r: 0});
                sheet[ref] = {
                    v: col.title,
                    s: {
                        fill: {
                            fgColor: {
                                rgb: "FFC0C0C0"
                            }
                        },
                        font: {
                            name: "宋体",
                            sz: 11
                        },
                        alignment: {
                            vertical: "center",
                            horizontal: "center",
                        },
                        border: {
                            right: {style: "thin"},
                            bottom: {style: "thin"},
                        }
                    }
                };
                // wch
                let wch = yunj.xlsx_sheet_cell_wch(col.title);
                wch = wch > 10 ? wch : 10;
                sheetColsWch.push({wch: wch});
            }
            sheet['!cols'] = sheetColsWch;

            that.sheet = sheet;
            that.sheetRowNum = 1;
        }

        // 执行
        exec() {
            let that = this;
            yunj.loadProgress({
                tips: `表格数据，正在下载中...`,
                rand_progress: false,
                done: (obj) => {
                    obj.set_tips(`表格数据，正在导出中...`);
                    that.save();
                },
                close: (obj) => {
                    that.isCanRequest = false;
                }
            }).then(obj => {
                that.loadProgress = obj;
                // 数据请求
                that.request();
            });
        }

        /**
         * 数据请求
         * @param num   [请求批次]
         */
        request(num = 1) {
            let that = this;
            if (!that.isCanRequest) {
                return false;
            }
            let requestData = {
                [yunj.config('builder.id_key')]: that.tableId,
                [yunj.config('builder.async_type_key')]: 'export',
                num: num,
                filter: that.requestFilter,
                sort: that.requestSort
            };

            yunj.request(that.table.url, requestData, "post").then(res => {
                let data = res.data;
                // 拼接导出标识
                data.items.map(item => {
                    item.is_export = true;
                    return item;
                });
                if (data.items.length > 0) {
                    that.itemsPushSheet(data.items);
                }

                // 不存在数据行勾选
                if (!that.hasCheckedRow) {
                    // 判断是否继续请求数据(num*limit<item_count)
                    let isPage = data.isPage;           // 是否分页
                    let currNum = data.num | 0;       // 当前数据请求批次
                    let currLimit = data.limit | 0;   // 每批次请求数据量
                    let itemsCount = currNum * currLimit;
                    if (isPage && itemsCount < that.itemsTotalCount) {
                        let progress = ((itemsCount * 100) / that.itemsTotalCount) | 0;
                        progress = progress > 99 ? 99 : progress;
                        that.loadProgress.reset_progress(progress);
                        that.request(currNum + 1);
                        return false;
                    }
                }
                that.loadProgress.reset_progress(100);
            }).catch(e => {
                console.log(e);
                yunj.close(that.loadProgress.index);
                yunj.error(e);
            });
        }

        item_cell_val(item, col) {
            let that = this;
            if (!col.tplObj) return item[col.field];
            try {
                let html = col.tplObj.render(item);
                return yunj.trim($(html).text());
            } catch (e) {
                console.log(e);
                return item[col.field];
            }
        }

        itemsPushSheet(items) {
            let that = this;

            items.forEach(item => {
                let r = that.sheetRowNum;
                for (let i = 0, l = that.cols.length; i < l; i++) {
                    let col = that.cols[i];
                    let ref = XLSX.utils.encode_cell({c: i, r: r});
                    that.sheet[ref] = {
                        v: that.item_cell_val(item, col),
                        s: {
                            font: {
                                name: "宋体",
                                sz: 11
                            },
                            alignment: {
                                vertical: "center"
                            }
                        }
                    };
                }
                that.sheetRowNum++;
            });
        }

        save() {
            let that = this;

            that.sheet["!ref"] = XLSX.utils.encode_range({
                s: {c: 0, r: 0},
                e: {c: that.cols.length - 1, r: that.sheetRowNum}
            });

            let workbook = {
                SheetNames: ["sheet"],
                Sheets: {sheet: that.sheet},
            };

            // excel的配置项
            let wopts = {
                bookType: that.file.ext,     // 要生成的文件类型
                bookSST: false,             // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
                type: 'binary'
            };
            let wbout = XlsxStyle.write(workbook, wopts);
            // blob
            let blob = new Blob([yunj.str_to_array_buffer(wbout)], {type: "application/octet-stream"});

            yunj.download({name: `${that.file.name}.${that.file.ext}`, blob: blob});
        }

    }

    let tableExport = (table) => {
        if (yunj.isMobile()) return yunj.alert('抱歉！暂不支持移动端导出数据', {icon: "warn"});
        new YunjTableExport(table);
    };

    exports('tableExport', tableExport);
});
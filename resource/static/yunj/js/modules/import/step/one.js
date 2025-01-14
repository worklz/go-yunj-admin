/**
 * ImportStepOne
 */
layui.define(['jquery', 'yunj', "ImportStep", "upload"], function (exports) {

    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let ImportStep = layui.ImportStep;
    let upload = layui.upload;

    class ImportStepOne extends ImportStep {

        constructor(importObj) {
            super(importObj, "one", "上传文件");
            this.templetDescSheetName = "导入数据描述";      // 模板描述工作表名称
            this.templetDescSheet = null;                   // 模板描述工作表
            this.templetBlob = null;                        // 模板文件blob
            this.uploadFile = null;                         // 上传文件
            this.layUploadObj = null;                       // layui文件上传对象
        }

        async render(refresh = false) {
            let that = this;
            if (!refresh && that.contentBoxEl.html().length > 0) return;

            let tipsHtml = "";
            that.importObj.rawArgs.tips.forEach((v, i) => tipsHtml += `<li>${i + 1}、${v}</li>`);
            let html = `<div class="yunj-import-step-content-row">
                                <button class="layui-btn layui-btn-sm layui-btn-normal yunj-btn-templet-download" >
                                    <i class="layui-icon layui-icon-download-circle"></i>
                                    点击下载示例模板
                                </button>
                            </div>
                            <div class="yunj-import-step-content-row file-upload-box" style="position: relative">
                                <div class="file-drag">
                                    <i class="layui-icon layui-icon-upload"></i>
                                    <p>点击上传，或将文件拖拽到此处</p>
                                </div>
                                <div class="file-preview">
                                    <div class="item"><span class="name">qwe</span>
                                    <i class="layui-icon layui-icon-close-fill remove" title="删除文件：qwe"></i></div>
                                </div>
                            </div>
                            <div class="yunj-import-step-content-row tips-box">
                                <span class="title">提示！请注意以下问题：</span>
                                <ul class="list">${tipsHtml}</ul>
                            </div>`;
            that.contentBoxEl.html(html);
            that._uploadEventBind();
        }

        // 初始化模板描述工作表
        _initTempletDescSheet() {
            let that = this;
            let descSheet = {
                sheet: {},
                range: {s: {c: 0, r: 0}, e: {c: 0, r: 0}},
                merges: [
                    {s: {c: 0, r: 0}, e: {c: 1, r: 0}},     // 合并A1 B1
                ],
                cols: [{'wch': 10}, {'wch': 100}],
                rowIdx: 0   // 行索引
            };
            let A1Cell = {
                v: "注意：黄色底纹列为必填项",
                s: {
                    font: {
                        name: "宋体",
                        sz: 9,
                        color: {rgb: "FFFF0000"}
                    },
                    alignment: {
                        vertical: "center"
                    }
                }
            };
            let A1CellRef = XLSX.utils.encode_cell({c: 0, r: 0});
            descSheet.sheet[A1CellRef] = A1Cell;
            that.templetDescSheet = descSheet;
        }

        /**
         * 获取模板描述工作表新一行索引
         * @param {integer} inc   行索引递增值，默认1
         * @private
         */
        _getTempletDescSheetNewRow(inc = 1) {
            return this.templetDescSheet.rowIdx = this.templetDescSheet.rowIdx + inc;
        }

        // 设置模板描述工作表第一列单元格宽度
        _setTempletDescSheetCol0Wch(wch) {
            let that = this;
            let col0Wch = that.templetDescSheet.cols[0]["wch"];
            if (wch > col0Wch) that.templetDescSheet.cols[0]["wch"] = wch;
        }

        // 设置模板描述工作表单元格
        _setTempletDescSheetCell(args) {
            let that = this;
            args = yunj.objSupp(args, {
                col: 0,                                      // 列序号
                row: that.templetDescSheet.rowIdx,         // 行序号
                cell: null,                                 // 单元格参数
                mergeA1A2: false,                           // 合并A1 A2
            });
            if (args.cell) {
                let cellRef = XLSX.utils.encode_cell({c: args.col, r: args.row});
                that.templetDescSheet.sheet[cellRef] = args.cell;
            }
            if (args.mergeA1A2) that.templetDescSheet.merges.push({s: {c: 0, r: args.row}, e: {c: 1, r: args.row}});
        }

        /**
         * 设置模板工作表
         * @param workbook
         * @param sheet     工作表名称
         * @param cols      表头配置
         * @private
         */
        _setTempletSheet(workbook, sheet, cols) {
            let that = this;

            // 每个工作表字段描述前空一行
            that._setTempletDescSheetCell({
                row: that._getTempletDescSheetNewRow(),
                mergeA1A2: true,
            });
            // desc
            that._setTempletDescSheetCell({
                row: that._getTempletDescSheetNewRow(),
                mergeA1A2: true,
                cell: {
                    v: `${sheet}工作表字段描述如下：`,
                    s: {
                        font: {
                            name: "宋体",
                            sz: 9
                        },
                        alignment: {
                            vertical: "center"
                        }
                    }
                }
            });

            // workSheet
            let range = {s: {c: 0, r: 0}, e: {c: 0, r: 0}};
            let workSheet = {};
            let colsWidth = [];
            let i = 0;
            for (let k in cols) {
                if (!cols.hasOwnProperty(k)) continue;
                let col = cols[k];
                let title = col["title"];
                let defaultVal = col["default"];
                let verify = col["verify"].length > 0 ? col["verify"].split("|") : [];
                let desc = col["desc"];
                let titleWch = yunj.xlsx_sheet_cell_wch(title);
                let defaultWch = yunj.xlsx_sheet_cell_wch(defaultVal);

                // desc
                if (desc.length > 0) {
                    that._setTempletDescSheetCell({
                        row: that._getTempletDescSheetNewRow(),
                        cell: {
                            v: title,
                            s: {font: {name: "宋体", sz: 9}, alignment: {vertical: "center", horizontal: "center"}}
                        }
                    });
                    that._setTempletDescSheetCell({
                        col: 1,
                        cell: {
                            v: desc,
                            s: {font: {name: "宋体", sz: 9}, alignment: {vertical: "center", wrapText: true}}
                        },
                    });
                    that._setTempletDescSheetCol0Wch(titleWch);
                }

                // title
                let titleCell = {
                    v: title,
                    t: "s",
                    s: {
                        fill: {
                            fgColor: {
                                rgb: verify.indexOf("require") !== -1 ? "FFFFFF00" : "FFC0C0C0"
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
                let titleCellRef = XLSX.utils.encode_cell({c: i, r: 0});

                // default
                let defaultCell = {
                    v: defaultVal,
                    t: yunj.isNumber(defaultVal) ? "n" : (yunj.isBool(defaultVal) ? "b" : "s"),
                    s: {
                        font: {
                            name: "宋体",
                            sz: 11
                        },
                        alignment: {
                            vertical: "center",
                        }
                    }
                };
                let defaultCellRef = XLSX.utils.encode_cell({c: i, r: 1});

                // wch
                let wch = titleWch > defaultWch ? titleWch : defaultWch;
                wch = wch > 10 ? wch : 10;
                colsWidth.push({'wch': wch});

                workSheet[titleCellRef] = titleCell;
                workSheet[defaultCellRef] = defaultCell;
                i++;
            }

            range.e.c = i;
            range.e.r = 1;
            workSheet['!ref'] = XLSX.utils.encode_range(range);
            workSheet['!cols'] = colsWidth;
            workbook.SheetNames.push(sheet);
            workbook.Sheets[sheet] = workSheet;
        }

        // 设置模板blob
        _setTempletBlob() {
            let that = this;
            // workbook
            let workbook = {
                SheetNames: [],
                Sheets: {},
            };

            that._initTempletDescSheet();
            let cols = that.getCols();

            if (that.isSetSheet()) {
                // 有设置sheet
                that.importObj.rawArgs.sheet.forEach(sheet => {
                    if (!cols.hasOwnProperty(sheet)) return;
                    let sheetCols = cols[sheet];
                    that._setTempletSheet(workbook, sheet, sheetCols);
                });
            } else {
                // 没有设置sheet
                that._setTempletSheet(workbook, that.importObj.defaultSheetName, cols);
            }

            // 补充描述工作表
            let descSheet = that.templetDescSheet;
            descSheet.range.e.c = 1;
            descSheet.range.e.r = descSheet.rowIdx;
            descSheet.sheet['!ref'] = XLSX.utils.encode_range(descSheet.range);
            descSheet.sheet['!cols'] = descSheet.cols;
            descSheet.sheet["!merges"] = descSheet.merges;
            workbook.SheetNames.push(that.templetDescSheetName);
            workbook.Sheets[that.templetDescSheetName] = descSheet.sheet;

            // excel的配置项
            let wopts = {
                bookType: 'xlsx',   // 要生成的文件类型
                bookSST: false,    // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
                type: 'binary'
            };
            let wbout = XlsxStyle.write(workbook, wopts);
            // blob
            that.templetBlob = new Blob([yunj.str_to_array_buffer(wbout)], {type: "application/octet-stream"});
        }

        // 获取模板blob
        _getTempletBlob() {
            let that = this;
            if (!that.templetBlob) that._setTempletBlob();
            return that.templetBlob;
        }

        // 模板下载
        _templetDownload() {
            let that = this;
            let templetName = `${that.importId}模板.xlsx`;
            // 判断是否设置有下载模板有则下载模板
            if (that.isSetTemplet()) {
                yunj.download(that.importObj.rawArgs.templet, templetName);
                return;
            }
            if (!that.isSetCols()) {
                yunj.alert(`导入[${that.importId}]未设置[cols]`);
                return;
            }
            yunj.download({name: templetName, blob: that._getTempletBlob()});
        }

        // 设置上传文件
        _setUploadFile(file = null) {
            let that = this;
            let filePreviewEl = that.contentBoxEl.find('.file-upload-box .file-preview');
            if (file) {
                filePreviewEl.html(`<div class="item"><span class="name">${file.name}</span><i class="layui-icon layui-icon-close-fill remove" title="删除文件：${file.name}"></i></div>`).css("display", "flex");
                that.uploadFile = file;
            } else {
                // 清除本地文件缓存等...
                filePreviewEl.hide();
                that.uploadFile = null;
                that.layUploadObj && that.layUploadObj.reload();
            }
        }

        // 上传事件绑定
        _uploadEventBind() {
            let that = this;
            that.layUploadObj = upload.render({
                elem: `#yunj_import_${that.importId} .file-upload-box .file-drag`,
                accept: 'file',
                auto: false,
                choose: function (obj) {
                    if (!that.isSetCols()) {
                        yunj.alert(`导入[${that.importId}]未设置[cols]`);
                        return;
                    }
                    //将每次选择的文件追加到文件队列
                    obj.pushFile();
                    //预读本地文件，如果是多文件，则会遍历。
                    obj.preview(function (index, file, result) {
                        // 判断文件格式
                        if (!yunj.isCsv(file) && !yunj.isXlsx(file) && !yunj.isXls(file)) {
                            yunj.msg('上传文件格式需为：xlsx/xls/csv');
                            return false;
                        }
                        that._setUploadFile(file);
                    });
                    // 清空历史上传文件，解决选择同一文件choose只执行一次问题
                    that.layUploadObj.config.elem.next()[0].value = "";
                }
            });
        }

        setEventBind() {
            let that = this;

            that.contentBoxEl.on("click", ".yunj-btn-templet-download", function (e) {
                that._templetDownload();
                e.stopPropagation();
            });

            that.contentBoxEl.on("click", ".file-upload-box .remove", function (e) {
                that._setUploadFile();
                e.stopPropagation();
            });

        }

    }

    exports('ImportStepOne', ImportStepOne);
});
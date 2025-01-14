/**
 * TableColFile
 */
layui.define(['TableColTemplet', 'jquery', 'yunj'], function (exports) {

    let TableColTemplet = layui.TableColTemplet;
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class TableColFile extends TableColTemplet {

        constructor(options) {
            super(options);
        }

        layout() {
            let that = this;
            return `{{# 
                         let urls = d.${that.key};
                         if(yunj.isString(urls)&&urls.length>0) 
                            urls = yunj.isJson(urls)?JSON.parse(urls):(urls.indexOf(",")!==-1?urls.split(","):[urls]);
                         if(!yunj.isArray(urls)) urls = [];
                    }}
                    {{#  if(d.is_export){  }}
                            {{urls.join(',')}}
                    {{#  }else{  }}
                            {{#  for(let i=0,l=urls.length;i<l;i++){  }}
                                    {{#  let url=urls[i];  }}
                                    {{#  let text=yunj.urlFileName(url);  }}
                                    <a class="table-row-file-item" href="javascript:void(0);" title="点击下载" data-url="{{ url }}">{{ text }}</a>
                            {{#  }  }}
                    {{#  }  }}`;
        }

        defineExtraEventBind() {
            let that = this;

            // 防止重复绑定事件
            if (yunj.isUndefined(win.TABLE_ROW_FILE_ITEM_CLICK_DOWNLOAD_EVENT_BIND)) {
                win.TABLE_ROW_FILE_ITEM_CLICK_DOWNLOAD_EVENT_BIND = true;
                $(doc).on('click', '.table-row-file-item', function (e) {
                    let aEl = $(this);
                    let url = aEl.data('url');
                    if (url.length > 0) {
                        let name = yunj.urlFileName(url);
                        yunj.confirm(`确认下载文件：${name}？`, () => {
                            yunj.download(url);
                        });
                    }
                    e.stopPropagation();
                });
            }
        }

    }

    exports('TableColFile', TableColFile);
});
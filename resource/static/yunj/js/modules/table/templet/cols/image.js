/**
 * TableColImage
 */
layui.define(['TableColTemplet','jquery','yunj'], function (exports) {

    let TableColTemplet = layui.TableColTemplet;
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class TableColImage extends TableColTemplet{

        constructor(options) {
            super(options);
        }

        layout(){
            let that=this;
            return `{{# 
                         let srcArr = d.${that.key};
                         if(yunj.isString(srcArr)&&srcArr.length>0) 
                            srcArr = yunj.isJson(srcArr)?JSON.parse(srcArr):(srcArr.indexOf(",")!==-1?srcArr.split(","):[srcArr]);
                         if(!yunj.isArray(srcArr)) srcArr = [];
                         let imgOnrrror = yunj.defaultImageAttrOnerror();
                     }}
                    {{#  if(d.is_export){  }}
                            {{srcArr.join(',')}}
                    {{#  }else{  }}
                            {{# for(let i = 0,l = srcArr.length;i < l;i++){ }}
                                <img class="table-row-image-item" src="{{ srcArr[i] }}" alt="" title="点击预览" {{- imgOnrrror }}>
                            {{# } }}
                    {{#  }  }}`;
        }

        defineExtraEventBind(){
            let that=this;

            // 防止重复绑定事件
            if(yunj.isUndefined(win.TABLE_ROW_IMAGE_ITEM_CLICK_PREVIEW_EVENT_BIND)){
                win.TABLE_ROW_IMAGE_ITEM_CLICK_PREVIEW_EVENT_BIND = true;
                $(doc).on('click','.table-row-image-item',function (e) {
                    let currItemEl=$(this);
                    let srcArr=[];
                    currItemEl.parent().find('.table-row-image-item').each(function () {
                        srcArr.push($(this).attr('src'));
                    });
                    if(srcArr.length<=0) return false;
                    let idx=srcArr.indexOf(currItemEl.attr('src'));
                    if(idx===-1) idx=0;
                    yunj.previewImg(srcArr,idx);
                    e.stopPropagation();
                });
            }

        }

    }

    exports('TableColImage', TableColImage);
});
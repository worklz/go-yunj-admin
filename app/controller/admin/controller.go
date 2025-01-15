package admin

import (
	"yunj/app/controller"
	"yunj/pkg/global"
	"yunj/pkg/response"

	"github.com/gin-gonic/gin"
)

type Controller struct {
	controller.Controller
}

// 模板渲染
// @Param  path  string  模板路径
// @Param  data  map[string]interface{}  渲染数据
func (ctrl *Controller) Render(ctx *gin.Context, path string, data ...map[string]interface{}) {
	// 设置公共参数
	ctrl.SetCommonData()
	// 处理传入参数
	if len(data) > 0 {
		ctrl.Assign(data[0])
	}
	// 模板渲染
	response.Render(ctx, "admin/"+path, ctrl.Data)
}

// 设置公共参数
func (ctrl *Controller) SetCommonData() {
	ctrl.Assign(map[string]interface{}{
		// 版本
		"version": global.Config.App.Version,
	})
}

package admin

import (
	"yunj/pkg/global"

	"github.com/gin-gonic/gin"
)

type Index struct {
	Controller
}

// 首页
func (ctrl *Index) Index(c *gin.Context) {
	data := map[string]interface{}{
		"appName": global.Config.App.Name,
	}
	ctrl.Render(c, "index/index", data)
}

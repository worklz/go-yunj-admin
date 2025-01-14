package admin

import (
	"github.com/gin-gonic/gin"
)

type Index struct {
	Controller
}

// 首页
func (ctrl *Index) Index(c *gin.Context) {
	data := map[string]interface{}{}
	ctrl.Render(c, "index/index", data)
}

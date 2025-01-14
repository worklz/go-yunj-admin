package response

import (
	"net/http"

	"github.com/flosch/pongo2"
	"github.com/gin-gonic/gin"
)

// 渲染html页面
// @Param path string	模板文件路径
func RenderHtml(ctx *gin.Context, path string, data interface{}) {
	ctx.HTML(http.StatusOK, path, pongo2.Context{
		"data": data,
	})
}

// 渲染html页面
// @Param path string	模板文件路径
func Render(ctx *gin.Context, path string, data interface{}) {
	fullPath := path + ".html"
	RenderHtml(ctx, fullPath, data)
}

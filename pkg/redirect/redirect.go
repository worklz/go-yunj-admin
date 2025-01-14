package redirect

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// 302临时重定向
// 注意：301是永久重定向，会在浏览器进行缓存
func To(c *gin.Context, url string) {
	c.Redirect(http.StatusFound, url)
}

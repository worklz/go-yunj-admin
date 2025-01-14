package router

import (
	"github.com/gin-gonic/gin"
)

// 后台路由
func AdminRouter(router *gin.Engine) {

	// r := router.Group("")
	// {
	// 	// 首页
	// 	indexController := blog.Index{}
	// 	r.GET("/", indexController.Index)
	// 	// 错误页
	// 	ErrorController := blog.Error{}
	// 	r.Any("/error", ErrorController.Index)
	// 	// 关于我们
	// 	AboutUsController := blog.AboutUs{}
	// 	r.GET("/about-us", AboutUsController.Index)
	// 	// 分类页
	// 	CategoryController := blog.Category{}
	// 	r.GET("/category", CategoryController.Index)
	// 	r.GET("/category/:id", CategoryController.Index)
	// 	// 搜索页
	// 	SearchController := blog.Search{}
	// 	r.GET("/search", SearchController.Index)
	// 	// 文章详情页
	// 	ArticleController := blog.Article{}
	// 	r.GET("/article/:id", ArticleController.Detail)

	// 	// API
	// 	apiRouter := router.Group("/blog/api")
	// 	{
	// 		// 文章列表查询
	// 		apiArticleController := api.Article{}
	// 		apiRouter.POST("/article/list", apiArticleController.List)
	// 		// guid
	// 		apiGuidController := api.Guid{}
	// 		apiRouter.POST("/guid/check", apiGuidController.Check)
	// 		apiRouter.POST("/guid/valid", apiGuidController.Valid)
	// 		// log
	// 		apiLogController := api.Log{}
	// 		apiRouter.POST("/log/record", apiLogController.Record)
	// 	}
	// }

}

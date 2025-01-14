package middleware

import (
	"os"
	"strings"
	"time"

	"yunj/pkg/global"
	"yunj/pkg/request"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// 日志记录
func Log() gin.HandlerFunc {

	return func(ctx *gin.Context) {
		startTime := time.Now()
		ctx.Next()
		endTime := time.Now()
		// 判断是否静态文件请求，静态文件请求不记录日志
		uri := ctx.Request.RequestURI
		if strings.HasPrefix(uri, "/static/") || strings.HasPrefix(uri, "/upload/") || uri == "/favicon.ico" {
			return
		}

		// 计算请求耗时
		latency := endTime.Sub(startTime)
		hostName, err := os.Hostname()
		if err != nil {
			hostName = "unknown"
		}
		statusCode := ctx.Writer.Status()
		clientIp := ctx.ClientIP()
		dataSize := ctx.Writer.Size()
		if dataSize < 0 {
			dataSize = 0
		}
		// 请求method
		method := ctx.Request.Method
		// 所有请求参数
		params, _ := request.GetAllParams(ctx)
		// 日志数据
		logData := logrus.Fields{
			"host_name":   hostName,
			"status_code": statusCode,
			"latency":     latency.String(),
			"ip":          clientIp,
			"uri":         uri,
			"method":      method,
			"params":      params,
		}
		// 系统错误
		if len(ctx.Errors) > 0 {
			logData["Error"] = ctx.Errors.ByType(gin.ErrorTypePrivate).String()
		}
		// 发送队列
		// queryLogData := logData
		// queryLogData["user_agent"] = ctx.Request.UserAgent()
		// err = queue.Push(&jobs.Logger{}, queryLogData)
		// if err != nil {
		// 	global.Logger.Error("队列推送失败！", err)
		// } else {
		// 	global.Logger.Info("队列推送成功")
		// }
		// 日志实体
		logEntry := global.Logger.WithFields(logData)
		if statusCode >= 500 {
			logEntry.Error()
		} else if statusCode >= 400 {
			logEntry.Warn()
		} else {
			logEntry.Info()
		}

	}
}

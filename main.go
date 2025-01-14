package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "yunj/pkg/boot"
	"yunj/pkg/global"
	"yunj/pkg/shutdown"
	"yunj/router"
)

func main() {
	// 创建通道监听操作系统信号
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// 启动http服务器
	router := router.InitRouter()
	server := &http.Server{
		Addr:    global.Config.App.Port,
		Handler: router,
	}

	// 启动http服务器
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			global.Logger.WithError(err).Error("启动http服务异常！")
		}
	}()

	// 等待关闭信号
	<-quit

	// 优雅关闭服务器
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer func() {
		cancel()
		global.Logger.Info("关闭服务成功！")
	}()

	if err := server.Shutdown(ctx); err != nil {
		global.Logger.WithError(err).Error("关闭http服务异常！")
	}

	// 关闭处理
	shutdown.Handle()
}

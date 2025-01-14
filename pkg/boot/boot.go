package boot

import (
	"fmt"
	"time"
)

// 启动处理
func init() {
	// 设置时区
	timelocal, err := time.LoadLocation("Asia/Shanghai")
	if err != nil {
		panic(fmt.Errorf("时区设置错误！%v", err))
	}
	time.Local = timelocal
	// 初始化配置
	InitConfig()
	// 初始化日志
	InitLogger()
	// 初始化数据库连接
	InitDb()
	// 初始化Redis连接
	InitRedis()
	// 初始化验证器
	InitValidator()
	// 启动定时任务
	InitCorn()
	// 启动队列工作调度器
	InitQueueJobs()
}

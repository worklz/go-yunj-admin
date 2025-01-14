package boot

import (
	"context"
	"fmt"

	"yunj/app/corn/config"
	"yunj/pkg/global"

	"github.com/robfig/cron/v3"
)

// 启动定时任务
func InitCorn() {
	c := cron.New(cron.WithSeconds())

	// 添加任务
	var err error
	for _, taskItem := range config.TaskItems {
		// 判断是否启用
		if !taskItem.Enable {
			continue
		}
		task := taskItem.Task // 任务
		logPrefix := "定时任务[" + task.Name() + "]"
		_, err = c.AddFunc(taskItem.Spec, func() {
			global.Logger.Info(logPrefix, "执行开始！")
			ctx, cancel := context.WithTimeout(context.Background(), task.Timeout())
			defer cancel()
			done := make(chan bool)
			errChan := make(chan error)

			go func(ctx context.Context) {
				defer func() {
					if err := recover(); err != nil {
						errChan <- fmt.Errorf("panic: %v", err)
					}
				}()
				select {
				case <-ctx.Done():
					errChan <- fmt.Errorf("执行超时！")
					return
				default:
					task.Handler()
					//panic("测试异常")
					done <- true
				}
			}(ctx)

			select {
			case err := <-errChan:
				global.Logger.WithError(err).Error(logPrefix, "执行异常！")
			case <-done:
				global.Logger.Info(logPrefix, "执行完成！")
			}
		})
		if err != nil {
			global.Logger.WithError(err).Error(logPrefix, "异常！")
		}
	}

	// 启动cron调度器
	c.Start()

	global.Corn = c
}

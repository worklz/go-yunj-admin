package corn

import "time"

// 任务项
type TaskItem struct {
	Enable bool          // 是否启用
	Spec   string        // 任务执行时间 - cron表达式
	Task   TaskInterface // 任务
}

// 任务接口
type TaskInterface interface {
	Name() string           // 任务名称
	Timeout() time.Duration // 任务超时时间
	Handler()               // 任务处理函数
}

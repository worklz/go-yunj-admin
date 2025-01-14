package corn

import (
	"fmt"
	"time"

	appQueue "yunj/app/queue"
	"yunj/pkg/queue"
)

// 实现TaskInterface接口
type Tests struct{}

// 名称
func (t *Tests) Name() string {
	return "测试任务"
}

// 超时时间
func (t *Tests) Timeout() time.Duration {
	return 10 * time.Second
}

// 任务处理函数
func (t *Tests) Handler() {
	fmt.Println("测试定时任务执行中...")
	err := queue.New(&appQueue.Tests{}).Push("测试消息123")
	if err != nil {
		fmt.Println("测试队列消息推送异常：", err)
	}
	time.Sleep(2 * time.Second)
}

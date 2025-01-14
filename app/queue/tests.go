package queue

import (
	"fmt"
	"time"

	"yunj/pkg/queue"
)

// 实现QueueInterface接口
type Tests struct {
	queue.BaseQueue
}

// 队列名称
func (t *Tests) Queue() string {
	return "tests"
}

// 队列描述
func (t *Tests) Desc() string {
	return "测试队列"
}

// 开启的协程数量
func (t *Tests) CoroutineNum() int {
	return 1
}

// 每次获取消费的消息数量
func (t *Tests) MessageNum() int {
	return 100
}

// 消息消费处理超时时间
func (t *Tests) Timeout() time.Duration {
	return 10 * time.Second
}

// 消息消费处理函数
func (t *Tests) Handler(messages []string) {
	fmt.Println("测试队列消费中...", messages)
}

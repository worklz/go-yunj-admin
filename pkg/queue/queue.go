package queue

import (
	"errors"
	"fmt"
	"time"

	"yunj/pkg/redis"
	"yunj/pkg/util"
)

// 队列工作
type Job struct {
	Enable bool
	Queue  QueueInterface
}

// 队列接口
type QueueInterface interface {
	Queue() string          // 队列名称
	Desc() string           // 队列描述
	CoroutineNum() int      // 开启的协程数量
	MessageNum() int        // 每次获取消费的消息数量
	Timeout() time.Duration // 消息消费处理超时时间
	Handler([]string)       // 消息消费处理函数
}

// 队列
type BaseQueue struct {
	Queue QueueInterface
}

// 初始化一个队列
func New(queue QueueInterface) *BaseQueue {
	return &BaseQueue{Queue: queue}
}

// 日志前缀
func LogPrefix(queue QueueInterface) string {
	return fmt.Sprintf("队列[%s][%s]", queue.Desc(), queue.Queue())
}

// 队列消息推送
// 示例：queue.New(&queue.Tests{}).Push()
func (q *BaseQueue) Push(message any) error {
	queue := q.Queue.Queue()
	if queue == "" {
		return errors.New("队列消息推送未指定队列（未定义队列名称）")
	}
	if _, isStr := message.(string); !isStr {
		msg, err := util.ToJson(message)
		if err != nil {
			return err
		}
		message = msg
	}
	err := redis.LPush(queue, message)
	if err != nil {
		return fmt.Errorf("队列消息推送异常！%v", err)
	}
	return nil
}

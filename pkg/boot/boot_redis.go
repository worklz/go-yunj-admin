package boot

import (
	"fmt"
	"time"

	"yunj/pkg/global"

	"github.com/gomodule/redigo/redis"
)

// 初始化Redis连接
func InitRedis() {
	global.Redis = &redis.Pool{
		MaxIdle:     global.Config.Redis.MaxIdle,                   // 连接池中最大的空闲连接数
		MaxActive:   global.Config.Redis.MaxActive,                 // 连接池中最大的活动连接数
		IdleTimeout: global.Config.Redis.IdleTimeout * time.Second, // 空闲连接的超时时间
		Dial: func() (redis.Conn, error) {
			addr := fmt.Sprintf("%s:%s", global.Config.Redis.Host, global.Config.Redis.Port)
			conn, err := redis.Dial("tcp", addr)
			if err != nil {
				return nil, err
			}
			// 校验密码
			if global.Config.Redis.Password != "" {
				if _, err := conn.Do("AUTH", global.Config.Redis.Password); err != nil {
					conn.Close()
					return nil, err
				}
			}
			// 选择数据库
			if _, err := conn.Do("SELECT", global.Config.Redis.DB); err != nil {
				conn.Close()
				return nil, err
			}
			return conn, err
		},
		TestOnBorrow: func(conn redis.Conn, t time.Time) error {
			_, err := conn.Do("PING")
			return err
		},
	}
}

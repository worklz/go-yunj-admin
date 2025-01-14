package redis

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"yunj/pkg/global"
	"yunj/pkg/util"

	"github.com/gomodule/redigo/redis"
)

// 获取redis key完整名称
func FullKey(key string) string {
	prefix := global.Config.Redis.Prefix
	if strings.HasPrefix(key, prefix) {
		return key
	} else {
		return fmt.Sprintf("%s%s", prefix, key)
	}
}

// 是否存在
func Exists(key string) (bool, error) {
	conn := global.Redis.Get()
	defer conn.Close()

	key = FullKey(key)
	reply, err := conn.Do("EXISTS", key)
	exists, err := redis.Bool(reply, err)
	return exists, err
}

// 获取
// 若返回结果[]byte长度为0，也可认为无缓存值
func Get(key string) ([]byte, error) {
	conn := global.Redis.Get()
	defer conn.Close()

	key = FullKey(key)
	reply, err := conn.Do("GET", key)
	res, err := redis.Bytes(reply, err)
	return res, err
}

// 获取值为字符串类型结果
func GetString(key string) (string, error) {
	conn := global.Redis.Get()
	defer conn.Close()

	key = FullKey(key)
	reply, err := conn.Do("GET", key)
	res, err := redis.String(reply, err)
	return res, err
}

// 获取值为int64类型结果
func GetInt64(key string) (int64, error) {
	conn := global.Redis.Get()
	defer conn.Close()

	key = FullKey(key)
	reply, err := conn.Do("GET", key)
	res, err := redis.Int64(reply, err)
	return res, err
}

// 处理缓存结果
func handleCacheValue(val interface{}) (interface{}, error) {
	var (
		value interface{}
		err   error
		ok    bool
	)
	value, ok = val.(string)
	if !ok {
		value, ok = val.([]byte)
		if !ok {
			value, err = json.Marshal(val)
			if err != nil {
				return nil, err
			}
		}
	}
	return value, err
}

// 设置
func Set(key string, val interface{}) error {
	conn := global.Redis.Get()
	defer conn.Close()

	value, err := handleCacheValue(val)
	if err != nil {
		return err
	}
	key = FullKey(key)
	// fmt.Println("key:", key)
	// fmt.Println("value:", value)
	_, err = conn.Do("SET", key, value)
	if err != nil {
		return err
	}
	return nil
}

// 设置并设置有效时间
func SetEx(key string, expire int, val interface{}) error {
	conn := global.Redis.Get()
	defer conn.Close()

	value, err := handleCacheValue(val)
	if err != nil {
		return err
	}
	key = FullKey(key)
	_, err = conn.Do("SETEX", key, expire, value)
	return err
}

// 删除
// 可以传入string、[]string
func Del(key ...interface{}) error {
	conn := global.Redis.Get()
	defer conn.Close()

	keys := []string{}
	if len(key) <= 0 {
		return nil
	} else if len(key) == 1 {
		if keyStr, ok := key[0].(string); ok {
			keys = append(keys, keyStr)
		} else if keyArr, ok := key[0].([]string); ok {
			keys = keyArr
		} else {
			return errors.New("参数错误")
		}
	} else {
		for _, v := range key {
			if !util.IsScalar(v) {
				return errors.New("传入参数类型错误")
			}
			if keyStr, ok := v.(string); ok {
				keys = append(keys, keyStr)
			}
		}
	}

	delKeys := make([]interface{}, len(keys))
	for k, v := range keys {
		fmt.Println("v:", k, FullKey(v))
		delKeys[k] = FullKey(v)
	}

	if _, err := conn.Do("DEL", delKeys...); err != nil {
		return err
	}
	return nil
}

// 设置过期时间
// @Param expire 秒，小等于0则执行删除
func Expire(key string, expire int) error {
	conn := global.Redis.Get()
	defer conn.Close()

	key = FullKey(key)

	if expire > 0 {
		if _, err := conn.Do("EXPIRE", key, expire); err != nil {
			return err
		}
	} else {
		if err := Del(key); err != nil {
			return err
		}
	}
	return nil
}

// 获取匹配的所有key
// 调用示例：Keys("article:*")、Keys("article:*:*")、Keys("*article:*")
func Keys(pattern string) ([]string, error) {
	conn := global.Redis.Get()
	defer conn.Close()

	// 使用 SCAN 命令迭代匹配键
	var cursor int64 = 0
	var keys []string

	pattern = FullKey(pattern)
	for {
		// 发送 SCAN 命令
		args := redis.Args{}.Add(cursor).Add("MATCH", pattern).Add("COUNT", 1000) // 每次扫描1000条
		reply, err := conn.Do("SCAN", args...)
		res, err := redis.Values(reply, err)
		if err != nil {
			return nil, err
		}

		// 解析回复
		var newCursor int64
		var keySlice []string
		if _, err := redis.Scan(res, &newCursor, &keySlice); err != nil {
			return nil, err
		}

		// 追加匹配的键
		keys = append(keys, keySlice...)
		// 如果游标没有变化，表示扫描完成
		if cursor == newCursor {
			break
		}
		cursor = newCursor
	}

	return keys, nil
}

// 入队
func LPush(key string, values ...any) error {
	conn := global.Redis.Get()
	defer conn.Close()

	key = FullKey(key)
	args := util.SlicePrepend(values, key)
	if _, err := conn.Do("LPUSH", args...); err != nil {
		return err
	}
	return nil
}

// 出队
func RPop(key string) (string, error) {
	conn := global.Redis.Get()
	defer conn.Close()

	key = FullKey(key)
	reply, err := conn.Do("RPOP", key)
	result, err := redis.String(reply, err)
	if err != nil && !errors.Is(err, redis.ErrNil) {
		return "", err
	}
	return result, nil
}

// 递增
func Incr(key string) (int, error) {
	conn := global.Redis.Get()
	defer conn.Close()

	key = FullKey(key)
	reply, err := conn.Do("INCR", key)
	result, err := redis.Int(reply, err)
	if err != nil {
		return 0, err
	}
	return result, nil
}

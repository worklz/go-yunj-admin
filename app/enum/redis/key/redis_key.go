package key

import (
	"errors"
	"fmt"
	"strconv"

	"yunj/pkg/redis"
	"yunj/pkg/util"
)

type RedisKey struct {
	Value RedisKeyConst // 值
	Args  interface{}   // 参数
}

// 创建一个RedisKey
func New(value RedisKeyConst) *RedisKey {
	return &RedisKey{Value: value}
}

// 获取string类型的value
func (rk *RedisKey) StringValue() string {
	return string(rk.Value)
}

// 设置参数集合
func (rk *RedisKey) SetArgs(args interface{}) *RedisKey {
	rk.Args = args
	return rk
}

// 获取传入的参数
// 如要获取全部的args参数：GetArgs()
// 要获取指定参数：GetArgs("location")
func (rk *RedisKey) GetArgs(param ...interface{}) (interface{}, error) {
	getArgs, exists := AllConstGetArgs[rk.Value]
	if exists {
		return getArgs(rk, param...)
	}
	return rk.Args, nil
}

// 获取某一属性值
func (rk *RedisKey) GetAttr(attr string) interface{} {
	attrs, exists := AllConstAttrs[rk.Value]
	if !exists {
		return nil
	}
	rkAttrs, ok := attrs.(map[string]interface{})
	if !ok {
		return nil
	}
	attrValue, exists := rkAttrs[attr]
	if !exists {
		return nil
	}
	return attrValue
}

// 获取描述
func (rk *RedisKey) GetDesc() string {
	desc := rk.GetAttr("desc")
	if desc == nil {
		return ""
	}
	descStr, _ := util.ToString(desc)
	return descStr
}

// 判断是否key后缀合法的配置定义，如果合法则返回对应的keySuffixFunc和true，否则返回nil和false
func CheckKeySubffix(keySuffix interface{}) (func(*RedisKey) (string, error), bool) {
	keySuffixFunc, ok := keySuffix.(func(*RedisKey) (string, error))
	if !ok {
		return nil, false
	} else {
		return keySuffixFunc, true
	}
}

// 获取key
func (rk *RedisKey) GetKey() (string, error) {
	key := rk.StringValue()
	keySuffix := rk.GetAttr("keySuffix")
	if keySuffix == nil {
		return key, nil
	}
	keySuffixFunc, ok := CheckKeySubffix(keySuffix)
	if !ok {
		return "", errors.New("keySuffix配置异常")
	}
	keySuffix, err := keySuffixFunc(rk)
	if err != nil {
		return "", err
	}
	key = fmt.Sprintf("%s%s", key, keySuffix)
	return key, nil
}

// 获取缓存结果
// ttl表示过期时间。-1 => 永不过期；0 => 随机1-2天过期（详见SetCache）
// 示例：key.New(key.TEST).SetArgs(map[string]interface{}{"id": 1}).GetCache(600)
func (rk *RedisKey) GetCache(ttl int) ([]byte, error) {
	var (
		res []byte
		err error
	)
	key, err := rk.GetKey()
	if err != nil {
		return []byte{}, err
	}
	res, _ = redis.Get(key)
	// 缓存存在，重新设置过期时间后返回
	if len(res) > 0 {
		rk.SetCache(res, ttl)
		return res, nil
	}
	// 缓存不存在
	valueCall := rk.GetAttr("value")
	// 没有配置原始值获取方式则返回空
	if valueCall == nil {
		return []byte{}, nil
	}
	// 获取原始值
	valueFunc, ok := valueCall.(func(*RedisKey) (interface{}, error))
	if !ok {
		return []byte{}, errors.New("原始值获取配置异常")
	}
	rawValue, err := valueFunc(rk)
	if err != nil {
		return []byte{}, nil
	}
	// 设置缓存
	rk.SetCache(rawValue, ttl)
	// 重新获取缓存
	res, err = redis.Get(key)
	return res, err
}

// 获取缓存结果为string
// 示例：key.New(key.TEST).SetArgs(map[string]interface{}{"id": 1}).GetCacheString(600)
func (rk *RedisKey) GetCacheString(ttl int) (string, error) {
	res, err := rk.GetCache(ttl)
	if err != nil {
		return "", err
	}
	return string(res), nil
}

// 获取缓存结果为int
// 示例：key.New(key.TEST).SetArgs(map[string]interface{}{"id": 1}).GetCacheInt(600)
func (rk *RedisKey) GetCacheInt(ttl int) (int, error) {
	reply, err := rk.GetCache(ttl)
	if err != nil {
		return 0, err
	}
	res, err := strconv.Atoi(string(reply))
	return res, err
}

// 获取缓存结果为int64
// 示例：key.New(key.TEST).SetArgs(map[string]interface{}{"id": 1}).GetCacheInt64(600)
func (rk *RedisKey) GetCacheInt64(ttl int) (int64, error) {
	reply, err := rk.GetCache(ttl)
	if err != nil {
		return 0, err
	}
	res, err := strconv.ParseInt(string(reply), 10, 64)
	return res, err
}

// 设置缓存
// ttl表示过期时间。-1 => 永不过期；0 => 随机1-2天过期
func (rk *RedisKey) SetCache(value interface{}, ttl int) error {
	var err error
	if ttl < -1 {
		return err
	}
	key, err := rk.GetKey()
	if err != nil {
		return err
	}
	expire := ttl
	if ttl == -1 {
		// 永不过期
		err = redis.Set(key, value)
	} else if ttl == 0 {
		// 随机1-2天过期
		expire = util.RandomInt(86400, 172800)
		err = redis.SetEx(key, expire, value)
	} else {
		err = redis.SetEx(key, expire, value)
	}
	return err
}

// 自增缓存
func (rk *RedisKey) IncrCache() (int, error) {
	key, err := rk.GetKey()
	if err != nil {
		return 0, err
	}
	res, err := redis.Incr(key)
	return res, err
}

// 删除缓存
// @Param all bool 是否删除所有
func (rk *RedisKey) DelCache(all ...bool) error {
	keys := []string{}
	var err error
	// 获取要删除的key
	// 判断是否要删除所有，主要是针对有变量后缀的情况
	if len(all) > 0 && all[0] {
		if keySuffix := rk.GetAttr("keySuffix"); keySuffix != nil {
			if _, ok := keySuffix.(func(*RedisKey) (string, error)); ok {
				// 获取满足条件的所有key
				keys, err = redis.Keys(rk.StringValue())
				if err != nil {
					return err
				}
			}
		}
	}
	if len(keys) <= 0 {
		// 只删除当前key
		key, err := rk.GetKey()
		if err != nil {
			return err
		}
		keys = append(keys, key)
	}
	return redis.Del(keys)
}

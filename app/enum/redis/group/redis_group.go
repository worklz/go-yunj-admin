package group

import (
	"fmt"

	"yunj/app/enum/redis/key"
	"yunj/pkg/redis"
)

type RedisGroup struct {
	Value RedisGroupConst // 值
}

// 创建一个RedisGroup
func New(value RedisGroupConst) *RedisGroup {
	return &RedisGroup{Value: value}
}

// 获取某一属性值
func (rk *RedisGroup) GetAttr(attr string) interface{} {
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

// 删除缓存
// 示例：group.New(group.ARTICLE).DelCache()
func (rg *RedisGroup) DelCache() error {
	allKeys := []string{}
	// 获取当前分组的所有redis key常量
	allRedisKeyConsts := rg.GetAllRedisKeyConsts()
	for _, keyConst := range allRedisKeyConsts {
		redisKey := key.New(keyConst)
		keySuffix := redisKey.GetAttr("keySuffix")
		if _, ok := key.CheckKeySubffix(keySuffix); ok {
			// 有后缀的
			pattern := fmt.Sprintf("%s*", redisKey.StringValue())
			fmt.Println("pattern", pattern)
			keys, err := redis.Keys(pattern)
			fmt.Println("pattern res", keys, err)
			fmt.Printf("Error: %+v\n", err)
			if err != nil {
				return err
			}
			allKeys = append(allKeys, keys...)
		} else {
			// 没有后缀的
			allKeys = append(allKeys, redisKey.StringValue())
		}
	}
	// 进行删除
	return redis.Del(allKeys)
}

// 获取当前分组的所有redis key常量
func (rg *RedisGroup) GetAllRedisKeyConsts() []key.RedisKeyConst {
	allRedisKeyConsts := []key.RedisKeyConst{}
	allRedisKeyConsts = rg.handleAllRedisKeyConsts(rg.Value, allRedisKeyConsts)
	return allRedisKeyConsts
}

// 处理指定分组的所有keys，合并到总的keys内
// aooend会产生一个新切片，所以此处要用返回接收接片结果
func (rg *RedisGroup) handleAllRedisKeyConsts(group RedisGroupConst, allRedisKeyConsts []key.RedisKeyConst) []key.RedisKeyConst {
	attrs, exists := AllConstAttrs[group]
	if !exists {
		return allRedisKeyConsts
	}
	rgAttrs, ok := attrs.(map[string]interface{})
	if !ok {
		return allRedisKeyConsts
	}
	if rgKeys, exists := rgAttrs["keys"]; exists {
		if keys, ok := rgKeys.([]key.RedisKeyConst); ok {
			allRedisKeyConsts = append(allRedisKeyConsts, keys...)
		}
	}
	// 遍历parent
	if rgParent, exists := rgAttrs["parent"]; exists {
		if parent, ok := rgParent.(RedisGroupConst); ok {
			return rg.handleAllRedisKeyConsts(parent, allRedisKeyConsts)
		}
	}
	return allRedisKeyConsts
}

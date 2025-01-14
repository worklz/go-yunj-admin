package util

import (
	"fmt"
	"reflect"
)

// 获取结构体属性值，根据json标签
func GetStructPropValueByJsonTag(v any, jsonTag string) (any, error) {
	val := reflect.ValueOf(v)
	t := reflect.TypeOf(v)
	// 如果传入的是指针，获取指针指向的值
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
	}
	// 判断是否是结构体类型
	if t.Kind() != reflect.Struct {
		return nil, fmt.Errorf("GetStructPropValueByJsonTag: %v is not a struct", val.Type())
	}

	if jsonTag == "" {
		return nil, fmt.Errorf("GetStructPropValueByJsonTag: jsonTag is empty")
	}

	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		fieldJsonTag := field.Tag.Get("json")
		if fieldJsonTag == jsonTag {
			return val.Field(i).Interface(), nil
		}
		// 如果字段是嵌套结构体，递归处理
		if field.Type.Kind() == reflect.Struct {
			res, err := GetStructPropValueByJsonTag(val.Field(i).Interface(), jsonTag)
			if err != nil {
				return nil, err
			}
			if res != nil {
				return res, nil
			}
		}
	}

	return nil, nil
}

package util

import (
	"fmt"
	"reflect"
	"regexp"
	"strconv"
	"strings"
)

// 其他类型转换为字符串
func ToString(value interface{}) (string, error) {
	// 使用反射来判断值的类型，并相应地转换为字符串
	switch v := reflect.ValueOf(value); v.Kind() {
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return strconv.FormatInt(v.Int(), 10), nil
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		return strconv.FormatUint(v.Uint(), 10), nil
	case reflect.Float32, reflect.Float64:
		return strconv.FormatFloat(v.Float(), 'f', -1, 64), nil
	case reflect.Bool:
		return strconv.FormatBool(v.Bool()), nil
	case reflect.String:
		return v.String(), nil
	// 可以根据需要添加更多的类型处理
	default:
		// 对于不支持的类型，可以返回错误或者使用一个默认的字符串表示
		// 这里选择返回错误
		return "", fmt.Errorf("unsupported type: %s", v.Type())
	}
}

// 字符串转换为int64
func StringToInt64(str string) (int64, error) {
	if str == "" {
		return 0, nil
	}
	num, err := strconv.ParseInt(str, 10, 64)
	if err != nil {
		return 0, err
	}
	return num, nil
}

// 大写格式转换为下划线分割（兼容首字母大小写情况）
func UppercaseToUnderline(str string) string {
	re := regexp.MustCompile(`([a-z])([A-Z])`)
	result := re.ReplaceAllStringFunc(str, func(s string) string {
		return s[:1] + "_" + strings.ToLower(s[1:])
	})
	return result
}

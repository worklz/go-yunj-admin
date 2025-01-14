package util

import "reflect"

// 判断是否是标量类型
// 如：数字、布尔、字符串类型
func IsScalar(value interface{}) bool {
	switch value.(type) {
	case int, int8, int16, int32, int64, uint, uint8, uint16, uint32, uint64, uintptr, float32, float64, bool, string:
		return true
	default:
		return false
	}
}

// 判断是否为整形
func IsInt(value interface{}) bool {
	// 获取变量的类型
	t := reflect.TypeOf(value)
	// reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64, reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64, reflect.Uintptr
	switch t.Kind() {
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64,
		reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64, reflect.Uintptr:
		return true
	default:
		return false
	}
}

// 判断是否为布尔类型
func IsBool(value interface{}) bool {
	// 获取变量的类型
	t := reflect.TypeOf(value)
	return t.Kind() == reflect.Bool
}

package boot

import (
	"regexp"

	"yunj/pkg/global"

	"github.com/go-playground/validator/v10"
)

// 初始化验证器
func InitValidator() {
	validate := validator.New()

	// 注册校验规则
	for name, rule := range customRules {
		validate.RegisterValidation(name, rule)
	}

	global.Validate = validate
}

// 自定义校验规则
var customRules = map[string]validator.Func{
	// 正整数校验
	"positiveInt": func(fl validator.FieldLevel) bool {
		if strVal, ok := fl.Field().Interface().(string); ok {
			if strVal == "" {
				return false
			}
			reg := regexp.MustCompile(`^[1-9]\d*$`)
			return reg.MatchString(strVal)
		}
		val, ok := fl.Field().Interface().(int64)
		if !ok {
			return false
		}
		if val <= 0 {
			return false
		}
		return true
	},
	// 非负整数校验
	"nonnegativeInt": func(fl validator.FieldLevel) bool {
		if strVal, ok := fl.Field().Interface().(string); ok {
			if strVal == "" {
				return false
			}
			reg := regexp.MustCompile(`^([1-9]\d*|0)$`)
			return reg.MatchString(strVal)
		}
		val, ok := fl.Field().Interface().(int64)
		if !ok {
			return false
		}
		if val < 0 {
			return false
		}
		return true
	},
	// 正整数切片校验
	"positiveIntSlice": func(fl validator.FieldLevel) bool {
		val, ok := fl.Field().Interface().([]int) // 此处[0].([]int64)不能正确断言，所以暂时用[]int断言
		if !ok {
			return false
		}
		for _, num := range val {
			if num <= 0 {
				return false
			}
		}
		return true
	},
	// 非负整数切片校验
	"nonnegativeIntSlice": func(fl validator.FieldLevel) bool {
		val, ok := fl.Field().Interface().([]int) // 此处[0].([]int64)不能正确断言，所以暂时用[]int断言
		if !ok {
			return false
		}
		for _, num := range val {
			if num < 0 {
				return false
			}
		}
		return true
	},
}

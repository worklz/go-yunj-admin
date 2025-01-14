package validate

import (
	"reflect"

	"github.com/go-playground/validator/v10"
)

func Message(params interface{}, err error) string {
	// 如果输入参数无效，则直接返回输入参数错误
	invalid, ok := err.(*validator.InvalidValidationError)
	if ok {
		return "输入参数错误：" + invalid.Error()
	}
	validationErrs := err.(validator.ValidationErrors)
	if len(validationErrs) == 0 {
		return "参数异常"
	}
	validationErr := validationErrs[0]
	// 获取是哪个字段不符合格式
	fieldName := validationErr.Field()
	typeOf := reflect.TypeOf(params)
	// 如果是指针，获取其属性
	if typeOf.Kind() == reflect.Ptr {
		typeOf = typeOf.Elem()
	}
	// 通过反射获取filed
	message := ""
	field, ok := typeOf.FieldByName(fieldName)
	if ok {
		// 获取field对应的message tag值，并返回错误
		message = field.Tag.Get("message")
	}
	if message == "" {
		message = validationErr.Error()
	}
	return message
}

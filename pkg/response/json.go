package response

import (
	"fmt"
	"net/http"

	"yunj/pkg/response/errcodes"
	"yunj/pkg/validate"

	"github.com/gin-gonic/gin"
)

// 错误码对应消息
func ErrcodeMsg(errcode errcodes.Errcode) string {
	if message, exists := errcodes.AllMsg[errcode]; exists {
		return message
	} else {
		return ""
	}
}

// 响应json数据
func Json(c *gin.Context, errcode errcodes.Errcode, msg string, data interface{}) {
	if msg == "" {
		msg = ErrcodeMsg(errcode)
	}
	c.JSON(http.StatusOK, gin.H{
		"errcode": errcode,
		"msg":     msg,
		"data":    data,
	})
}

// 响应成功的json数据
func Success(c *gin.Context, data interface{}, msg ...string) {
	message := ""
	if len(msg) > 0 {
		message = msg[0]
	}
	Json(c, errcodes.SUCCESS, message, data)
}

// 响应失败的json数据
func Fail(c *gin.Context, msg string, errcode ...errcodes.Errcode) {
	errcodeVal := errcodes.ERROR
	if len(errcode) > 0 {
		errcodeVal = errcode[0]
	}
	Json(c, errcodeVal, msg, nil)
}

// 响应验证失败的json数据
func ValidateFail(c *gin.Context, params interface{}, err error) {
	msg := validate.Message(params, err)
	fmt.Println("validate fail:", msg)
	Fail(c, msg)
}

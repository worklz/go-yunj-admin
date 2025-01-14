package controller

import (
	"errors"

	"yunj/pkg/response"
	"yunj/pkg/util"

	"github.com/gin-gonic/gin"
)

type Controller struct {
	Data map[string]interface{}
}

// 设置模板变量
// 参数可以是map[string]interface{} 也可以是key,value
// 如：ctrl.Assign(map[string]interface{}{"key":"value"}) 或者 ctrl.Assign("key","value")
func (ctrl *Controller) Assign(args ...interface{}) error {
	if ctrl.Data == nil {
		ctrl.Data = make(map[string]interface{})
	}
	if len(args) == 1 {
		data, ok := args[0].(map[string]interface{})
		if ok {
			for k, v := range data {
				ctrl.Data[k] = v
			}
			return nil
		}
	} else if len(args) == 2 {
		if key, err := util.ToString(args[0]); err != nil {
			return err
		} else {
			ctrl.Data[key] = args[1]
		}
		return nil
	}
	return errors.New("参数错误")
}

// 模板渲染
func (ctrl *Controller) Render(c *gin.Context, path string) {
	response.Render(c, path, c.Data)
}

package request

import (
	"encoding/json"
	"io"
	"strings"

	"github.com/gin-gonic/gin"
)

// 获取请求的所有参数
func GetAllParams(c *gin.Context) (map[string]interface{}, error) {
	params := make(map[string]interface{})

	// 获取 URL 查询参数
	query := c.Request.URL.Query()
	for key, values := range query {
		if len(values) == 1 {
			params[key] = values[0]
		} else {
			params[key] = values
		}
	}

	// 检查请求的内容类型
	contentType := c.Request.Header.Get("Content-Type")

	// 尝试从表单数据中获取参数（仅当内容类型为 application/x-www-form-urlencoded 或 multipart/form-data 时）
	if strings.HasPrefix(contentType, "application/x-www-form-urlencoded") || strings.HasPrefix(contentType, "multipart/form-data") {
		if err := c.Request.ParseForm(); err != nil {
			return nil, err
		}
		for key, values := range c.Request.PostForm {
			if len(values) == 1 {
				params[key] = values[0]
			} else {
				params[key] = values
			}
		}
	}

	// 尝试从 JSON 负载中获取参数
	if strings.HasPrefix(contentType, "application/json") {
		body, err := io.ReadAll(c.Request.Body)
		if err != nil {
			return nil, err
		}
		var jsonMap map[string]interface{}
		if err := json.Unmarshal(body, &jsonMap); err != nil {
			return nil, err
		}
		for key, value := range jsonMap {
			params[key] = value
			// 将 JSON 值转换为字符串切片（这里只处理简单的值类型）
			// strVal, ok := value.(string)
			// if ok {
			// 	params[key] = []string{strVal}
			// } else {
			// 	// 对于非字符串值，你可能需要更复杂的处理逻辑
			// 	// 这里我们简单地忽略它们，但可以将它们转换为字符串或记录错误
			// 	// 例如：params[key] = []string{fmt.Sprintf("%v", value)}
			// }
		}
		// 注意：由于我们已经读取了请求体，所以如果后续的处理程序还需要访问请求体，
		// 你可能需要将请求体重新写入 c.Request.Body，或者使用其他方法来避免这个问题。
		// 一个简单的方法是使用 ioutil.NopCloser(bytes.NewBuffer(body)) 来重新设置请求体。
	}

	return params, nil
}

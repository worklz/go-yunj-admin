package util

// 在切片的头部插入一个或多个元素
func SlicePrepend(slice []interface{}, elements ...interface{}) []interface{} {
	// 计算新切片的长度
	newLength := len(slice) + len(elements)
	// 创建一个新的切片来容纳所有元素
	newSlice := make([]interface{}, newLength)
	// 将新元素复制到新切片的开头
	copy(newSlice, elements)
	// 将旧切片中的元素复制到新切片中，从新元素的后面开始
	copy(newSlice[len(elements):], slice)
	// 返回新切片
	return newSlice
}

// int类型切片去重
func IntSliceUnique(slice []int) []int {
	// 创建一个 map 来跟踪已经遇到的数字
	seen := make(map[int]struct{})
	// 创建一个新的切片来存储不重复的元素
	var res []int
	for _, v := range slice {
		// 如果数字还没有被遇到过，则添加到结果切片中
		if _, exists := seen[v]; !exists {
			seen[v] = struct{}{}
			res = append(res, v)
		}
	}
	return res
}

// 将一个大int切片分割成多个小int切片，每个小切片最多包含n个元素
func IntSliceChunk(slice []int, n int) [][]int {
	var result [][]int
	for len(slice) > 0 {
		// 计算当前小切片的长度，不超过n且不超过slice剩余长度
		partLen := n
		if partLen > len(slice) {
			partLen = len(slice)
		}
		// 从slice中截取前partLen个元素，并添加到结果中
		result = append(result, slice[:partLen])
		// 更新slice为剩余部分
		slice = slice[partLen:]
	}
	return result
}

// 将一个大string切片分割成多个小string切片，每个小切片最多包含n个元素
func StringSliceChunk(slice []string, n int) [][]string {
	var result [][]string
	for len(slice) > 0 {
		// 计算当前小切片的长度，不超过n且不超过slice剩余长度
		partLen := n
		if partLen > len(slice) {
			partLen = len(slice)
		}
		// 从slice中截取前partLen个元素，并添加到结果中
		result = append(result, slice[:partLen])
		// 更新slice为剩余部分
		slice = slice[partLen:]
	}
	return result
}

// 从传入的切片中随机选择n个元素（不重复），并返回一个新的切片
// 由于Go的泛型在编译时进行类型推断，因此这里不需要显式指定切片元素的类型
func RandomSlice[T any](slice []T, n int) []T {
	// 如果原切片长度小于或等于n，直接返回原切片
	if len(slice) <= n {
		return slice
	}

	// 创建一个map来跟踪已经选择的索引，避免重复
	selectedIdx := make(map[int]struct{})
	var result []T

	// 循环直到选择了n个不重复的元素
	for len(result) < n {
		// 生成一个随机索引
		index := RandomInt(0, len(slice)-1)

		// 如果这个索引还没有被选择过，就添加到结果中
		if _, exists := selectedIdx[index]; !exists {
			selectedIdx[index] = struct{}{}
			result = append(result, slice[index])
		}
	}

	return result
}

# 拉取一个带有golang环境的镜像来编译go项目（比较小的镜像）
FROM crpi-cb1t6ui6q7epw7vo.cn-chengdu.personal.cr.aliyuncs.com/worklz/golang:alpine AS builder
# 作者
MAINTAINER worklz

# 构建可执行文件
# 关闭CGO
ENV CGO_ENABLED 0
# 设置代理
ENV GOPROXY https://goproxy.cn,direct
# 设置镜像源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 设置工作目录
WORKDIR /build
# 复制源代码到build目录下
COPY . . 
# 编译打包产生可执行文件main，在/build/main
RUN go build -o main

# 构建镜像
FROM crpi-cb1t6ui6q7epw7vo.cn-chengdu.personal.cr.aliyuncs.com/worklz/alpine
WORKDIR /app
# 设置东八区时区
# 安装 tzdata 包
RUN apk add --no-cache tzdata
# 设置时区环境变量
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
# 复制需要的文件
COPY config /app/config
COPY resource /app/resource
COPY storage /app/storage
# 把builder镜像下的文件/build/main 复制到 当前镜像 /app 下
COPY --from=builder /build/main /app
# 暴露端口
EXPOSE 8082
# 可挂载的目录
VOLUME ["/app/config","/app/storage"]
# 运行编译后的命令
CMD ["./main"]
# 云静Admin（go）

## 目录说明

- app -- 应用的业务代码目录
    - controller -- 控制器层
    - corn -- 定时任务
    - enum -- 枚举类型
    - es -- elasticsearch
    - middleware -- 中间件
    - model -- 模型层
    - param -- 参数结构体
    - queue -- 队列
    - service-- 服务层
- cmd -- 命令行工具
    - es -- elasticsearch
- config -- 配置文件
- pkg -- 公共代码库
    - baidu -- 百度（含：站点收录）
    - blog -- 博客相关
    - boot -- 服务启动（预加载资源）
    - corn -- 定时任务
    - global -- 全局变量
    - html -- html模板（pongo2）
    - queue -- 队列
    - redirect -- 跳转
    - redis -- redis
    - request -- 请求相关
    - response -- 响应相关（响应json、html、错误码定义等）
    - shutdown -- 服务关闭（释放资源）
    - util -- 工具函数
    - validate -- 验证器
- resource -- 资源目录
    - static -- 静态资源目录（含css、js、图片等）
    - view -- 视图目录
- router -- 路由
- storage -- 存储目录
    - log -- 日志目录
    - upload -- 上传目录
- main.go -- 程序启动/打包主文件


## 创建数据库

```sql
-- 创建数据库
CREATE DATABASE db_yunj_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
-- 创建账户 CREATE USER 'your_username'@'your_host' IDENTIFIED BY 'your_password';
-- your_username 是你想要创建的账户的用户名。
-- your_host 指定了账户可以从哪个主机连接到 MySQL 服务器。通常，你可以使用 localhost 来限制账户只能从本地主机连接，或者使用 % 来允许从任何主机连接（但出于安全考虑，通常不建议这样做）。
-- your_password 是账户的密码。
CREATE USER 'db_yunj_blog'@'%' IDENTIFIED BY '123456';
-- 授予权限 GRANT ALL PRIVILEGES ON your_database_name.* TO 'your_username'@'your_host';
-- 创建账户后，你需要使用 GRANT 语句授予该账户访问数据库的权限。
-- 这条语句授予了 your_username 账户对 your_database_name 数据库的所有权限。如果你只想授予特定的权限（如 SELECT、INSERT、UPDATE、DELETE 等），你可以替换 ALL PRIVILEGES 为相应的权限列表。
GRANT ALL PRIVILEGES ON db_yunj_blog.* TO 'db_yunj_blog'@'%';
-- 刷新权限
-- 虽然 MySQL 通常会自动刷新权限表，但你可以手动执行以下命令来确保权限更改立即生效。
FLUSH PRIVILEGES;
```

数据库创建完成后，运行`db_yunj_blog.sql`文件

## 配置文件

进入项目根目录，复制一份：`config\example.config.yaml`配置示例文件 为：`config\config.yaml`，

修改其中MySQL、Redis、ES等相关配置信息。

## docker部署项目

前提：当前环境安装了docker

完成了配置文件初始化后，进入项目根目录，执行以下命令：

```bash
# 进入项目根目录
# 构建镜像：go-yunj-blog 为镜像名
docker build -t go-yunj-blog .

# 启动容器：go-yunj-blog 为容器名
# /www/go/src/go-yunj-blog 为项目根目录绝对路径
docker run --name go-yunj-blog \
-v /www/go/src/go-yunj-blog/config:/app/config \
-v /www/go/src/go-yunj-blog/storage:/app/storage \
-p 8082:8082 \
-d go-yunj-blog
```

本机浏览器访问：`http://127.0.0.1:8082` 即可验证部署成功

## Elasticsearch

ES文件目录：`app\es\...`

1. 新增文件配置索引和映射，实现`es.IndexInterface`接口

    如：`app\es\index\article.go`

2. 注册索引

    在`app\es\register.go`文件中注册索引
    
    ```go
    // 所有索引
    var indexs = []IndexInterface{
        ...,
        &index.Article{},
    }
    ```
    
    每次启动服务时会检测索引和映射是否创建，若没有则会创建，并获取全部能推送的数据进行推送

3. 若需要备份/重置所有注册索引映射和数据

    调用执行：`app\es\reset.go`下的`Reset()`方法即可（进入项目根目录执行：`go run .\cmd\es\reset.go`）

## 队列任务（当前是redis队列）

队列文件目录：`app\queue\...`

jobs.go文件地址：`app\queue\config\jobs.go`

queue.go文件地址：`pkg\queue\queue.go`

1. 创建队列结构体，并实现`QueueInterface`接口：`queue.go:QueueInterface`
    
    参考：`app\queue\tests.go`

2. 添加队列工作任务项`jobs.go:QueueJobs`

    ```golang
    var QueueJobs = []queue.Job{
        {Enable: true, Queue: &appQueue.Tests{}},   // 测试
        ...
    }
    ```
    具体配置属性描述详见：`queue.go:Job`

3. 重新编译打包运行程序

## 添加/关闭定时任务

定时任务文件目录：`app\corn\...`

task_items.go文件地址：`app\corn\config\task_items.go`

task.go文件地址：`pkg\corn\task.go`

### 添加定时任务

1. 创建定时任务结构体，并实现`TaskInterface`接口：`task.go:TaskInterface`
    
    参考：`app\corn\tests.go`

2. 添加定时任务项`task_items.go:TaskItems`

    ```golang
    var TaskItems = []TaskItem{
        ...,
        {Enable: true, Spec: "*/10 * * * * *", Task: &Tests{}},
    }
    ```
    具体配置属性描述详见：`task.go:TaskItem`

3. 重新编译打包运行程序

### 关闭定时任务

编辑定时任务项`task_items.go:TaskItems`，修改指定定时任务项`Enable:false`

```golang
var TaskItems = []TaskItem{
    ...,
    {Enable: false, Spec: "*/10 * * * * *", Task: &Tests{}},
}
```
具体配置属性描述详见：`task.go:TaskItem`

## 提示

* 添加博客固定地址页面，须在`百度站点收录`定时任务的固定地址中添加上

    定时任务文件地址：`app\corn\baidu_site_map.go`

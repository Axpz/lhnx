# ---------- Backend Builder ----------
FROM golang:1.25-alpine AS builder

# 更安全的构建镜像初始化
RUN apk add --no-cache tzdata

WORKDIR /app

# 仅复制依赖文件，充分利用 Docker 缓存
COPY go.mod go.sum ./
RUN go mod download

# 复制剩余代码
COPY . .

# 编译为静态二进制文件（去符号表 - 更小体积）
RUN CGO_ENABLED=0 go build -o main

# ---------- Final Image using Distroless ----------
FROM gcr.io/distroless/static-debian11 AS final

# 设置工作目录
WORKDIR /app

# 设置时区
ENV TZ=Asia/Shanghai

# 拷贝可执行文件和配置
COPY --from=builder /app/main .

# 暴露端口
EXPOSE 8080

# 启动应用
ENTRYPOINT ["./main"]
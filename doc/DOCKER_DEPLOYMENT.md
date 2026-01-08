# Docker部署方案

## 1. 项目概述

电子料替代与比价助手是一款基于Chrome浏览器的扩展插件，包含前端扩展和后端服务两部分。本部署方案主要针对后端服务的容器化部署。

## 2. 前置条件

- Docker 20.10.0+ 已安装并运行
- Docker Compose 2.0.0+ 已安装
- 具有适当的文件系统权限

## 3. 目录结构

```
.
├── backend/              # 后端服务
│   ├── Dockerfile        # 后端Dockerfile
│   ├── package.json      # 后端依赖配置
│   ├── server.js         # 后端主程序
│   └── .env              # 环境变量配置
├── docker-compose.yml    # Docker Compose配置文件
└── DOCKER_DEPLOYMENT.md  # 部署文档
```

## 4. Docker构建与部署

### 4.1 环境配置

1. 确保后端服务的环境变量配置正确
2. 复制 `.env.example` 为 `.env` 并根据实际情况修改：

```bash
cp backend/.env.example backend/.env
```

### 4.2 开发环境部署

```bash
# 启动服务（开发环境）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 4.3 生产环境部署

```bash
# 启动服务（生产环境，包含Nginx）
docker-compose --profile production up -d

# 查看服务状态
docker-compose --profile production ps

# 查看日志
docker-compose --profile production logs -f

# 停止服务
docker-compose --profile production down
```

### 4.4 仅构建镜像

```bash
# 构建后端镜像
docker-compose build

# 构建特定服务镜像
docker-compose build backend
```

### 4.5 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
```

## 5. 镜像优化

### 5.1 使用多阶段构建（已实现）

Dockerfile采用了Node.js 18 LTS Alpine镜像作为基础，体积小且性能好。

### 5.2 依赖优化

- 使用 `npm ci --only=production` 安装依赖，确保依赖版本一致
- 仅安装生产环境依赖，减少镜像体积

### 5.3 镜像清理

```bash
# 清理未使用的镜像
docker image prune

# 清理所有未使用的资源
docker system prune -a
```

## 6. 网络配置

- 服务使用自定义网络 `part-search-network` 进行通信
- 后端服务暴露端口 `3000`，可通过 `http://localhost:3000` 访问
- 生产环境下，Nginx作为反向代理，暴露端口 `80` 和 `443`

## 7. 健康检查

- 后端服务：通过 `/health` 端点进行健康检查，每30秒检查一次
- Nginx：通过 `nginx -t` 命令检查配置，每30秒检查一次

## 8. 资源限制

- 后端服务：
  - CPU限制：0.5核
  - 内存限制：256MB
  - CPU预留：0.25核
  - 内存预留：128MB
- Nginx：
  - CPU限制：0.25核
  - 内存限制：128MB
  - CPU预留：0.1核
  - 内存预留：64MB

## 9. 日志管理

### 9.1 查看日志

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend

# 实时查看日志
docker-compose logs -f

# 查看最近100行日志
docker-compose logs --tail=100
```

### 9.2 日志清理

```bash
# 清理特定容器日志
docker-compose exec backend truncate -s 0 /var/log/*log
```

## 10. 常见问题排查

### 10.1 服务启动失败

1. 查看服务日志，定位错误原因：
   ```bash
   docker-compose logs -f
   ```

2. 检查环境变量配置：
   ```bash
   cat backend/.env
   ```

3. 检查端口是否被占用：
   ```bash
   netstat -tuln | grep 3000
   ```

### 10.2 服务响应缓慢

1. 检查服务资源使用情况：
   ```bash
   docker-compose stats
   ```

2. 检查日志中是否有错误信息：
   ```bash
   docker-compose logs backend | grep -i error
   ```

3. 调整资源限制：修改 `docker-compose.yml` 中的 `deploy.resources` 配置

### 10.3 健康检查失败

1. 检查服务是否正常运行：
   ```bash
   docker-compose ps
   ```

2. 手动测试健康检查端点：
   ```bash
   curl http://localhost:3000/health
   ```

3. 检查服务日志：
   ```bash
   docker-compose logs backend
   ```

### 10.4 数据持久化问题

本项目目前使用内存缓存，无需数据持久化。如需添加数据库或其他持久化存储，可在 `docker-compose.yml` 中添加相应服务和卷配置。

## 11. 更新与维护

### 11.1 更新服务

```bash
# 拉取最新代码
git pull

# 重新构建并启动服务
docker-compose up -d --build
```

### 11.2 备份配置

```bash
# 备份环境变量配置
cp backend/.env backend/.env.backup
```

### 11.3 安全加固

1. 定期更新Docker镜像和依赖
2. 生产环境中使用HTTPS
3. 配置适当的防火墙规则
4. 限制容器的网络访问权限

## 12. 性能监控

### 12.1 使用Docker Stats监控

```bash
docker-compose stats
```

### 12.2 集成外部监控工具

可考虑集成以下监控工具：
- Prometheus + Grafana：监控容器资源使用情况
- ELK Stack：日志收集和分析
- New Relic：应用性能监控

## 13. 故障恢复

### 13.1 自动重启策略

服务配置了 `restart: unless-stopped` 策略，当容器意外停止时会自动重启。

### 13.2 手动恢复

```bash
# 停止服务
docker-compose down

# 启动服务
docker-compose up -d
```

## 14. 版本管理

### 14.1 镜像标签管理

```bash
# 构建带有标签的镜像
docker-compose build --no-cache
docker tag part-search-extension-backend:latest part-search-extension-backend:v1.0.0

# 推送镜像到仓库
docker push part-search-extension-backend:v1.0.0
```

### 14.2 回滚到特定版本

```bash
# 回滚到特定版本
docker-compose down
docker tag part-search-extension-backend:v1.0.0 part-search-extension-backend:latest
docker-compose up -d
```

## 15. 注意事项

1. 确保所有敏感信息（如API密钥）都通过环境变量配置，不要硬编码到代码中
2. 定期更新Docker镜像和依赖，以修复安全漏洞
3. 生产环境中建议使用专用的Docker Registry管理镜像
4. 考虑使用Docker Swarm或Kubernetes进行更复杂的部署和管理
5. 前端扩展需要手动安装到Chrome浏览器中，不包含在本部署方案中

## 16. 附录

### 16.1 Docker常用命令

```bash
# 查看Docker版本
docker --version
docker-compose --version

# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 查看镜像
docker images

# 删除容器
docker rm <container_id>

# 删除镜像
docker rmi <image_id>
```

### 16.2 Nginx配置示例

如需使用Nginx作为反向代理，可创建 `nginx/nginx.conf` 文件，内容如下：

```nginx
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://backend:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

## 17. 联系方式

如有部署相关问题，请联系开发团队。

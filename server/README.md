# 贪吃蛇游戏排行榜服务

这是贪吃蛇游戏的在线排行榜后端服务，提供API接口来存储和检索排行榜数据。

## 功能

- 获取排行榜数据
- 添加新的排行榜记录
- 自动排序和限制排行榜条目数量

## 安装

```bash
# 安装依赖
npm install
```

## 运行

```bash
# 启动服务
npm start
```

服务将在 http://localhost:3000 上运行。

## API接口

### 获取排行榜

```
GET /api/leaderboard
```

返回排行榜数据列表。

### 添加新记录

```
POST /api/leaderboard
```

请求体：

```json
{
  "username": "玩家名称",
  "score": 100
}
```

返回更新后的排行榜数据。

## 部署

使用提供的部署脚本：

```bash
# 添加执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```
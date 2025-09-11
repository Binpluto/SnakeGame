# 小程序开发说明

## 项目结构

```
miniprogram/
├── app.js              # 小程序入口文件
├── app.json            # 小程序配置文件
├── app.wxss            # 全局样式文件
├── project.config.json # 项目配置文件
└── pages/              # 页面目录
    ├── index/          # 首页
    │   ├── index.js
    │   ├── index.json
    │   ├── index.wxml
    │   └── index.wxss
    └── tetris/         # 俄罗斯方块游戏页面
        ├── tetris.js
        ├── tetris.json
        ├── tetris.wxml
        └── tetris.wxss
```

## 开发步骤

### 1. 安装微信开发者工具
- 下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
- 安装并登录微信开发者工具

### 2. 导入项目
- 打开微信开发者工具
- 选择「导入项目」
- 选择 `miniprogram` 目录
- 填入 AppID（测试可使用测试号）

### 3. 预览和调试
- 在开发者工具中点击「预览」按钮
- 使用微信扫描生成的二维码进行真机测试

### 4. 发布流程

#### 4.1 注册小程序
1. 登录微信公众平台：https://mp.weixin.qq.com/
2. 注册小程序账号
3. 完成认证（个人或企业）
4. 获取 AppID

#### 4.2 配置项目
1. 在 `project.config.json` 中填入正确的 AppID
2. 在 `app.json` 中配置小程序信息

#### 4.3 提交审核
1. 在开发者工具中点击「上传」
2. 填写版本号和项目备注
3. 登录微信公众平台提交审核
4. 等待审核通过后发布

## 生成小程序二维码

### 开发阶段
- 使用开发者工具的「预览」功能生成临时二维码
- 当前网页中使用的是占位符二维码

### 发布后
1. 登录微信公众平台
2. 进入「工具」→「生成小程序码」
3. 选择页面路径（如：pages/index/index）
4. 生成并下载二维码
5. 替换项目中的 `images/miniprogram-qrcode.svg` 文件

## 网页集成

项目已在以下页面添加了小程序入口：
- `hey-welcome/vielspass.html` - 游戏选择页面
- `index.html` - 贪吃蛇游戏页面
- `miniprogram-entry.js` - 通用小程序入口组件

## 功能特性

- ✅ 完整的小程序架构
- ✅ 游戏选择页面
- ✅ 俄罗斯方块游戏适配
- ✅ 触屏操作支持
- ✅ 响应式设计
- ✅ 网页小程序入口
- ✅ 二维码展示功能

## 下一步计划

1. 完善其他游戏页面（贪吃蛇、五子棋等）
2. 添加用户系统和排行榜
3. 优化游戏体验和性能
4. 提交小程序审核和发布
5. 更新网页中的真实二维码

## 技术支持

- 微信小程序官方文档：https://developers.weixin.qq.com/miniprogram/dev/framework/
- 微信开发者社区：https://developers.weixin.qq.com/community/minihome
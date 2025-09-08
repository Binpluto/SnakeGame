const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 排行榜数据文件路径
const SNAKE_LEADERBOARD_FILE = path.join(__dirname, 'snake-leaderboard.json');
const TETRIS_LEADERBOARD_FILE = path.join(__dirname, 'tetris-leaderboard.json');

// 中间件
app.use(cors());
app.use(express.json());

// 提供静态文件服务
app.use(express.static(path.join(__dirname, '..')));

// 设置根路径重定向到游戏选择界面
app.get('/', (req, res) => {
    res.redirect('/game-selector.html');
});

// 初始化排行榜文件（如果不存在）
if (!fs.existsSync(SNAKE_LEADERBOARD_FILE)) {
    fs.writeFileSync(SNAKE_LEADERBOARD_FILE, JSON.stringify([]), 'utf8');
}

if (!fs.existsSync(TETRIS_LEADERBOARD_FILE)) {
    fs.writeFileSync(TETRIS_LEADERBOARD_FILE, JSON.stringify([]), 'utf8');
}

// 获取排行榜数据
function getLeaderboard(file) {
    try {
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('读取排行榜数据失败:', error);
        return [];
    }
}

// 保存排行榜数据
function saveLeaderboard(leaderboard, file) {
    try {
        fs.writeFileSync(file, JSON.stringify(leaderboard), 'utf8');
        return true;
    } catch (error) {
        console.error('保存排行榜数据失败:', error);
        return false;
    }
}

// API路由

// 获取贪吃蛇排行榜
app.get('/api/leaderboard', (req, res) => {
    const leaderboard = getLeaderboard(SNAKE_LEADERBOARD_FILE);
    res.json(leaderboard);
});

// 获取俄罗斯方块排行榜
app.get('/api/tetris-leaderboard', (req, res) => {
    const leaderboard = getLeaderboard(TETRIS_LEADERBOARD_FILE);
    res.json(leaderboard);
});

// 添加新贪吃蛇记录
app.post('/api/leaderboard', (req, res) => {
    const { username, score } = req.body;
    
    if (!username || typeof score !== 'number') {
        return res.status(400).json({ error: '无效的用户名或分数' });
    }
    
    const leaderboard = getLeaderboard(SNAKE_LEADERBOARD_FILE);
    
    // 添加新记录
    leaderboard.push({
        username,
        score,
        date: new Date().toISOString()
    });
    
    // 按分数排序（从高到低）
    leaderboard.sort((a, b) => b.score - a.score);
    
    // 只保留前10条记录
    const MAX_ENTRIES = 10;
    const trimmedLeaderboard = leaderboard.slice(0, MAX_ENTRIES);
    
    // 保存更新后的排行榜
    if (saveLeaderboard(trimmedLeaderboard, SNAKE_LEADERBOARD_FILE)) {
        res.json(trimmedLeaderboard);
    } else {
        res.status(500).json({ error: '保存排行榜失败' });
    }
});

// 添加新俄罗斯方块记录
app.post('/api/tetris-leaderboard', (req, res) => {
    const { username, score } = req.body;
    
    if (!username || typeof score !== 'number') {
        return res.status(400).json({ error: '无效的用户名或分数' });
    }
    
    const leaderboard = getLeaderboard(TETRIS_LEADERBOARD_FILE);
    
    // 添加新记录
    leaderboard.push({
        username,
        score,
        date: new Date().toISOString()
    });
    
    // 按分数排序（从高到低）
    leaderboard.sort((a, b) => b.score - a.score);
    
    // 只保留前10条记录
    const MAX_ENTRIES = 10;
    const trimmedLeaderboard = leaderboard.slice(0, MAX_ENTRIES);
    
    // 保存更新后的排行榜
    if (saveLeaderboard(trimmedLeaderboard, TETRIS_LEADERBOARD_FILE)) {
        res.json(trimmedLeaderboard);
    } else {
        res.status(500).json({ error: '保存排行榜失败' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
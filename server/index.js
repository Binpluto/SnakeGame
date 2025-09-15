const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// 排行榜数据文件路径
const SNAKE_LEADERBOARD_FILE = path.join(__dirname, 'snake-leaderboard.json');
const TETRIS_LEADERBOARD_FILE = path.join(__dirname, 'tetris-leaderboard.json');

const VISIT_COUNT_FILE = path.join(__dirname, 'visit-count.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const POINTS_RECORDS_FILE = path.join(__dirname, 'points-records.json');

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 积分系统配置
const POINTS_CONFIG = {
    REGISTER_BONUS: 100,        // 注册奖励积分
    DAILY_LOGIN: 10,           // 每日登录积分
    GAME_TIME_RATE: 1,         // 每分钟游戏时长积分
    MAX_DAILY_GAME_POINTS: 60  // 每日游戏时长积分上限
};

// 中间件
app.use(cors());
app.use(express.json());

// 提供静态文件服务
app.use(express.static(path.join(__dirname, '..')));

// 设置根路径重定向到游戏选择界面
app.get('/', (req, res) => {
    res.redirect('/hey-welcome/vielspass.html');
});

// 获取用户积分信息API
app.get('/api/points/info', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: '未提供有效的认证令牌' 
            });
        }
        
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ 
                success: false, 
                message: '无效的认证令牌' 
            });
        }
        
        const points = getUserPoints(decoded.id);
        const history = getUserPointsHistory(decoded.id, 10);
        const canDailyLogin = checkDailyLogin(decoded.id);
        
        res.json({ 
            success: true, 
            points,
            history,
            canDailyLogin,
            config: POINTS_CONFIG
        });
    } catch (error) {
        console.error('获取积分信息失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '获取积分信息失败' 
        });
    }
});

// 添加游戏时长积分API
app.post('/api/points/game-time', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const { gameTime, gameType } = req.body; // gameTime in minutes
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: '未提供有效的认证令牌' 
            });
        }
        
        if (!gameTime || typeof gameTime !== 'number' || gameTime <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: '游戏时长参数无效' 
            });
        }
        
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ 
                success: false, 
                message: '无效的认证令牌' 
            });
        }
        
        // 检查今日游戏时长积分
        const records = getPointsRecords();
        const today = new Date().toDateString();
        const todayGamePoints = records
            .filter(record => 
                record.userId === decoded.id && 
                record.type === 'game_time' && 
                new Date(record.timestamp).toDateString() === today
            )
            .reduce((sum, record) => sum + record.points, 0);
        
        // 计算可获得的积分
        const potentialPoints = Math.floor(gameTime * POINTS_CONFIG.GAME_TIME_RATE);
        const remainingDailyPoints = Math.max(0, POINTS_CONFIG.MAX_DAILY_GAME_POINTS - todayGamePoints);
        const actualPoints = Math.min(potentialPoints, remainingDailyPoints);
        
        if (actualPoints > 0) {
            const gameTypeName = gameType || '游戏';
            addPoints(decoded.id, actualPoints, 'game_time', `${gameTypeName}时长奖励(${gameTime}分钟)`);
        }
        
        res.json({ 
            success: true, 
            pointsEarned: actualPoints,
            totalPoints: getUserPoints(decoded.id),
            dailyGamePoints: todayGamePoints + actualPoints,
            maxDailyGamePoints: POINTS_CONFIG.MAX_DAILY_GAME_POINTS
        });
    } catch (error) {
        console.error('添加游戏时长积分失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '添加游戏时长积分失败' 
        });
    }
});

// 手动签到API
app.post('/api/points/daily-login', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: '未提供有效的认证令牌' 
            });
        }
        
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ 
                success: false, 
                message: '无效的认证令牌' 
            });
        }
        
        if (!checkDailyLogin(decoded.id)) {
            return res.status(400).json({ 
                success: false, 
                message: '今日已签到' 
            });
        }
        
        addPoints(decoded.id, POINTS_CONFIG.DAILY_LOGIN, 'daily_login', '每日签到奖励');
        
        res.json({ 
            success: true, 
            pointsEarned: POINTS_CONFIG.DAILY_LOGIN,
            totalPoints: getUserPoints(decoded.id),
            message: `签到成功！获得${POINTS_CONFIG.DAILY_LOGIN}积分`
        });
    } catch (error) {
        console.error('签到失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '签到失败' 
        });
    }
});

// 访问量统计API
app.post('/api/visit', (req, res) => {
    try {
        // 读取当前访问量
        let visitData = { totalVisits: 0 };
        if (fs.existsSync(VISIT_COUNT_FILE)) {
            const data = fs.readFileSync(VISIT_COUNT_FILE, 'utf8');
            visitData = JSON.parse(data);
        }
        
        // 增加访问量
        visitData.totalVisits++;
        
        // 保存更新后的访问量
        fs.writeFileSync(VISIT_COUNT_FILE, JSON.stringify(visitData), 'utf8');
        
        res.json({
            success: true,
            totalVisits: visitData.totalVisits
        });
    } catch (error) {
        console.error('访问量统计失败:', error);
        res.status(500).json({ error: '访问量统计失败' });
    }
});

// 获取访问量API
app.get('/api/visit', (req, res) => {
    try {
        let visitData = { totalVisits: 0 };
        if (fs.existsSync(VISIT_COUNT_FILE)) {
            const data = fs.readFileSync(VISIT_COUNT_FILE, 'utf8');
            visitData = JSON.parse(data);
        }
        
        res.json(visitData);
    } catch (error) {
        console.error('获取访问量失败:', error);
        res.status(500).json({ error: '获取访问量失败' });
    }
});

// 初始化排行榜文件（如果不存在）
if (!fs.existsSync(SNAKE_LEADERBOARD_FILE)) {
    fs.writeFileSync(SNAKE_LEADERBOARD_FILE, JSON.stringify([]), 'utf8');
}

if (!fs.existsSync(TETRIS_LEADERBOARD_FILE)) {
    fs.writeFileSync(TETRIS_LEADERBOARD_FILE, JSON.stringify([]), 'utf8');
}



// 初始化访问量文件
if (!fs.existsSync(VISIT_COUNT_FILE)) {
    fs.writeFileSync(VISIT_COUNT_FILE, JSON.stringify({ totalVisits: 0 }), 'utf8');
}

// 初始化用户数据文件
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

// 初始化积分记录文件
if (!fs.existsSync(POINTS_RECORDS_FILE)) {
    fs.writeFileSync(POINTS_RECORDS_FILE, JSON.stringify([]));
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

// 用户管理相关函数
function getUsers() {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('读取用户数据失败:', error);
        return [];
    }
}

function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error('保存用户数据失败:', error);
    }
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}
// 验证JWT token
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// 积分系统相关函数
function getPointsRecords() {
    try {
        const data = fs.readFileSync(POINTS_RECORDS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function savePointsRecords(records) {
    fs.writeFileSync(POINTS_RECORDS_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function addPoints(userId, points, type, description) {
    const records = getPointsRecords();
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) return false;
    
    // 初始化用户积分
    if (typeof user.points !== 'number') {
        user.points = 0;
    }
    
    // 添加积分
    user.points += points;
    
    // 记录积分变化
    const record = {
        id: Date.now().toString(),
        userId,
        points,
        type,
        description,
        timestamp: new Date().toISOString(),
        totalPoints: user.points
    };
    
    records.push(record);
    
    // 保存数据
    saveUsers(users);
    savePointsRecords(records);
    
    return true;
}

function getUserPoints(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    return user ? (user.points || 0) : 0;
}

function getUserPointsHistory(userId, limit = 20) {
    const records = getPointsRecords();
    return records
        .filter(record => record.userId === userId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
}

function checkDailyLogin(userId) {
    const records = getPointsRecords();
    const today = new Date().toDateString();
    
    // 检查今天是否已经签到
    const todayLogin = records.find(record => 
        record.userId === userId && 
        record.type === 'daily_login' && 
        new Date(record.timestamp).toDateString() === today
    );
    
    return !todayLogin;
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

// 用户注册API
app.post('/api/auth/register', (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: '用户名、邮箱和密码都是必需的' 
            });
        }
        
        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ 
                success: false, 
                message: '用户名长度必须在3-20个字符之间' 
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: '密码长度至少6个字符' 
            });
        }
        
        const users = getUsers();
        
        // 检查用户名是否已存在
        if (users.find(user => user.username === username)) {
            return res.status(400).json({ 
                success: false, 
                message: '用户名已存在' 
            });
        }
        
        // 检查邮箱是否已存在
        if (users.find(user => user.email === email)) {
            return res.status(400).json({ 
                success: false, 
                message: '邮箱已被注册' 
            });
        }
        
        // 创建新用户
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: hashPassword(password),
            points: 0,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        saveUsers(users);
        
        // 注册送积分
        addPoints(newUser.id, POINTS_CONFIG.REGISTER_BONUS, 'register', '注册奖励');
        
        res.json({ 
            success: true, 
            message: `注册成功！获得${POINTS_CONFIG.REGISTER_BONUS}积分奖励`,
            points: POINTS_CONFIG.REGISTER_BONUS
        });
    } catch (error) {
        console.error('用户注册失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '注册失败，请稍后重试' 
        });
    }
});

// 用户登录API
app.post('/api/auth/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: '用户名和密码都是必需的' 
            });
        }
        
        const users = getUsers();
        const user = users.find(u => u.username === username);
        
        if (!user || user.password !== hashPassword(password)) {
            return res.status(401).json({ 
                success: false, 
                message: '用户名或密码错误' 
            });
        }
        
        const token = generateToken(user);
        
        // 检查每日登录积分
        let dailyLoginBonus = 0;
        if (checkDailyLogin(user.id)) {
            addPoints(user.id, POINTS_CONFIG.DAILY_LOGIN, 'daily_login', '每日登录奖励');
            dailyLoginBonus = POINTS_CONFIG.DAILY_LOGIN;
        }
        
        res.json({ 
            success: true, 
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                points: getUserPoints(user.id)
            },
            dailyLoginBonus
        });
    } catch (error) {
        console.error('用户登录失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '登录失败，请稍后重试' 
        });
    }
});

// 验证token API
app.get('/api/auth/verify', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: '未提供有效的认证令牌' 
            });
        }
        
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ 
                success: false, 
                message: '无效的认证令牌' 
            });
        }
        
        const users = getUsers();
        const user = users.find(u => u.id === decoded.id);
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: '用户不存在' 
            });
        }
        
        res.json({ 
            success: true, 
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                points: getUserPoints(user.id)
            }
        });
    } catch (error) {
        console.error('验证token失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '验证失败，请稍后重试' 
        });
    }
});



// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
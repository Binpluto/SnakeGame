/**
 * 移动设备屏幕方向检测和适配系统
 * 支持所有游戏的横竖屏切换功能
 */

class OrientationManager {
    constructor() {
        this.currentOrientation = this.getOrientation();
        this.callbacks = [];
        this.init();
    }

    init() {
        // 监听屏幕方向变化
        window.addEventListener('orientationchange', () => {
            // 延迟处理，确保屏幕方向完全改变
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });

        // 监听窗口大小变化（用于桌面浏览器测试）
        window.addEventListener('resize', () => {
            this.handleOrientationChange();
        });

        // 初始化时设置方向
        this.handleOrientationChange();
    }

    getOrientation() {
        // 获取当前屏幕方向
        if (screen.orientation) {
            return screen.orientation.angle;
        } else if (window.orientation !== undefined) {
            return window.orientation;
        } else {
            // 通过窗口尺寸判断
            return window.innerWidth > window.innerHeight ? 90 : 0;
        }
    }

    isLandscape() {
        const orientation = this.getOrientation();
        return Math.abs(orientation) === 90 || window.innerWidth > window.innerHeight;
    }

    isPortrait() {
        return !this.isLandscape();
    }

    handleOrientationChange() {
        const newOrientation = this.getOrientation();
        const isLandscape = this.isLandscape();
        
        // 更新body类名
        document.body.classList.remove('orientation-portrait', 'orientation-landscape');
        document.body.classList.add(isLandscape ? 'orientation-landscape' : 'orientation-portrait');

        // 设置CSS自定义属性
        document.documentElement.style.setProperty('--orientation', isLandscape ? 'landscape' : 'portrait');
        document.documentElement.style.setProperty('--screen-width', window.innerWidth + 'px');
        document.documentElement.style.setProperty('--screen-height', window.innerHeight + 'px');

        // 触发回调函数
        this.callbacks.forEach(callback => {
            try {
                callback({
                    orientation: newOrientation,
                    isLandscape: isLandscape,
                    isPortrait: this.isPortrait(),
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            } catch (error) {
                console.error('Orientation callback error:', error);
            }
        });

        this.currentOrientation = newOrientation;
    }

    // 注册方向变化回调
    onOrientationChange(callback) {
        if (typeof callback === 'function') {
            this.callbacks.push(callback);
        }
    }

    // 移除方向变化回调
    removeOrientationCallback(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }

    // 强制刷新方向检测
    refresh() {
        this.handleOrientationChange();
    }

    // 获取推荐的游戏布局
    getRecommendedLayout() {
        const isLandscape = this.isLandscape();
        const width = window.innerWidth;
        const height = window.innerHeight;

        return {
            orientation: isLandscape ? 'landscape' : 'portrait',
            containerMaxWidth: isLandscape ? Math.min(width * 0.9, 1200) : Math.min(width * 0.95, 600),
            containerMaxHeight: isLandscape ? Math.min(height * 0.9, 800) : Math.min(height * 0.95, 1000),
            gameAreaSize: isLandscape ? 
                Math.min(height * 0.7, width * 0.5) : 
                Math.min(width * 0.9, height * 0.6)
        };
    }
}

// 创建全局实例
const orientationManager = new OrientationManager();

// 通用的游戏适配函数
function adaptGameForOrientation() {
    const layout = orientationManager.getRecommendedLayout();
    const isLandscape = orientationManager.isLandscape();
    
    // 查找游戏容器并应用适配
    const gameContainer = document.querySelector('.game-container, .spider-container, .sheep-container');
    if (gameContainer) {
        gameContainer.style.maxWidth = layout.containerMaxWidth + 'px';
        gameContainer.style.maxHeight = layout.containerMaxHeight + 'px';
    }

    // 查找游戏画布并适配
    const gameCanvas = document.querySelector('#game-canvas, #tetris-canvas, #game-board');
    if (gameCanvas) {
        if (isLandscape) {
            gameCanvas.style.maxWidth = layout.gameAreaSize + 'px';
            gameCanvas.style.maxHeight = layout.gameAreaSize + 'px';
        } else {
            gameCanvas.style.maxWidth = '100%';
            gameCanvas.style.maxHeight = layout.gameAreaSize + 'px';
        }
    }

    // 触发自定义事件，让各个游戏可以监听
    window.dispatchEvent(new CustomEvent('gameOrientationChange', {
        detail: {
            orientation: layout.orientation,
            isLandscape: isLandscape,
            layout: layout
        }
    }));
}

// 注册通用适配函数
orientationManager.onOrientationChange(adaptGameForOrientation);

// 显示方向提示
function showOrientationHint() {
    // 移除现有提示
    const existingHint = document.querySelector('.orientation-hint');
    if (existingHint) {
        existingHint.remove();
    }

    // 只在移动设备上显示提示
    if (!('ontouchstart' in window)) return;

    const hint = document.createElement('div');
    hint.className = 'orientation-hint';
    hint.innerHTML = `
        <div class="orientation-hint-content">
            <div class="orientation-icon">📱</div>
            <p>旋转设备以获得最佳游戏体验</p>
            <button class="orientation-hint-close">×</button>
        </div>
    `;
    
    // 添加样式
    hint.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    const content = hint.querySelector('.orientation-hint-content');
    content.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        max-width: 300px;
        margin: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    
    const icon = hint.querySelector('.orientation-icon');
    icon.style.cssText = `
        font-size: 48px;
        margin-bottom: 15px;
        animation: rotate 2s infinite linear;
    `;
    
    const closeBtn = hint.querySelector('.orientation-hint-close');
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    `;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(hint);
    
    // 关闭按钮事件
    closeBtn.addEventListener('click', () => {
        hint.remove();
        style.remove();
    });
    
    // 3秒后自动关闭
    setTimeout(() => {
        if (hint.parentNode) {
            hint.remove();
            style.remove();
        }
    }, 3000);
}

// 在页面加载完成后显示提示（仅在移动设备上）
if ('ontouchstart' in window) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(showOrientationHint, 1000);
    });
}

// 导出给其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OrientationManager, orientationManager };
} else {
    window.OrientationManager = OrientationManager;
    window.orientationManager = orientationManager;
}
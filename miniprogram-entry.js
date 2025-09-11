// 小程序入口组件
function createMiniprogramEntry() {
    const entryHTML = `
        <div class="miniprogram-entry">
            <button class="miniprogram-btn" onclick="toggleMiniprogram()">
                <span>📱</span>
                <span>小程序</span>
            </button>
            <div class="miniprogram-qr" id="miniprogram-qr">
                <div class="qr-popup">
                    <div class="qr-title">小程序版</div>
                    <div class="qr-code">
                        <img src="images/miniprogram-index-qrcode.jpg" alt="小程序二维码" />
                    </div>
                    <div class="qr-desc">
                        使用微信扫一扫<br>
                        体验小程序版游戏
                    </div>
                    <div style="margin-top: 10px; font-size: 11px; color: #999; text-align: center;">
                        小程序正在开发中，敬请期待！
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const entryCSS = `
        .miniprogram-entry {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .miniprogram-btn {
            background: linear-gradient(135deg, #1aad19, #2dc653);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 3px 10px rgba(26, 173, 25, 0.3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .miniprogram-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 14px rgba(26, 173, 25, 0.4);
        }
        
        .miniprogram-qr {
            position: relative;
            display: none;
        }
        
        .miniprogram-qr.show {
            display: block;
        }
        
        .qr-popup {
            position: absolute;
            top: 45px;
            left: 0;
            background: white;
            border-radius: 12px;
            padding: 15px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
            text-align: center;
            min-width: 180px;
        }
        
        .qr-popup::before {
            content: '';
            position: absolute;
            top: -6px;
            left: 15px;
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-bottom: 6px solid white;
        }
        
        .qr-code {
            width: 120px;
            height: 120px;
            background: #f5f5f5;
            border: 2px dashed #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px;
            border-radius: 8px;
            font-size: 11px;
            color: #666;
            text-align: center;
            line-height: 1.3;
            overflow: hidden;
        }
        
        .qr-code img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 6px;
        }
        
        .qr-title {
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
        }
        
        .qr-desc {
            font-size: 11px;
            color: #666;
            line-height: 1.3;
        }
    `;
    
    // 添加CSS样式
    const style = document.createElement('style');
    style.textContent = entryCSS;
    document.head.appendChild(style);
    
    // 添加HTML到页面
    document.body.insertAdjacentHTML('afterbegin', entryHTML);
    
    // 添加事件监听
    setupMiniprogramEvents();
}

// 小程序二维码切换
function toggleMiniprogram() {
    const qrDiv = document.getElementById('miniprogram-qr');
    qrDiv.classList.toggle('show');
}

// 设置小程序相关事件
function setupMiniprogramEvents() {
    // 点击其他地方关闭二维码
    document.addEventListener('click', function(e) {
        const miniprogramEntry = document.querySelector('.miniprogram-entry');
        const qrDiv = document.getElementById('miniprogram-qr');
        
        if (miniprogramEntry && !miniprogramEntry.contains(e.target)) {
            qrDiv.classList.remove('show');
        }
    });
}

// 页面加载完成后自动创建小程序入口
document.addEventListener('DOMContentLoaded', function() {
    createMiniprogramEntry();
});
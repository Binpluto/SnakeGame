#!/usr/bin/env node

/**
 * 一键生成小程序二维码并更新网页引用
 * 这个脚本会：
 * 1. 检查配置是否正确
 * 2. 生成真实的小程序二维码
 * 3. 自动更新网页中的二维码引用
 * 4. 提供完成后的使用说明
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置文件路径
const CONFIG_FILE = './miniprogram-config.json';

/**
 * 执行命令并返回 Promise
 */
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 执行命令: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`命令执行失败，退出码: ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * 检查配置文件
 */
function checkConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    if (config.appId === 'your_app_id_here' || config.appSecret === 'your_app_secret_here') {
      console.log('❌ 配置检查失败');
      console.log('');
      console.log('请先配置小程序凭证：');
      console.log('1. 编辑 miniprogram-config.json 文件');
      console.log('2. 将 appId 和 appSecret 替换为真实值');
      console.log('3. 重新运行此脚本');
      console.log('');
      console.log('📖 详细说明请参考：如何生成真实二维码.md');
      return false;
    }
    console.log('✅ 配置检查通过');
    return true;
  } catch (error) {
    console.log('❌ 无法读取配置文件:', error.message);
    return false;
  }
}

/**
 * 显示开始信息
 */
function showStartInfo() {
  console.log('🚀 小程序二维码一键生成和更新工具');
  console.log('=' .repeat(50));
  console.log('');
  console.log('此工具将执行以下步骤：');
  console.log('1. ✅ 检查小程序配置');
  console.log('2. 🔄 生成真实的小程序二维码');
  console.log('3. 📝 更新网页中的二维码引用');
  console.log('4. 🎉 完成并提供使用说明');
  console.log('');
}

/**
 * 显示完成信息
 */
function showCompletionInfo() {
  console.log('');
  console.log('🎉 所有步骤已完成！');
  console.log('=' .repeat(50));
  console.log('');
  console.log('📁 生成的文件：');
  console.log('   • images/miniprogram-index-qrcode.jpg - 首页二维码');
  console.log('   • images/miniprogram-tetris-qrcode.jpg - 俄罗斯方块二维码');
  console.log('   • images/miniprogram-snake-qrcode.jpg - 贪吃蛇二维码');
  console.log('   • images/miniprogram-gomoku-qrcode.jpg - 五子棋二维码');
  console.log('');
  console.log('📝 已更新的网页：');
  console.log('   • index.html - 主页面');
  console.log('   • hey-welcome/vielspass.html - 游戏选择页');
  console.log('   • miniprogram-entry.js - 小程序入口组件');
  console.log('');
  console.log('🌐 现在可以：');
  console.log('   1. 刷新浏览器查看真实二维码');
  console.log('   2. 使用微信扫描二维码测试小程序');
  console.log('   3. 分享二维码给其他用户');
  console.log('');
  console.log('💡 提示：如需重新生成，直接运行此脚本即可');
}

/**
 * 主函数
 */
async function main() {
  try {
    showStartInfo();

    // 步骤1: 检查配置
    console.log('步骤 1/3: 检查配置...');
    if (!checkConfig()) {
      process.exit(1);
    }
    console.log('');

    // 步骤2: 生成二维码
    console.log('步骤 2/3: 生成小程序二维码...');
    console.log('这可能需要几秒钟时间，请耐心等待...');
    console.log('');
    
    await runCommand('node', ['generate-qrcode-advanced.js']);
    console.log('');
    console.log('✅ 二维码生成完成');
    console.log('');

    // 步骤3: 更新网页引用
    console.log('步骤 3/3: 更新网页中的二维码引用...');
    console.log('');
    
    await runCommand('node', ['update-qrcode-references.js']);
    console.log('');

    // 显示完成信息
    showCompletionInfo();

  } catch (error) {
    console.log('');
    console.log('❌ 执行过程中出现错误:', error.message);
    console.log('');
    console.log('🔧 可能的解决方案：');
    console.log('1. 检查网络连接是否正常');
    console.log('2. 确认小程序 AppID 和 AppSecret 正确');
    console.log('3. 确认小程序已发布到正式环境');
    console.log('4. 检查微信API调用频率是否超限');
    console.log('');
    console.log('📖 详细说明请参考：miniprogram-api-guide.md');
    process.exit(1);
  }
}

// 处理命令行参数
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('小程序二维码一键生成和更新工具');
  console.log('');
  console.log('用法：');
  console.log('  node generate-and-update-qrcode.js');
  console.log('');
  console.log('前置条件：');
  console.log('  1. 已在 miniprogram-config.json 中配置正确的 AppID 和 AppSecret');
  console.log('  2. 小程序已发布到微信小程序平台');
  console.log('');
  console.log('选项：');
  console.log('  -h, --help     显示此帮助信息');
  console.log('');
  process.exit(0);
}

// 运行脚本
if (require.main === module) {
  main();
}
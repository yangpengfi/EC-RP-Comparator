const fs = require('fs-extra');
const archiver = require('archiver');
const path = require('path');

// 配置项
const CONFIG = {
  // 源文件目录
  srcDir: '.',
  // 输出目录
  distDir: 'dist',
  // 打包文件名称
  packageName: 'ec-rp-comparator',
  // 版本号（从package.json读取）
  version: require('./package.json').version,
  // 需要包含的文件
  includeFiles: [
    'manifest.json',
    'background.js',
    'content.js',
    'popup.html',
    'popup.js',
    'icons/',
    'README.md'
  ],
  // 需要排除的文件
  excludeFiles: [
    '.git',
    '.gitignore',
    '.trae',
    'node_modules',
    'dist',
    'doc',
    'backend',
    'ui-designs',
    'test.html',
    'docker-compose.yml',
    'package.json',
    'package-lock.json',
    'build.js',
    'validate.js',
    'build.log'
  ]
};

// 日志记录
const logStream = fs.createWriteStream('build.log', { flags: 'w' });
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logStream.write(logMessage + '\n');
};

// 主打包函数
async function buildExtension() {
  try {
    log('开始打包电子料替代与比价助手...');
    log(`版本号: ${CONFIG.version}`);
    
    // 1. 清理输出目录
    log('清理输出目录...');
    await fs.remove(CONFIG.distDir);
    await fs.ensureDir(CONFIG.distDir);
    
    // 2. 复制文件到输出目录
    log('复制文件到输出目录...');
    for (const file of CONFIG.includeFiles) {
      const srcPath = path.join(CONFIG.srcDir, file);
      const destPath = path.join(CONFIG.distDir, file);
      
      const stats = await fs.stat(srcPath);
      if (stats.isDirectory()) {
        await fs.copy(srcPath, destPath);
        log(`  - 复制目录: ${file}`);
      } else {
        await fs.copy(srcPath, destPath);
        log(`  - 复制文件: ${file}`);
      }
    }
    
    // 3. 创建zip包
    log('创建ZIP安装包...');
    const zipFileName = `${CONFIG.packageName}-v${CONFIG.version}.zip`;
    const zipFilePath = path.join(CONFIG.distDir, zipFileName);
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      log(`  - ZIP包创建成功: ${zipFileName}`);
      log(`  - 文件大小: ${(archive.pointer() / 1024).toFixed(2)} KB`);
      
      // 4. 生成版本信息文档
      generateVersionInfo();
      
      log('打包完成！');
      logStream.end();
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(output);
    archive.directory(CONFIG.distDir, false);
    await archive.finalize();
    
  } catch (error) {
    log(`打包失败: ${error.message}`);
    logStream.end();
    process.exit(1);
  }
}

// 生成版本信息文档
function generateVersionInfo() {
  const versionInfo = {
    name: CONFIG.packageName,
    version: CONFIG.version,
    buildDate: new Date().toISOString(),
    description: '电子料替代与比价助手 - Chrome浏览器扩展',
    files: CONFIG.includeFiles,
    author: 'electronic-components-team',
    license: 'MIT',
    manifest: JSON.parse(fs.readFileSync('manifest.json', 'utf8'))
  };
  
  const versionInfoPath = path.join(CONFIG.distDir, 'version-info.json');
  fs.writeFileSync(versionInfoPath, JSON.stringify(versionInfo, null, 2), 'utf8');
  log(`  - 生成版本信息: version-info.json`);
}

// 执行打包
buildExtension();

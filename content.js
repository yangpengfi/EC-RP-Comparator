// 内容脚本，负责在网页中识别料号和显示查询结果

console.log('电子料替代与比价助手 - 内容脚本已加载');

// 监听来自background的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到来自background的消息:', request);
  if (request.action === 'showSearchResult') {
    const partNumber = request.partNumber;
    console.log('准备查询料号:', partNumber);
    // 查询料号信息并显示结果
    searchAndShowResult(partNumber);
    sendResponse({ status: 'success', message: '开始查询料号' });
  }
  // 保持消息通道打开
  return true;
});

// 查询料号信息并显示结果
async function searchAndShowResult(partNumber) {
  // 显示加载状态
  showLoadingPopup(partNumber);
  
  try {
    // 调用background中的searchPartInfo函数
    const response = await chrome.runtime.sendMessage({
      action: 'searchPart',
      partNumber: partNumber
    });
    
    if (response.success) {
      // 显示查询结果
      showResultPopup(response.data);
    } else {
      showErrorPopup('查询失败: ' + response.error);
    }
  } catch (error) {
    console.error('查询过程中发生错误:', error);
    showErrorPopup('查询过程中发生错误，请查看控制台日志');
  }
}

// 显示加载状态弹窗
function showLoadingPopup(partNumber) {
  // 先移除已存在的弹窗
  const existingPopup = document.getElementById('part-search-popup');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // 创建加载弹窗
  const popup = document.createElement('div');
  popup.id = 'part-search-popup';
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 90vw;
    max-width: 420px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    z-index: 99999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    font-size: 14px;
    animation: slideInRight 0.3s ease-out;
  `;
  
  popup.innerHTML = `
    <div style="padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center;">
      <div style="width: 50px; height: 50px; margin-bottom: 16px; border: 3px solid #f0f2f5; border-top-color: #1967d2; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #2c3e50;">正在查询</h3>
      <p style="margin: 0; color: #7f8c8d; font-size: 14px;">料号: ${partNumber}</p>
      <p style="margin: 8px 0 0 0; color: #95a5a6; font-size: 12px;">正在搜索最佳价格和替代方案...</p>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
  `;
  
  // 添加到页面
  document.body.appendChild(popup);
}

// 显示错误弹窗
function showErrorPopup(message) {
  // 先移除已存在的弹窗
  const existingPopup = document.getElementById('part-search-popup');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // 创建错误弹窗
  const popup = document.createElement('div');
  popup.id = 'part-search-popup';
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 90vw;
    max-width: 420px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    z-index: 99999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    font-size: 14px;
    animation: slideInRight 0.3s ease-out;
  `;
  
  popup.innerHTML = `
    <div style="padding: 24px; display: flex; flex-direction: column; align-items: center; text-align: center;">
      <div style="width: 50px; height: 50px; margin-bottom: 16px; background: #fee; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #d93025;">❌</div>
      <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #d93025;">查询失败</h3>
      <p style="margin: 0; color: #7f8c8d; font-size: 14px; line-height: 1.5;">${message}</p>
      <button id="popup-close" style="margin-top: 16px; padding: 8px 20px; background: linear-gradient(135deg, #1967d2 0%, #1557b0 100%); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;">关闭</button>
    </div>
  `;
  
  // 添加关闭按钮事件
  document.body.appendChild(popup);
  const closeBtn = popup.querySelector('#popup-close');
  closeBtn.addEventListener('click', () => {
    // 添加滑出动画
    popup.classList.add('slide-out');
    // 动画结束后移除弹窗
    setTimeout(() => {
      popup.remove();
    }, 300);
  });
}

// 生成平台查询链接
function getPlatformUrl(platform, partNumber) {
  const baseUrls = {
    '立创商城': 'https://www.szlcsc.com/search/global.html?k=',
    'DigiKey': 'https://www.digikey.com/en/products/result?keywords=',
    '云汉芯城': 'https://www.ickey.com/search.html?keywords=',
    'Mouser': 'https://www.mouser.com/Search/Refine.aspx?Keyword=',
    'Arrow': 'https://www.arrow.com/en/products/search?searchTerm='
  };
  
  return baseUrls[platform] ? baseUrls[platform] + encodeURIComponent(partNumber) : '#';
}

// 显示结果弹窗
function showResultPopup(data) {
  // 先移除已存在的弹窗
  const existingPopup = document.getElementById('part-search-popup');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // 创建弹窗容器
  const popup = document.createElement('div');
  popup.id = 'part-search-popup';
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 90vw;
    max-width: 500px;
    max-height: 80vh;
    background: white;
    border-radius: 16px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
    z-index: 99999;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    font-size: 14px;
    animation: slideInRight 0.3s ease-out;
  `;
  
  // 弹窗标题和关闭按钮
  popup.innerHTML = `
    <div style="padding: 20px; background: linear-gradient(135deg, #1967d2 0%, #1557b0 100%); color: white; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h3 style="margin: 0; font-size: 18px; font-weight: 600;">料号查询结果</h3>
        <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">${new Date().toLocaleString('zh-CN')}</p>
      </div>
      <button id="popup-close" style="background: rgba(255, 255, 255, 0.2); border: none; border-radius: 50%; width: 32px; height: 32px; color: white; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">×</button>
    </div>
    <div style="padding: 24px; overflow-y: auto; max-height: calc(700px - 80px);">
      <!-- 基本信息卡片 -->
      <div style="margin-bottom: 24px; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border-left: 4px solid #1967d2;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #2c3e50;">${data.partNumber}</h4>
            <p style="margin: 0; color: #7f8c8d; font-size: 12px;">${data.description || '电子元器件'}</p>
          </div>
          <span style="background: #e6f4ea; color: #188038; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">查询成功</span>
        </div>
        <div style="display: flex; flex-wrap: gap; gap: 12px;">
          <span style="background: #e8f0fe; color: #1967d2; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; display: flex; align-items: center;">
            <span style="margin-right: 4px;">📊</span>生命周期: ${data.riskInfo.lifecycle}
          </span>
          <span style="background: #e6f4ea; color: #188038; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; display: flex; align-items: center;">
            <span style="margin-right: 4px;">✅</span>RoHS: ${data.riskInfo.rohs}
          </span>
          <span style="background: #fef3c7; color: #d97706; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; display: flex; align-items: center;">
            <span style="margin-right: 4px;">⏱️</span>更新于: ${new Date(data.timestamp || Date.now()).toLocaleTimeString('zh-CN')}
          </span>
        </div>
      </div>
      
      <!-- 跨平台比价 -->
      <div style="margin-bottom: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h4 style="margin: 0; font-size: 17px; font-weight: 600; color: #2c3e50; display: flex; align-items: center;">
            <span style="margin-right: 10px; color: #1967d2; font-size: 20px;">💰</span>
            跨平台比价
          </h4>
          <span style="background: #e8f0fe; color: #1967d2; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">${data.prices.length} 个平台</span>
        </div>
        <div style="overflow-x: auto; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);">
          <table style="width: 100%; border-collapse: collapse; min-width: 450px;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="text-align: left; padding: 14px 12px; font-weight: 600; color: #374151; font-size: 13px; border-bottom: 2px solid #e2e8f0;">平台</th>
                <th style="text-align: right; padding: 14px 12px; font-weight: 600; color: #374151; font-size: 13px; border-bottom: 2px solid #e2e8f0;">价格</th>
                <th style="text-align: center; padding: 14px 12px; font-weight: 600; color: #374151; font-size: 13px; border-bottom: 2px solid #e2e8f0;">库存</th>
                <th style="text-align: center; padding: 14px 12px; font-weight: 600; color: #374151; font-size: 13px; border-bottom: 2px solid #e2e8f0;">交期</th>
              </tr>
            </thead>
            <tbody>
              ${data.prices.map((price, index) => `
                <tr style="border-bottom: 1px solid #f1f5f9; transition: all 0.2s ease; cursor: pointer;" onclick="window.open('${getPlatformUrl(price.platform, data.partNumber)}', '_blank');">
                  <td style="padding: 14px 12px; font-weight: 600; color: #1967d2; display: flex; align-items: center;">
                    <div style="width: 8px; height: 8px; background: ${index === 0 ? '#188038' : '#6b7280'}; border-radius: 50%; margin-right: 8px;"></div>
                    ${price.platform}
                  </td>
                  <td style="text-align: right; padding: 14px 12px; font-weight: 700; font-size: 15px; color: ${index === 0 ? '#188038' : '#2c3e50'};">${price.price}</td>
                  <td style="text-align: center; padding: 14px 12px;">
                    <span style="background: ${price.stock > 100 ? '#e6f4ea' : '#fee2e2'}; color: ${price.stock > 100 ? '#188038' : '#ef4444'}; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;">${price.stock}</span>
                  </td>
                  <td style="text-align: center; padding: 14px 12px;">
                    <span style="background: ${price.leadTime === '现货' ? '#e6f4ea' : '#fff3cd'}; color: ${price.leadTime === '现货' ? '#188038' : '#856404'}; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;">${price.leadTime}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div style="font-size: 12px; color: #9ca3af; margin-top: 10px; text-align: right;">
          <span style="display: flex; align-items: center; justify-content: flex-end;">
            <span style="margin-right: 4px;">🔗</span>点击任意一行跳转到对应平台
          </span>
        </div>
      </div>
      
      <!-- 替代料推荐 -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h4 style="margin: 0; font-size: 17px; font-weight: 600; color: #2c3e50; display: flex; align-items: center;">
            <span style="margin-right: 10px; color: #1967d2; font-size: 20px;">🔄</span>
            替代料推荐
          </h4>
          <span style="background: #e8f0fe; color: #1967d2; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">${data.alternatives.length} 个推荐</span>
        </div>
        ${data.alternatives.length > 0 ? data.alternatives.map((alt, index) => `
          <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 16px; border: 1px solid #e2e8f0; transition: all 0.3s ease; cursor: pointer; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);" onclick="window.open('${getPlatformUrl('立创商城', alt.model)}', '_blank');">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
              <div>
                <div style="font-weight: 600; font-size: 16px; color: #2c3e50; margin-bottom: 4px;">${alt.model}</div>
                <div style="font-size: 12px; color: #6b7280; display: flex; align-items: center;">
                  <span style="margin-right: 4px;">🏭</span>来源: ${alt.source}
                </div>
              </div>
              <span style="background: ${alt.type === '直接替代' ? '#e6f4ea' : alt.type === '功能替代' ? '#fff3cd' : '#fee2e2'}; color: ${alt.type === '直接替代' ? '#188038' : alt.type === '功能替代' ? '#856404' : '#dc2626'}; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">${alt.type}</span>
            </div>
            <div style="margin-bottom: 12px;">
              <div style="font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">主要差异:</div>
              <div style="font-size: 13px; color: #4b5563; line-height: 1.5; background: #f9fafb; padding: 12px; border-radius: 8px; border-left: 3px solid #d1d5db;">${alt.differences}</div>
            </div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              ${alt.specs ? Object.entries(alt.specs).map(([key, value]) => `
                <span style="background: #f3f4f6; color: #374151; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500;">${key}: ${value}</span>
              `).join('') : ''}
            </div>
          </div>
        `).join('') : `
          <div style="text-align: center; padding: 40px 20px; color: #9ca3af; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px;">
            <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
            <h5 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #6b7280;">暂无可推荐的替代料</h5>
            <p style="margin: 0; font-size: 13px; color: #9ca3af;">我们会持续关注市场情况，为您提供最新的替代方案</p>
          </div>
        `}
      </div>
    </div>
  `;
  
  // 添加关闭按钮事件
  document.body.appendChild(popup);
  const closeBtn = popup.querySelector('#popup-close');
  closeBtn.addEventListener('click', () => {
    // 添加滑出动画
    popup.classList.add('slide-out');
    // 动画结束后移除弹窗
    setTimeout(() => {
      popup.remove();
    }, 300);
  });
  
  // 添加鼠标悬停效果
  const rows = popup.querySelectorAll('tr');
  rows.forEach(row => {
    if (row.parentElement.tagName === 'TBODY') {
      row.addEventListener('mouseenter', () => {
        row.style.background = '#f8fafc';
        row.style.transform = 'translateX(4px)';
      });
      row.addEventListener('mouseleave', () => {
        row.style.background = 'transparent';
        row.style.transform = 'translateX(0)';
      });
    }
  });
  
  const altDivs = popup.querySelectorAll('div[style*="background: white;"]');
  altDivs.forEach(div => {
    div.addEventListener('mouseenter', () => {
      div.style.transform = 'translateY(-4px)';
      div.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
      div.style.borderColor = '#1967d2';
    });
    div.addEventListener('mouseleave', () => {
      div.style.transform = 'translateY(0)';
      div.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
      div.style.borderColor = '#e2e8f0';
    });
  });
}

// 添加全局动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeInUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  #part-search-popup {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  #part-search-popup.slide-out {
    animation: slideOutRight 0.3s ease-out forwards;
  }
  
  /* 添加渐入动画到弹窗内容 */
  #part-search-popup .popup-content {
    animation: fadeInUp 0.4s ease-out;
  }
`;
document.head.appendChild(style);

// 自动识别网页中的料号（简单实现，可根据实际需求优化）
function autoDetectPartNumbers() {
  // 这里实现简单的料号识别逻辑，例如查找符合特定格式的文本
  // 实际应用中需要更复杂的正则表达式或AI模型
  const partNumberRegex = /[A-Z0-9]{5,20}/g;
  const text = document.body.innerText;
  const matches = text.match(partNumberRegex);
  
  if (matches) {
    console.log('识别到的料号:', matches);
    // 可以在这里添加高亮或其他处理
  }
}

// 页面加载完成后自动识别料号
window.addEventListener('load', autoDetectPartNumbers);
// popup.js - 处理插件弹窗的交互

document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('searchBtn');
  const partNumberInput = document.getElementById('partNumber');
  
  // 点击查询按钮事件
  searchBtn.addEventListener('click', async () => {
    const partNumber = partNumberInput.value.trim();
    if (!partNumber) {
      alert('请输入料号');
      return;
    }
    
    try {
      // 获取当前激活的标签页
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // 向当前标签页发送消息，显示查询结果
      await chrome.tabs.sendMessage(activeTab.id, {
        action: 'showSearchResult',
        partNumber: partNumber
      });
      
      // 关闭弹窗
      window.close();
    } catch (error) {
      console.error('查询失败:', error);
      alert('查询失败，请确保当前标签页支持该功能');
    }
  });
  
  // 回车键查询
  partNumberInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });
});
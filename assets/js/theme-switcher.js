/**
 * 主题切换器 - 用于在普通主题和Figma风格主题之间切换
 */
class ThemeSwitcher {
  constructor() {
    this.init();
  }

  init() {
    // 检查本地存储中的主题设置
    this.currentTheme = localStorage.getItem('preferredTheme') || 'default';
    
    // 创建主题切换按钮
    this.createThemeSwitcher();
    
    // 应用保存的主题
    this.applyTheme(this.currentTheme);
    
    // 监听主题切换事件
    this.addEventListeners();
  }

  createThemeSwitcher() {
    // 创建主题切换UI
    const header = document.querySelector('.content-header');
    if (!header) return;
    
    const themeSwitcherContainer = document.createElement('div');
    themeSwitcherContainer.className = 'theme-switcher';
    themeSwitcherContainer.style.marginLeft = 'auto';
    themeSwitcherContainer.style.marginRight = '15px';
    themeSwitcherContainer.style.display = 'flex';
    themeSwitcherContainer.style.alignItems = 'center';
    
    const switchLabel = document.createElement('span');
    switchLabel.textContent = 'Figma风格';
    switchLabel.style.marginRight = '10px';
    switchLabel.style.fontSize = '14px';
    switchLabel.style.color = '#4b5563';
    
    const switchToggle = document.createElement('label');
    switchToggle.className = 'switch';
    switchToggle.style.position = 'relative';
    switchToggle.style.display = 'inline-block';
    switchToggle.style.width = '40px';
    switchToggle.style.height = '20px';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'theme-toggle';
    checkbox.checked = this.currentTheme === 'figma';
    checkbox.style.opacity = '0';
    checkbox.style.width = '0';
    checkbox.style.height = '0';
    
    const slider = document.createElement('span');
    slider.className = 'slider';
    slider.style.position = 'absolute';
    slider.style.cursor = 'pointer';
    slider.style.top = '0';
    slider.style.left = '0';
    slider.style.right = '0';
    slider.style.bottom = '0';
    slider.style.backgroundColor = '#ccc';
    slider.style.transition = '.4s';
    slider.style.borderRadius = '34px';
    
    slider.innerHTML = `<span style="position: absolute; content: ''; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%; transform: ${this.currentTheme === 'figma' ? 'translateX(20px)' : 'translateX(0)'}"></span>`;
    
    switchToggle.appendChild(checkbox);
    switchToggle.appendChild(slider);
    
    themeSwitcherContainer.appendChild(switchLabel);
    themeSwitcherContainer.appendChild(switchToggle);
    
    // 将主题切换器添加到用户信息前面
    const userInfo = header.querySelector('.user-info');
    if (userInfo) {
      header.insertBefore(themeSwitcherContainer, userInfo);
    } else {
      header.appendChild(themeSwitcherContainer);
    }
  }

  addEventListeners() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    themeToggle.addEventListener('change', () => {
      const newTheme = themeToggle.checked ? 'figma' : 'default';
      this.applyTheme(newTheme);
      localStorage.setItem('preferredTheme', newTheme);
      this.currentTheme = newTheme;
      
      // 更新滑块位置
      const sliderKnob = document.querySelector('.slider span');
      if (sliderKnob) {
        sliderKnob.style.transform = newTheme === 'figma' ? 'translateX(20px)' : 'translateX(0)';
      }
    });
  }

  applyTheme(theme) {
    if (theme === 'figma') {
      document.body.classList.add('figma-theme');
    } else {
      document.body.classList.remove('figma-theme');
    }
    
    // 触发自定义事件，通知其他组件主题已更改
    document.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: theme } 
    }));
  }
}

// 当DOM加载完成后初始化主题切换器
document.addEventListener('DOMContentLoaded', () => {
  window.themeSwitcher = new ThemeSwitcher();
}); 
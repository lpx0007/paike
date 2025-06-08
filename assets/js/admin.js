/**
 * 管理后台功能
 * 处理管理员界面的交互和数据管理
 */
class AdminManager {
  constructor() {
    this.currentUser = null;
    this.teachers = [];
    this.rooms = [];
    this.schedules = [];
    this.currentSection = 'dashboard';
    
    this.init();
  }
  
  async init() {
    // 检查用户权限
    this.checkAdminPermission();
    
    // 清除可能存在的缓存问题
    this.clearDataCache();

    // 加载数据
    await this.loadData();
    
    // 设置事件监听
    this.setupEventListeners();
    
    // 加载初始视图
    this.loadDashboard();
  }
  
  // 清除数据缓存，解决数据不一致问题
  clearDataCache() {
    console.log('检查数据缓存状态...');
    
    // 检查localStorage中的数据版本
    const dataVersion = localStorage.getItem('dataVersion');
    const currentVersion = '1.0.1'; // 更新版本号
    
    if (dataVersion !== currentVersion) {
      console.log('数据版本不一致，清除缓存并重新加载数据');
      
      // 保留用户登录状态，但不清除全部数据
      // 之前的做法太激进了，导致数据全部丢失
      // localStorage.removeItem('teachers');
      // localStorage.removeItem('rooms');
      // localStorage.removeItem('schedules');
      // localStorage.removeItem('courseCategoriesData');
      
      // 设置新的数据版本
      localStorage.setItem('dataVersion', currentVersion);
      
      console.log('数据版本已更新');
    } else {
      console.log('数据版本一致，无需清除缓存');
    }
  }

  // 强制初始化默认数据，用于数据丢失的紧急恢复
  forceInitDefaultData() {
    console.log('强制初始化默认数据...');
    
    // 初始化教师数据
    this.teachers = [
      {
        "id": 1,
        "teacherId": 1,
        "name": "杨小菲",
        "subject": ["钢琴", "声乐"],
        "avatar": "teacher1.jpg",
        "phone": "13800138001",
        "email": "teacher1@example.com",
        "color": "#4361ee"
      },
      {
        "id": 2,
        "teacherId": 2,
        "name": "李老师",
        "subject": ["钢琴"],
        "avatar": "teacher2.jpg",
        "phone": "13800138002",
        "email": "teacher2@example.com",
        "color": "#3a0ca3"
      },
      {
        "id": 3,
        "teacherId": 3,
        "name": "王老师",
        "subject": ["声乐", "艺考"],
        "avatar": "teacher3.jpg",
        "phone": "13800138003",
        "email": "teacher3@example.com",
        "color": "#7209b7"
      },
      {
        "id": 4,
        "teacherId": 4,
        "name": "刘老师",
        "subject": ["675"],
        "avatar": "teacher4.jpg",
        "phone": "13800138004",
        "email": "teacher4@example.com",
        "color": "#4cc9f0"
      },
      {
        "id": 5,
        "teacherId": 5,
        "name": "赵老师",
        "subject": ["艺考"],
        "avatar": "teacher5.jpg",
        "phone": "13800138005",
        "email": "teacher5@example.com",
        "color": "#f72585"
      }
    ];
    
    // 初始化教室数据
    this.rooms = [
      {
        "id": "1",
        "name": "教室1",
        "capacity": 30,
        "equipment": ["投影仪", "电子白板"]
      },
      {
        "id": "2",
        "name": "教室2",
        "capacity": 25,
        "equipment": ["电子白板"]
      },
      {
        "id": "3",
        "name": "教室3",
        "capacity": 20,
        "equipment": ["投影仪", "电子白板", "音响系统"]
      }
    ];
    
    // 初始化课程数据
    const today = new Date();
    const todayString = this.formatDateToString(today);
    
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowString = this.formatDateToString(tomorrow);
    
    this.schedules = [
      {
        "id": 101,
        "teacherId": 1,
        "subject": "钢琴",
        "date": todayString,
        "startTime": "09:00",
        "endTime": "10:30",
        "room": "1",
        "students": ["学生1", "学生2", "学生3"],
        "color": "#4cc9f0"
      },
      {
        "id": 102,
        "teacherId": 2,
        "subject": "钢琴",
        "date": todayString,
        "startTime": "11:00",
        "endTime": "12:30",
        "room": "2",
        "students": ["学生4", "学生5"],
        "color": "#4361ee"
      },
      {
        "id": 103,
        "teacherId": 1,
        "subject": "声乐",
        "date": todayString,
        "startTime": "14:00",
        "endTime": "15:30",
        "room": "1",
        "students": ["学生1", "学生6", "学生7"],
        "color": "#3a0ca3"
      },
      {
        "id": 104,
        "teacherId": 3,
        "subject": "艺考",
        "date": tomorrowString,
        "startTime": "09:00",
        "endTime": "11:00",
        "room": "3",
        "students": ["学生8", "学生9", "学生10", "学生11"],
        "color": "#7209b7"
      }
    ];
    
    // 保存数据到localStorage
    this.saveData();
    console.log('默认数据已初始化并保存到localStorage');
    
    return true;
  }

  // 获取今天的日期字符串 YYYY-MM-DD
  formatDateToString(date) {
    if (!date || !(date instanceof Date)) {
      date = new Date();
    }
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  loadDataFromStorage() {
    try {
      console.log('尝试从localStorage加载数据...');
      
      // 获取教师数据
      const teachersData = localStorage.getItem('teachers');
      if (teachersData) {
        this.teachers = JSON.parse(teachersData);
        console.log(`已从localStorage加载 ${this.teachers.length} 条教师数据`);
    } else {
        console.log('localStorage中没有教师数据');
        return false;
      }
      
      // 获取教室数据
      const roomsData = localStorage.getItem('rooms');
      if (roomsData) {
        this.rooms = JSON.parse(roomsData);
        console.log(`已从localStorage加载 ${this.rooms.length} 条教室数据`);
      } else {
        console.log('localStorage中没有教室数据');
        return false;
      }
      
      // 获取课程安排数据
      const schedulesData = localStorage.getItem('schedules');
      if (schedulesData) {
        this.schedules = JSON.parse(schedulesData);
        console.log(`已从localStorage加载 ${this.schedules.length} 条课程数据`);
      } else {
        console.log('localStorage中没有课程安排数据');
        return false;
      }
      
      // 检查数据有效性
      if (this.teachers.length === 0 || this.rooms.length === 0) {
        console.log('加载的数据无效');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('从localStorage加载数据失败:', error);
      return false;
    }
  }

  // 处理页面首次加载时渲染教师列表
  setupInitialRendering() {
    // 确保所有数据已加载
    if (this.teachers.length > 0) {
      console.log('开始渲染教师列表...');
      // 根据当前页面重新加载数据
      if (this.currentSection === 'dashboard') {
        this.loadDashboard();
      } else if (this.currentSection === 'teachers') {
        this.loadTeachersSection();
      } else if (this.currentSection === 'courses') {
        this.loadCoursesSection();
      }
    } else {
      console.warn('教师数据为空，无法渲染列表');
    }
  }

  saveData() {
    try {
      // 保存教师数据
      localStorage.setItem('teachers', JSON.stringify(this.teachers));
      
      // 保存教室数据
      localStorage.setItem('rooms', JSON.stringify(this.rooms));
      
      // 保存课程安排数据
      localStorage.setItem('schedules', JSON.stringify(this.schedules));
      
      console.log('所有数据已成功保存到localStorage');
      return true;
    } catch (error) {
      console.error('保存数据到localStorage失败:', error);
      return false;
    }
  }
  
  async loadData() {
    console.log('开始加载数据...');
    
    // 尝试从localStorage加载数据
    const loadedFromStorage = this.loadDataFromStorage();
    
    // 如果从localStorage加载失败，则尝试加载默认数据
    if (!loadedFromStorage) {
      console.log('从localStorage加载数据失败，尝试加载默认数据...');
      
      try {
        // 由于CORS限制，直接从本地文件加载数据会失败
        // 所以直接使用内置的默认数据
        this.forceInitDefaultData();
      } catch (error) {
        console.error('加载默认数据失败:', error);
        // 使用备用数据
        await Promise.all([
          this.loadTeachers(),
          this.loadRooms(),
          this.loadSchedules()
        ]);
        
        // 保存数据到localStorage
        this.saveData();
      }
    }
    
    // 记录加载到的数据
    console.log(`已加载 ${this.teachers.length} 名教师数据`);
    console.log(`已加载 ${this.rooms.length} 间教室数据`);
    console.log(`已加载 ${this.schedules.length} 条课程数据`);
    
    console.log('所有数据已成功加载到localStorage');
    
    // 确保在页面加载后初始化渲染
    setTimeout(() => {
      this.setupInitialRendering();
    }, 100);
  }

  async loadTeachersFromServer() {
    try {
      const response = await fetch('data/teachers.json');
      if (response.ok) {
        this.teachers = await response.json();
        console.log('从服务器加载了教师数据');
        return true;
      } else {
        throw new Error('无法加载教师数据');
      }
    } catch (error) {
      console.error('从服务器加载教师数据失败:', error);
      return false;
    }
  }

  async loadRoomsFromServer() {
    try {
      const response = await fetch('data/rooms.json');
      if (response.ok) {
        this.rooms = await response.json();
        console.log('从服务器加载了教室数据');
        return true;
      } else {
        throw new Error('无法加载教室数据');
      }
    } catch (error) {
      console.error('从服务器加载教室数据失败:', error);
      return false;
    }
  }

  async loadSchedulesFromServer() {
    try {
      const response = await fetch('data/schedule.json');
      if (response.ok) {
        this.schedules = await response.json();
        console.log('从服务器加载了课程安排数据');
        return true;
      } else {
        throw new Error('无法加载课程安排数据');
      }
    } catch (error) {
      console.error('从服务器加载课程安排数据失败:', error);
      return false;
    }
  }
  
  checkAdminPermission() {
    // 检查当前用户是否是管理员
    if (window.authManager) {
      this.currentUser = window.authManager.getCurrentUser();
      
      if (!this.currentUser || this.currentUser.role !== 'admin') {
        // 不是管理员，重定向到登录页
        window.location.href = 'login.html';
      }
    } else {
      // 没有认证信息，重定向到登录页
      window.location.href = 'login.html';
    }
  }
  
  async loadTeachers() {
    // 尝试从localStorage加载数据
    try {
      const teachersData = localStorage.getItem('teachers');
      if (teachersData) {
        this.teachers = JSON.parse(teachersData);
        console.log('从localStorage加载了教师数据:', this.teachers);
      } else {
        // 如果没有找到数据，则使用默认数据
    this.teachers = [
      {
            "id": 1,
            "teacherId": 1,
            "name": "杨小菲",
            "subject": ["钢琴", "声乐"],
            "avatar": "teacher1.jpg",
            "phone": "13800138001",
            "email": "teacher1@example.com",
            "color": "#4361ee"
          },
          {
            "id": 2,
            "teacherId": 2,
            "name": "李老师",
            "subject": ["钢琴"],
            "avatar": "teacher2.jpg",
            "phone": "13800138002",
            "email": "teacher2@example.com",
            "color": "#3a0ca3"
          },
          {
            "id": 3,
            "teacherId": 3,
            "name": "王老师",
            "subject": ["声乐", "艺考"],
            "avatar": "teacher3.jpg",
            "phone": "13800138003",
            "email": "teacher3@example.com",
            "color": "#7209b7"
          },
          {
            "id": 4,
            "teacherId": 4,
            "name": "刘老师",
            "subject": ["675"],
            "avatar": "teacher4.jpg",
            "phone": "13800138004",
            "email": "teacher4@example.com",
            "color": "#4cc9f0"
          },
          {
            "id": 5,
            "teacherId": 5,
            "name": "赵老师",
            "subject": ["艺考"],
            "avatar": "teacher5.jpg",
            "phone": "13800138005",
            "email": "teacher5@example.com",
            "color": "#f72585"
          }
        ];
        
        // 保存到localStorage
        localStorage.setItem('teachers', JSON.stringify(this.teachers));
        console.log('已保存默认教师数据到localStorage');
      }
      
      // 检查教师数据有效性
      if (!Array.isArray(this.teachers) || this.teachers.length === 0) {
        throw new Error('教师数据无效');
      }
    } catch (error) {
      console.error('加载教师数据失败:', error);
      // 在加载失败的情况下，仍然使用默认数据
      this.teachers = [
        {
          "id": 1,
          "teacherId": 1,
          "name": "杨小菲",
          "subject": ["钢琴", "声乐"],
          "avatar": "teacher1.jpg",
          "phone": "13800138001",
          "email": "teacher1@example.com",
          "color": "#4361ee"
        },
        {
          "id": 2,
          "teacherId": 2,
          "name": "李老师",
          "subject": ["钢琴"],
          "avatar": "teacher2.jpg",
          "phone": "13800138002",
          "email": "teacher2@example.com",
          "color": "#3a0ca3"
        },
        {
          "id": 3,
          "teacherId": 3,
          "name": "王老师",
          "subject": ["声乐", "艺考"],
          "avatar": "teacher3.jpg",
          "phone": "13800138003",
          "email": "teacher3@example.com",
          "color": "#7209b7"
        },
        {
          "id": 4,
          "teacherId": 4,
          "name": "刘老师",
          "subject": ["675"],
          "avatar": "teacher4.jpg",
          "phone": "13800138004",
          "email": "teacher4@example.com",
          "color": "#4cc9f0"
        },
        {
          "id": 5,
          "teacherId": 5,
          "name": "赵老师",
          "subject": ["艺考"],
          "avatar": "teacher5.jpg",
          "phone": "13800138005",
          "email": "teacher5@example.com",
          "color": "#f72585"
        }
      ];
    }
  }
  
  async loadRooms() {
    // 尝试从localStorage加载数据
    try {
      const roomsData = localStorage.getItem('rooms');
      if (roomsData) {
        this.rooms = JSON.parse(roomsData);
        console.log('从localStorage加载了教室数据:', this.rooms);
      } else {
        // 如果没有找到数据，则使用默认数据
    this.rooms = [
      {
            "id": "1",
            "name": "教室1",
            "capacity": 30,
            "equipment": ["投影仪", "电子白板"]
          },
          {
            "id": "2",
            "name": "教室2",
            "capacity": 25,
            "equipment": ["电子白板"]
          },
          {
            "id": "3",
            "name": "教室3",
            "capacity": 20,
            "equipment": ["投影仪", "电子白板", "音响系统"]
          }
        ];
        
        // 保存到localStorage
        localStorage.setItem('rooms', JSON.stringify(this.rooms));
        console.log('已保存默认教室数据到localStorage');
      }
      
      // 检查教室数据有效性
      if (!Array.isArray(this.rooms) || this.rooms.length === 0) {
        throw new Error('教室数据无效');
      }
    } catch (error) {
      console.error('加载教室数据失败:', error);
      // 在加载失败的情况下，仍然使用默认数据
      this.rooms = [
        {
          "id": "1",
          "name": "教室1",
          "capacity": 30,
          "equipment": ["投影仪", "电子白板"]
        },
        {
          "id": "2",
          "name": "教室2",
          "capacity": 25,
          "equipment": ["电子白板"]
        },
        {
          "id": "3",
          "name": "教室3",
          "capacity": 20,
          "equipment": ["投影仪", "电子白板", "音响系统"]
        }
      ];
    }
  }
  
  async loadSchedules() {
    // 尝试从localStorage加载数据
    try {
      const schedulesData = localStorage.getItem('schedules');
      if (schedulesData) {
        this.schedules = JSON.parse(schedulesData);
        console.log('从localStorage加载了课程数据:', this.schedules);
      } else {
        // 如果没有找到数据，则使用默认数据
    const today = new Date();
    const todayString = this.formatDateToString(today);
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
    const tomorrowString = this.formatDateToString(tomorrow);
    
    this.schedules = [
      {
            "id": 101,
            "teacherId": 1,
            "subject": "钢琴",
            "date": todayString,
            "startTime": "09:00",
            "endTime": "10:30",
            "room": "1",
            "students": ["学生1", "学生2", "学生3"],
            "color": "#4cc9f0"
          },
          {
            "id": 102,
            "teacherId": 2,
            "subject": "钢琴",
            "date": todayString,
            "startTime": "11:00",
            "endTime": "12:30",
            "room": "2",
            "students": ["学生4", "学生5"],
            "color": "#4361ee"
          },
          {
            "id": 103,
            "teacherId": 1,
            "subject": "声乐",
            "date": todayString,
            "startTime": "14:00",
            "endTime": "15:30",
            "room": "1",
            "students": ["学生1", "学生6", "学生7"],
            "color": "#3a0ca3"
          },
          {
            "id": 104,
            "teacherId": 3,
            "subject": "艺考",
            "date": tomorrowString,
            "startTime": "09:00",
            "endTime": "11:00",
            "room": "3",
            "students": ["学生8", "学生9", "学生10", "学生11"],
            "color": "#7209b7"
          }
        ];
        
        // 保存到localStorage
        localStorage.setItem('schedules', JSON.stringify(this.schedules));
        console.log('已保存默认课程数据到localStorage');
      }
      
      // 检查课程数据有效性
      if (!Array.isArray(this.schedules) || this.schedules.length === 0) {
        throw new Error('课程数据无效');
      }
    } catch (error) {
      console.error('加载课程数据失败:', error);
      // 在加载失败的情况下，仍然使用一些默认数据
      const today = new Date();
      const todayString = this.formatDateToString(today);
      
      this.schedules = [
        {
          "id": 101,
          "teacherId": 1,
          "subject": "钢琴",
          "date": todayString,
          "startTime": "09:00",
          "endTime": "10:30",
          "room": "1",
          "students": ["学生1", "学生2"],
          "color": "#4cc9f0"
        }
      ];
    }
  }
  
  setupEventListeners() {
    // 侧边栏导航
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.currentTarget.getAttribute('href').substring(1);
        this.changeSection(section);
      });
    });
    
    // 移动端侧边栏切换
    const toggleBtn = document.getElementById('toggle-sidebar');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
          sidebar.classList.toggle('open');
        }
      });
    }
  }
  
  changeSection(section) {
    // 移除当前激活的导航项
    document.querySelector('.nav-item.active')?.classList.remove('active');
    
    // 激活新的导航项
    document.querySelector(`.nav-item[href="#${section}"]`)?.classList.add('active');
    
    // 更新当前部分
    this.currentSection = section;
    
    // 加载相应部分的内容
    switch (section) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'teachers':
        this.loadTeachersSection();
        break;
      case 'courses':
        this.loadCoursesSection();
        break;
      case 'rooms':
        this.loadRoomsSection();
        break;
      case 'settings':
        this.loadSettingsSection();
        break;
    }
    
    // 更新页面标题
    const pageTitle = document.querySelector('.content-header h1');
    if (pageTitle) {
      pageTitle.textContent = this.getSectionTitle(section);
    }
  }
  
  getSectionTitle(section) {
    const titles = {
      'dashboard': '仪表盘',
      'teachers': '教师管理',
      'courses': '课程管理',
      'settings': '系统设置'
    };
    
    return titles[section] || '未知页面';
  }
  
  loadDashboard() {
    this.currentSection = 'dashboard';
    
    const content = document.querySelector('.content');
    content.innerHTML = `
      <header class="content-header">
        <h1>仪表盘</h1>
        <div class="user-info">
          <img src="assets/img/admin-avatar.png" alt="管理员头像" class="avatar">
          <span class="username">${this.currentUser ? this.currentUser.name : '系统管理员'}</span>
        </div>
      </header>
      
      <div class="dashboard">
        <div class="stat-cards">
          <div class="stat-card">
            <div class="stat-value">${this.teachers.length}</div>
            <div class="stat-label">教师总数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${this.schedules.length}</div>
            <div class="stat-label">本周课程数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${this.rooms.length}</div>
            <div class="stat-label">教室总数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${this.calculateRoomUtilization()}%</div>
            <div class="stat-label">教室利用率</div>
          </div>
        </div>
        
        <div class="chart-container">
          <h3>教室使用情况</h3>
          <div class="chart">
            <div class="chart-placeholder">教室使用率图表</div>
          </div>
        </div>
        
        <div class="recent-activity">
          <h3>最近活动</h3>
          <ul class="activity-list">
            ${this.generateRecentActivities()}
          </ul>
        </div>
      </div>
    `;
  }
    
    // 计算教室利用率
  calculateRoomUtilization() {
    if (this.rooms.length === 0) return 0;
    
    const totalRooms = this.rooms.length;
    const usedRooms = new Set(this.schedules.map(s => s.room)).size;
    
    return Math.round((usedRooms / totalRooms) * 100);
  }
  
  // 生成最近活动列表
  generateRecentActivities() {
    // 这里可以实现实际的活动记录逻辑
    return `
      <li class="activity-item">
        <div class="activity-icon">➕</div>
        <div class="activity-content">
          <div class="activity-title">新教师已添加</div>
          <div class="activity-time">10分钟前</div>
        </div>
      </li>
      <li class="activity-item">
        <div class="activity-icon">🔄</div>
        <div class="activity-content">
          <div class="activity-title">课程时间已更新</div>
          <div class="activity-time">30分钟前</div>
        </div>
      </li>
      <li class="activity-item">
        <div class="activity-icon">❌</div>
        <div class="activity-content">
          <div class="activity-title">课程已取消</div>
          <div class="activity-time">2小时前</div>
        </div>
      </li>
    `;
  }
  
  loadTeachersSection() {
    this.currentSection = 'teachers';
    
    const content = document.querySelector('.content');
    content.innerHTML = `
      <header class="content-header">
        <h1>教师管理</h1>
        <div class="user-info">
          <img src="assets/img/admin-avatar.png" alt="管理员头像" class="avatar">
          <span class="username">${this.currentUser ? this.currentUser.name : '管理员'}</span>
        </div>
      </header>
      
        <div class="action-bar">
          <div class="search-box">
            <input type="text" id="teacher-search" placeholder="搜索教师...">
          </div>
        <button id="add-teacher" class="primary-btn">
          <span class="btn-icon">➕</span>添加教师
        </button>
        <button id="export-all-teachers-data" class="secondary-btn">
          <span class="btn-icon">📊</span>导出课程数据(JSON)
        </button>
        <button id="export-all-teachers-csv" class="secondary-btn">
          <span class="btn-icon">📄</span>导出课程数据(CSV)
        </button>
          </button>
        </div>

        <div class="teacher-list-container">
        <table class="data-table" id="teachers-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>姓名</th>
              <th>科目</th>
              <th>颜色</th>
                <th>操作</th>
              </tr>
            </thead>
          <tbody id="teachers-list">
            <!-- 教师列表将在JS中填充 -->
            </tbody>
          </table>
      </div>
    `;
    
    // 渲染教师列表
    this.renderTeachersList();
    
    // 设置事件监听器
    this.setupTeachersEventListeners();
  }
  
  renderTeachersList() {
    const tableBody = document.getElementById('teachers-list');
    if (!tableBody) return;
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 按ID排序
    const sortedTeachers = [...this.teachers].sort((a, b) => a.id - b.id);
    
    // 为每个教师添加行
    sortedTeachers.forEach(teacher => {
      // 计算每个教师的课程数量
      const teacherSchedules = this.schedules.filter(s => s.teacherId === teacher.id);
      const scheduleSummary = `${teacherSchedules.length} 课时 / 本周`;
      
      // 创建表格行
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${teacher.id}</td>
        <td>
          <div class="teacher-name">
            <span class="avatar-small" style="background-color:${teacher.color}">${teacher.name.substring(0, 1)}</span>
            ${teacher.name}
          </div>
        </td>
        <td>${Array.isArray(teacher.subject) ? teacher.subject.join(', ') : teacher.subject || '未设置'}</td>
        <td>
          <div class="contact-info">
            <div>${teacher.phone || '无联系电话'}</div>
            <div>${teacher.email || '无电子邮箱'}</div>
          </div>
        </td>
        <td>
          <span class="schedule-badge" title="查看详细排课信息">${scheduleSummary}</span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="icon-btn view-btn" data-id="${teacher.id}" title="查看排课情况">
              <span class="icon">👁️</span>
            </button>
            <button class="icon-btn edit-btn" data-id="${teacher.id}" title="编辑">
              <span class="icon">✏️</span>
            </button>
            <button class="icon-btn delete-btn" data-id="${teacher.id}" title="删除">
              <span class="icon">🗑️</span>
            </button>
          </div>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
  }
  
  renderRoomsList() {
    const tableBody = document.getElementById('room-list');
    if (!tableBody) return;
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 按ID排序
    const sortedRooms = [...this.rooms].sort((a, b) => a.id.localeCompare(b.id));
    
    // 为每个教室添加行
    sortedRooms.forEach(room => {
      // 计算教室使用情况
      const roomSchedules = this.schedules.filter(s => s.room === room.id);
      const usageSummary = `${roomSchedules.length} 课时`;
      
      // 创建表格行
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${room.id}</td>
        <td>${room.name}</td>
        <td>${room.capacity} 人</td>
        <td>${Array.isArray(room.equipment) ? room.equipment.join(', ') : '无特殊设备'}</td>
        <td>
          <span class="usage-badge" title="查看详细使用情况">${usageSummary}</span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="icon-btn view-btn" data-id="${room.id}" title="查看使用详情">
              <span class="icon">👁️</span>
            </button>
            <button class="icon-btn edit-btn" data-id="${room.id}" title="编辑">
              <span class="icon">✏️</span>
            </button>
            <button class="icon-btn delete-btn" data-id="${room.id}" title="删除">
              <span class="icon">🗑️</span>
            </button>
          </div>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
  }
  
  setupTeachersEventListeners() {
    // 添加教师按钮
    document.getElementById('add-teacher')?.addEventListener('click', () => {
      this.showTeacherForm();
    });
    
    // 导出所有教师课程数据JSON格式按钮
    document.getElementById('export-all-teachers-data')?.addEventListener('click', () => {
      this.exportTeacherScheduleData();
    });
    
    // 导出所有教师课程数据CSV格式按钮
    document.getElementById('export-all-teachers-csv')?.addEventListener('click', () => {
      this.exportTeacherScheduleAsCSV();
    });
    
    // 搜索框
    document.getElementById('teacher-search')?.addEventListener('input', (e) => {
      this.filterTeachers(e.target.value);
    });
    
    // 添加教室按钮
    const addRoomBtn = document.getElementById('add-room-btn');
    if (addRoomBtn) {
      addRoomBtn.addEventListener('click', () => this.showRoomForm());
    }
    
    // 搜索教室
    const roomSearchInput = document.getElementById('room-search');
    if (roomSearchInput) {
      roomSearchInput.addEventListener('input', (e) => this.filterRooms(e.target.value));
    }
    
    // 页签切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // 移除所有active类
        tabBtns.forEach(b => b.classList.remove('active'));
        // 添加active到当前按钮
        e.currentTarget.classList.add('active');
        
        // 获取目标tab内容
        const targetTabId = e.currentTarget.getAttribute('data-tab') + '-tab';
        
        // 隐藏所有tab内容
        document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
        
        // 显示目标tab内容
        const targetTab = document.getElementById(targetTabId);
        if (targetTab) {
          targetTab.classList.remove('hidden');
        }
      });
    });
    
    // 教师表格操作按钮
    document.querySelectorAll('#teachers-table .edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const teacherId = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        const teacher = this.teachers.find(t => t.id === teacherId);
        if (teacher) {
          this.showTeacherForm(teacher);
        }
      });
    });
    
    document.querySelectorAll('#teachers-table .delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const teacherId = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        this.deleteTeacher(teacherId);
      });
    });
    
    document.querySelectorAll('#teachers-table .view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const teacherId = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        this.showTeacherSchedules(teacherId);
      });
    });
    
    // 教室表格操作按钮
    document.querySelectorAll('#room-list .edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const roomId = e.currentTarget.getAttribute('data-id');
        const room = this.rooms.find(r => r.id === roomId);
        if (room) {
          this.showRoomForm(room);
        }
      });
    });
    
    document.querySelectorAll('#room-list .delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const roomId = e.currentTarget.getAttribute('data-id');
        this.deleteRoom(roomId);
      });
    });
    
    document.querySelectorAll('#room-list .view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const roomId = e.currentTarget.getAttribute('data-id');
        this.showRoomUsage(roomId);
      });
    });
  }
  
  filterTeachers(searchTerm) {
    const tableBody = document.getElementById('teachers-list');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    const lowercaseSearch = searchTerm.toLowerCase();
    
    rows.forEach(row => {
      const name = row.querySelector('.teacher-name').textContent.toLowerCase();
      const subject = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
      
      if (name.includes(lowercaseSearch) || subject.includes(lowercaseSearch)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }
  
  filterRooms(searchTerm) {
    const tableBody = document.getElementById('room-list');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    const lowercaseSearch = searchTerm.toLowerCase();
    
    rows.forEach(row => {
      const id = row.querySelector('td:first-child').textContent.toLowerCase();
      const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
      
      if (id.includes(lowercaseSearch) || name.includes(lowercaseSearch)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }
  
  showTeacherForm(teacher = null) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const isEditing = !!teacher;
    
    // 模态框内容
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isEditing ? '编辑教师' : '添加教师'}</h3>
          <button class="close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="teacher-form">
            <div class="form-group">
              <label for="teacher-name">姓名</label>
              <input type="text" id="teacher-name" required value="${isEditing ? teacher.name : ''}">
            </div>
            <div class="form-group">
              <label for="teacher-subjects">学科（多个学科用逗号分隔）</label>
              <input type="text" id="teacher-subjects" value="${isEditing && teacher.subject ? teacher.subject.join(', ') : ''}">
            </div>
            <div class="form-group">
              <label for="teacher-phone">联系电话</label>
              <input type="tel" id="teacher-phone" value="${isEditing && teacher.phone ? teacher.phone : ''}">
            </div>
            <div class="form-group">
              <label for="teacher-email">电子邮箱</label>
              <input type="email" id="teacher-email" value="${isEditing && teacher.email ? teacher.email : ''}">
            </div>
            <div class="form-group">
              <label for="teacher-username">登录用户名</label>
              <input type="text" id="teacher-username" required value="${isEditing && teacher.username ? teacher.username : ''}">
            </div>
            <div class="form-group">
              <label for="teacher-password">密码${isEditing ? '（留空则不更改）' : ''}</label>
              <input type="password" id="teacher-password" ${!isEditing ? 'required' : ''}>
            </div>
            <div class="form-group">
              <label>颜色</label>
              <div class="color-picker">
                <div class="color-option" data-color="#4cc9f0"></div>
                <div class="color-option" data-color="#4361ee"></div>
                <div class="color-option" data-color="#3a0ca3"></div>
                <div class="color-option" data-color="#7209b7"></div>
                <div class="color-option" data-color="#f72585"></div>
              </div>
            </div>
            ${isEditing ? `<input type="hidden" id="teacher-id" value="${teacher.id}">` : ''}
            <button type="submit" class="btn-submit">${isEditing ? '保存更改' : '添加教师'}</button>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 显示模态框
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
    
    // 初始化颜色选择器
    const colorOptions = modal.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
      const color = option.getAttribute('data-color');
      option.style.backgroundColor = color;
      
      if (isEditing && teacher.color === color) {
        option.classList.add('selected');
      }
      
      option.addEventListener('click', () => {
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
      });
    });
    
    // 如果没有选中任何颜色，默认选择第一个
    if (!modal.querySelector('.color-option.selected')) {
      const firstOption = modal.querySelector('.color-option');
      if (firstOption) {
        firstOption.classList.add('selected');
      }
    }
    
    // 注册关闭按钮事件
    const closeButton = modal.querySelector('.close');
    closeButton.addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    });
    
    // 注册表单提交事件
    const form = modal.querySelector('#teacher-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (isEditing) {
        this.updateTeacher(form, modal);
      } else {
        this.addTeacher(form, modal);
      }
    });
  }
  
  addTeacher(form, modal) {
    // 获取表单数据
    const name = document.getElementById('teacher-name').value;
    const subjects = document.getElementById('teacher-subjects').value.split(',').map(s => s.trim()).filter(s => s);
    const phone = document.getElementById('teacher-phone').value;
    const email = document.getElementById('teacher-email').value;
    const username = document.getElementById('teacher-username').value;
    const password = document.getElementById('teacher-password').value;
    const selectedColor = form.querySelector('.color-option.selected');
    const color = selectedColor ? selectedColor.getAttribute('data-color') : '#4cc9f0';
    
    // 验证数据
    if (!name || !username || !password) {
      alert('请填写必填字段');
      return;
    }
    
    // 检查用户名是否已存在
    if (this.teachers.some(t => t.username && t.username.toLowerCase() === username.toLowerCase())) {
      alert('用户名已存在');
      return;
    }
    
    // 生成新ID
    const newId = this.teachers.length > 0 ? Math.max(...this.teachers.map(t => t.id)) + 1 : 1;
    
    // 创建新教师对象
    const newTeacher = {
      id: newId,
      name: name,
      subject: subjects,
      phone: phone,
      email: email,
      username: username,
      password: password, // 实际应用中应该加密
      color: color,
      role: 'teacher'
    };
    
    // 添加到教师数组
    this.teachers.push(newTeacher);
    
    // 保存数据到localStorage
    this.saveData();
    
    // 重新渲染教师列表
    this.reloadTeachersSection();
    
    // 关闭模态框
    modal.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(modal);
    }, 300);
    
    // 显示成功消息
    this.showToast('教师添加成功');
  }
  
  updateTeacher(form, modal) {
    // 获取表单数据
    const id = parseInt(document.getElementById('teacher-id').value);
    const name = document.getElementById('teacher-name').value;
    const subjects = document.getElementById('teacher-subjects').value.split(',').map(s => s.trim()).filter(s => s);
    const phone = document.getElementById('teacher-phone').value;
    const email = document.getElementById('teacher-email').value;
    const username = document.getElementById('teacher-username').value;
    const password = document.getElementById('teacher-password').value;
    const selectedColor = form.querySelector('.color-option.selected');
    const color = selectedColor ? selectedColor.getAttribute('data-color') : '#4cc9f0';
    
    // 验证数据
    if (!name || !username) {
      alert('请填写必填字段');
      return;
    }
    
    // 检查用户名是否已被其他教师使用
    if (this.teachers.some(t => t.id !== id && t.username && t.username.toLowerCase() === username.toLowerCase())) {
      alert('用户名已存在');
      return;
    }
    
    // 查找要更新的教师
    const teacherIndex = this.teachers.findIndex(t => t.id === id);
    if (teacherIndex === -1) {
      alert('未找到教师');
      return;
    }
    
    // 更新教师信息
    const updatedTeacher = {
      ...this.teachers[teacherIndex],
      name: name,
      subject: subjects,
      phone: phone,
      email: email,
      username: username,
      color: color
    };
    
    // 如果提供了新密码，则更新密码
    if (password) {
      updatedTeacher.password = password; // 实际应用中应该加密
    }
    
    // 更新教师数组
    this.teachers[teacherIndex] = updatedTeacher;
    
    // 保存数据到localStorage
    this.saveData();
    
    // 重新渲染教师列表
    this.reloadTeachersSection();
    
    // 关闭模态框
    modal.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(modal);
    }, 300);
    
    // 显示成功消息
    this.showToast('教师信息已更新');
  }
  
  deleteTeacher(teacherId) {
    // 确认删除
    if (!confirm('确定要删除此教师吗？此操作不可撤销，且会删除与该教师相关的所有课程。')) {
      return;
    }
    
    // 从数组中删除教师
    this.teachers = this.teachers.filter(t => t.id !== teacherId);
    
    // 同时删除相关的课程
    this.schedules = this.schedules.filter(s => s.teacherId !== teacherId);
    
    // 保存数据到localStorage
    this.saveData();
    
    // 重新渲染教师列表
    this.reloadTeachersSection();
    
    // 显示成功消息
    this.showToast('教师已删除');
  }
  
  reloadTeachersSection() {
    // 重新加载教师管理界面
    if (this.currentSection === 'teachers') {
      this.loadTeachersSection();
    }
  }
  
  showToast(message) {
    // 创建提示框
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 显示提示框
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 500);
    }, 3000);
  }
  
  loadCoursesSection() {
    this.currentSection = 'courses';
    
    // 获取所有课程类别
    const courseCategories = this.getCourseCategories();
    
    const content = document.querySelector('.content');
    content.innerHTML = `
      <header class="content-header">
        <h1>课程管理</h1>
        <div class="user-info">
          <img src="assets/img/admin-avatar.png" alt="管理员头像" class="avatar">
          <span class="username">${this.currentUser ? this.currentUser.name : '系统管理员'}</span>
        </div>
      </header>
      
      <div class="action-bar">
          <div class="search-box">
            <input type="text" id="course-search" placeholder="搜索课程...">
          </div>
        <div class="filter-container">
          <select id="category-filter">
            <option value="">所有课程类别</option>
            ${courseCategories.map(category => `<option value="${category}">${category}</option>`).join('')}
            </select>
          </div>
        <button id="add-category-btn" class="secondary-btn">
          <span class="btn-icon">+</span> 添加课程类别
        </button>
        <button id="delete-category-btn" class="danger-btn">
          <span class="btn-icon">-</span> 删除课程类别
        </button>
        </div>

      <div class="course-list-container">
        <h3>课程类别列表</h3>
          <table class="data-table">
            <thead>
              <tr>
              <th>课程类别名称</th>
              <th>课程数量</th>
              <th>授课教师数</th>
            </tr>
          </thead>
          <tbody id="category-list">
            <!-- 课程类别将在渲染时填充 -->
          </tbody>
        </table>
      </div>
      
      <div class="course-schedules">
        <h3>课程安排</h3>
        <table class="data-table">
          <thead>
            <tr>
                <th>课程名称</th>
              <th>课程类别</th>
                <th>教师</th>
                <th>日期</th>
                <th>时间</th>
                <th>教室</th>
              <th>学生数</th>
                <th>操作</th>
              </tr>
            </thead>
          <tbody id="course-list">
            <!-- 课程安排将在渲染时填充 -->
            </tbody>
          </table>
      </div>
    `;

    // 渲染课程类别列表
    this.renderCourseCategories();
    
    // 渲染课程安排列表
    this.renderCoursesList();
    
    // 设置事件监听器
    this.setupCoursesEventListeners();
  }
  
  // 获取所有课程类别
  getCourseCategories() {
    // 从课程中提取所有不同的类别
    const allCourses = this.schedules.map(s => s.subject);
    return Array.from(new Set(allCourses));
  }
  
  // 渲染课程类别列表
  renderCourseCategories() {
    const tableBody = document.getElementById('category-list');
    if (!tableBody) return;
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 获取所有课程类别
    const courseCategories = this.getCourseCategories();
    
    // 为每个类别创建表格行
    courseCategories.forEach(category => {
      // 计算该类别的课程数量
      const coursesInCategory = this.schedules.filter(s => s.subject === category);
      
      // 计算该类别的授课教师数
      const teachersInCategory = Array.from(new Set(coursesInCategory.map(c => c.teacherId))).length;
      
      // 创建表格行
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${category}</td>
        <td>${coursesInCategory.length}</td>
        <td>${teachersInCategory}</td>
      `;
      
      tableBody.appendChild(row);
    });
  }
  
  // 渲染课程安排列表
  renderCoursesList(categoryFilter = '') {
    const tableBody = document.getElementById('course-list');
    if (!tableBody) return;
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 根据筛选条件过滤课程
    let filteredCourses = [...this.schedules];
    
    if (categoryFilter) {
      filteredCourses = filteredCourses.filter(course => course.subject === categoryFilter);
    }
    
    // 按日期排序
    filteredCourses.sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.startTime);
      const dateB = new Date(b.date + 'T' + b.startTime);
      return dateA - dateB;
    });
    
    // 为每个课程创建表格行
    filteredCourses.forEach(course => {
      const teacher = this.teachers.find(t => t.id === course.teacherId);
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${course.subject}</td>
        <td>${course.category || '未分类'}</td>
        <td>${teacher ? teacher.name : '未知教师'}</td>
        <td>${course.date}</td>
        <td>${course.startTime} - ${course.endTime}</td>
        <td>${this.rooms.find(r => r.id === course.room)?.name || '未分配'}</td>
        <td>${Array.isArray(course.students) ? course.students.length : 0}</td>
        <td>
          <div class="action-buttons">
            <button class="icon-btn view-btn" data-id="${course.id}" title="查看详情">
              <span class="icon">👁️</span>
            </button>
            <button class="icon-btn edit-btn" data-id="${course.id}" title="编辑">
              <span class="icon">✏️</span>
            </button>
            <button class="icon-btn delete-btn" data-id="${course.id}" title="删除">
              <span class="icon">🗑️</span>
            </button>
          </div>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
  }
  
  // 设置课程管理的事件监听器
  setupCoursesEventListeners() {
    // 添加课程类别按钮
    const addCategoryBtn = document.getElementById('add-category-btn');
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener('click', () => this.showCategoryForm());
    }
    
    // 删除课程类别按钮
    const deleteCategoryBtn = document.getElementById('delete-category-btn');
    if (deleteCategoryBtn) {
      deleteCategoryBtn.addEventListener('click', () => this.showDeleteCategoryForm());
    }
    
    // 课程类别筛选
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.renderCoursesList(e.target.value);
      });
    }
    
    // 课程搜索
    const courseSearch = document.getElementById('course-search');
    if (courseSearch) {
      courseSearch.addEventListener('input', (e) => {
        this.filterCourses(e.target.value);
      });
    }
    
    // 课程操作按钮
    document.querySelectorAll('#course-list .edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const courseId = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        const course = this.schedules.find(c => c.id === courseId);
        if (course) {
          this.showCourseForm(course);
        }
      });
    });
    
    document.querySelectorAll('#course-list .delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const courseId = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        this.deleteCourse(courseId);
      });
    });
    
    document.querySelectorAll('#course-list .view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const courseId = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        this.showCourseDetails(courseId);
      });
    });
  }
  
  // 显示添加/编辑课程类别表单
  showCategoryForm(category = '') {
    const isEdit = !!category;
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isEdit ? '编辑课程类别' : '添加课程类别'}</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form id="category-form">
            <div class="form-group">
              <label for="category-name">类别名称</label>
              <input type="text" id="category-name" value="${category}" required>
              <small>例如：英语、数学、物理等</small>
            </div>
            
            <div class="form-actions">
              <button type="button" class="cancel-btn">取消</button>
              <button type="submit" class="submit-btn">${isEdit ? '保存' : '添加'}</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // 添加到body
    document.body.appendChild(modal);
    
    // 添加关闭按钮事件
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      });
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      });
    }
    
    // 表单提交
    const form = modal.querySelector('#category-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const categoryName = document.getElementById('category-name').value.trim();
        
        if (!categoryName) {
          alert('请输入课程类别名称');
          return;
        }
        
        if (isEdit) {
          // 更新课程类别
          this.updateCourseCategory(category, categoryName);
        } else {
          // 添加新课程类别
          this.addCourseCategory(categoryName);
        }
        
        // 关闭模态框
        modal.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      });
    }
    
    // 显示模态框
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }
  
  // 添加课程类别
  addCourseCategory(categoryName) {
    // 检查是否已存在
    const categories = this.getCourseCategories();
    if (categories.includes(categoryName)) {
      alert('此课程类别已存在');
      return;
    }
    
    // 创建一个示例课程
    const newCourse = {
      id: Date.now(),
      teacherId: this.teachers.length > 0 ? this.teachers[0].id : null,
      subject: categoryName,
      date: this.formatDateToString(new Date()),
      startTime: '09:00',
      endTime: '10:30',
      room: this.rooms.length > 0 ? this.rooms[0].id : '',
      students: [],
      color: '#4cc9f0'
    };
    
    // 添加到课程数组
    this.schedules.push(newCourse);
    
    // 保存数据
    this.saveData();
    
    // 重新渲染
    this.renderCourseCategories();
    this.renderCoursesList();
    
    // 更新筛选下拉菜单
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      const option = document.createElement('option');
      option.value = categoryName;
      option.textContent = categoryName;
      categoryFilter.appendChild(option);
    }
    
    this.showToast(`课程类别 "${categoryName}" 已添加`);
  }
  
  // 更新课程类别
  updateCourseCategory(oldCategory, newCategory) {
    // 更新所有使用该类别的课程
    this.schedules.forEach(course => {
      if (course.subject === oldCategory) {
        course.subject = newCategory;
      }
    });
    
    // 保存数据
    this.saveData();
    
    // 重新渲染
    this.renderCourseCategories();
    this.renderCoursesList();
    
    // 更新筛选下拉菜单
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      Array.from(categoryFilter.options).forEach(option => {
        if (option.value === oldCategory) {
          option.value = newCategory;
          option.textContent = newCategory;
        }
      });
    }
    
    this.showToast(`课程类别已更新为 "${newCategory}"`);
  }
  
  // 显示删除课程类别表单
  showDeleteCategoryForm() {
    const categories = this.getCourseCategories();
    
    if (categories.length === 0) {
      alert('暂无课程类别可删除');
      return;
    }
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>删除课程类别</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form id="delete-category-form">
            <div class="form-group">
              <label for="category-select">选择要删除的课程类别</label>
              <select id="category-select" required>
                <option value="">请选择...</option>
                ${categories.map(category => `<option value="${category}">${category}</option>`).join('')}
              </select>
            </div>
            
            <div class="form-message warning">
              <p>警告：删除课程类别将同时删除所有该类别的课程安排！此操作不可撤销。</p>
            </div>
            
            <div class="form-actions">
              <button type="button" class="cancel-btn">取消</button>
              <button type="submit" class="danger-btn">删除</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // 添加到body
    document.body.appendChild(modal);
    
    // 添加关闭按钮事件
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      });
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      });
    }
    
    // 表单提交
    const form = modal.querySelector('#delete-category-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const categorySelect = document.getElementById('category-select');
        const category = categorySelect.value;
        
        if (!category) {
          alert('请选择要删除的课程类别');
          return;
        }
        
        // 二次确认
        if (confirm(`确定要删除课程类别"${category}"吗？此操作将删除所有相关课程安排且不可撤销。`)) {
          this.deleteCourseCategory(category);
          
          // 关闭模态框
          modal.classList.remove('show');
          setTimeout(() => {
            document.body.removeChild(modal);
          }, 300);
        }
      });
    }
    
    // 显示模态框
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }
  
  // 删除课程类别
  deleteCourseCategory(category) {
    // 删除所有该类别的课程
    this.schedules = this.schedules.filter(course => course.subject !== category);
    
    // 保存数据
    this.saveData();
    
    // 重新渲染
    this.renderCourseCategories();
    this.renderCoursesList();
    
    // 更新筛选下拉菜单
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      Array.from(categoryFilter.options).forEach(option => {
        if (option.value === category) {
          categoryFilter.removeChild(option);
        }
      });
    }
    
    this.showToast(`课程类别 "${category}" 已删除`);
  }
  
  loadRoomsSection() {
    // 在实际应用中显示教室管理界面
    console.log('加载教室管理界面');
  }
  
  loadSettingsSection() {
    this.currentSection = 'settings';
    
    const content = document.querySelector('.content');
    content.innerHTML = `
      <header class="content-header">
        <h1>系统设置</h1>
        <div class="user-info">
          <img src="assets/img/admin-avatar.png" alt="管理员头像" class="avatar">
          <span class="username">${this.currentUser ? this.currentUser.name : '系统管理员'}</span>
        </div>
      </header>
      
      <div class="settings-container">
        <div class="settings-card">
          <h3>基本信息</h3>
          <form id="org-form" class="settings-form">
            <div class="form-group">
              <label for="org-name">机构名称</label>
              <input type="text" id="org-name" value="${localStorage.getItem('orgName') || '排课系统'}" required>
            </div>
            <div class="form-group">
              <label for="org-desc">机构描述</label>
              <textarea id="org-desc" rows="3">${localStorage.getItem('orgDesc') || ''}</textarea>
            </div>
            <div class="form-group">
              <label for="org-contact">联系方式</label>
              <input type="text" id="org-contact" value="${localStorage.getItem('orgContact') || ''}">
            </div>
            <button type="submit" class="submit-btn">保存信息</button>
          </form>
        </div>
        
        <div class="settings-card">
          <h3>管理员账号管理</h3>
          <form id="admin-form" class="settings-form">
            <div class="form-group">
              <label for="admin-username">管理员用户名</label>
              <input type="text" id="admin-username" value="${this.currentUser ? this.currentUser.username : 'admin'}" required>
            </div>
            <div class="form-group">
              <label for="admin-name">管理员姓名</label>
              <input type="text" id="admin-name" value="${this.currentUser ? this.currentUser.name : '系统管理员'}" required>
            </div>
            <button type="submit" class="submit-btn">更新管理员信息</button>
          </form>
        </div>
        
        <div class="settings-card">
          <h3>密码修改</h3>
          <form id="password-form" class="settings-form">
            <div class="form-group">
              <label for="current-password">当前密码</label>
              <input type="password" id="current-password" required>
            </div>
            <div class="form-group">
              <label for="new-password">新密码</label>
              <input type="password" id="new-password" required>
              </div>
            <div class="form-group">
              <label for="confirm-password">确认新密码</label>
              <input type="password" id="confirm-password" required>
            </div>
            <button type="submit" class="submit-btn">修改密码</button>
          </form>
        </div>
        
        <div class="settings-card">
          <h3>数据管理</h3>
          <div class="form-group">
            <button id="backup-data" class="submit-btn">导出系统数据</button>
          </div>
          <div class="form-group">
            <button id="export-teachers-schedules" class="primary-btn">导出教师课程数据(JSON)</button>
          </div>
          <div class="form-group">
            <button id="export-teachers-csv" class="primary-btn">导出教师课程数据(CSV)</button>
          </div>
          <div class="form-group">
            <button id="restore-default-data" class="primary-btn">恢复默认数据</button>
          </div>
          <div class="form-group">
            <button id="clear-data" class="danger-btn">清空系统数据</button>
          </div>
        </div>
      </div>
    `;
    
    // 添加事件监听器
    this.setupSettingsEventListeners();
  }
  
  setupSettingsEventListeners() {
    // 机构信息表单
    const orgForm = document.getElementById('org-form');
    if (orgForm) {
      orgForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const orgName = document.getElementById('org-name').value;
        const orgDesc = document.getElementById('org-desc').value;
        const orgContact = document.getElementById('org-contact').value;
        
        // 保存到localStorage
        localStorage.setItem('orgName', orgName);
        localStorage.setItem('orgDesc', orgDesc);
        localStorage.setItem('orgContact', orgContact);
        
        // 更新页面标题
        document.title = orgName;
        document.querySelector('.sidebar-header h2').textContent = orgName;
        
        // 保存综合的机构信息对象，以便其他页面使用
        const orgInfo = {
          name: orgName,
          desc: orgDesc,
          contact: orgContact,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('orgInfo', JSON.stringify(orgInfo));
        
        this.showToast('机构信息已更新');
      });
    }
    
    // 管理员信息表单
    const adminForm = document.getElementById('admin-form');
    if (adminForm) {
      adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('admin-username').value;
        const name = document.getElementById('admin-name').value;
        
        if (this.currentUser) {
          this.currentUser.username = username;
          this.currentUser.name = name;
          
          // 更新会话存储
          sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          
          // 更新页面显示
          document.querySelector('.username').textContent = name;
          
          this.showToast('管理员信息已更新');
        }
      });
    }
    
    // 密码修改表单
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // 验证密码
        if (currentPassword !== this.currentUser.password) {
          alert('当前密码不正确');
          return;
        }
        
        if (newPassword !== confirmPassword) {
          alert('两次输入的新密码不一致');
          return;
        }
        
        // 更新密码
        this.currentUser.password = newPassword;
        
        // 更新会话存储
        sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // 清空表单
        passwordForm.reset();
        
        this.showToast('密码已成功修改');
      });
    }
    
    // 导出数据按钮
    const backupBtn = document.getElementById('backup-data');
    if (backupBtn) {
      backupBtn.addEventListener('click', () => {
        const data = {
          teachers: this.teachers,
          rooms: this.rooms,
          schedules: this.schedules,
          orgName: localStorage.getItem('orgName'),
          orgDesc: localStorage.getItem('orgDesc'),
          orgContact: localStorage.getItem('orgContact')
        };
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "schedule_system_backup_" + new Date().toISOString().slice(0, 10) + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        
        this.showToast('数据导出成功');
      });
    }
    
    // 导出教师课程数据按钮（JSON格式）
    const exportTeachersSchedulesBtn = document.getElementById('export-teachers-schedules');
    if (exportTeachersSchedulesBtn) {
      exportTeachersSchedulesBtn.addEventListener('click', () => {
        this.exportTeacherScheduleData();
      });
    }
    
    // 导出教师课程数据按钮（CSV格式）
    const exportTeachersCSVBtn = document.getElementById('export-teachers-csv');
    if (exportTeachersCSVBtn) {
      exportTeachersCSVBtn.addEventListener('click', () => {
        this.exportTeacherScheduleAsCSV();
      });
    }
    
    // 恢复默认数据按钮
    const restoreDefaultDataBtn = document.getElementById('restore-default-data');
    if (restoreDefaultDataBtn) {
      restoreDefaultDataBtn.addEventListener('click', () => {
        if (confirm('确定要恢复默认数据吗？这将覆盖任何自定义数据，但不会清空已有数据。')) {
          this.forceInitDefaultData();
          this.showToast('已恢复默认数据');
          // 刷新页面以显示新数据
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      });
    }
    
    // 清空数据按钮
    const clearDataBtn = document.getElementById('clear-data');
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', () => {
        this.clearData();
      });
    }
  }
  
  // 计算教师总课时
  calculateTotalTeacherHours(teacherId) {
    const teacherSchedules = this.schedules.filter(s => s.teacherId === teacherId);
    
    let totalHours = 0;
    teacherSchedules.forEach(schedule => {
      const startTime = this.parseTime(schedule.startTime);
      const endTime = this.parseTime(schedule.endTime);
      const hours = (endTime - startTime) / (1000 * 60 * 60);
      totalHours += hours;
    });
    
    return totalHours.toFixed(1);
  }
  
  // 生成学生上课统计
  generateStudentStatistics(teacherId) {
    const teacherSchedules = this.schedules.filter(s => s.teacherId === teacherId);
    
    // 收集所有学生及其参与的课程
    const studentCourses = {};
    teacherSchedules.forEach(schedule => {
      if (Array.isArray(schedule.students)) {
        schedule.students.forEach(student => {
          if (!studentCourses[student]) {
            studentCourses[student] = [];
          }
          studentCourses[student].push(schedule.subject);
        });
      }
    });
    
    // 生成HTML
    if (Object.keys(studentCourses).length === 0) {
      return '<div class="no-data">暂无学生数据</div>';
    }
    
    let html = '<table class="data-table"><thead><tr><th>学生</th><th>参与课程数</th><th>课程详情</th></tr></thead><tbody>';
    
    for (const [student, courses] of Object.entries(studentCourses)) {
      const uniqueCourses = Array.from(new Set(courses));
      html += `
        <tr>
          <td>${student}</td>
          <td>${uniqueCourses.length}</td>
          <td>${uniqueCourses.join(', ')}</td>
        </tr>
      `;
    }
    
    html += '</tbody></table>';
    return html;
  }
  
  // 显示教室使用情况
  showRoomUsage(roomId) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;
    
    // 获取该教室的所有预定
    const roomSchedules = this.schedules.filter(s => s.room === roomId);
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${room.name}使用情况</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="stats-summary">
            <div class="stat-item">
              <div class="stat-value">${roomSchedules.length}</div>
              <div class="stat-label">已预定课程数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${this.calculateRoomUtilizationHours(roomId)}</div>
              <div class="stat-label">使用总时长(小时)</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${room.capacity}</div>
              <div class="stat-label">容量(人)</div>
            </div>
          </div>
          
          <h4>预定列表</h4>
          <table class="data-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>时间</th>
                <th>课程</th>
                <th>教师</th>
                <th>学生人数</th>
              </tr>
            </thead>
            <tbody>
              ${roomSchedules.map(schedule => {
                const teacher = this.teachers.find(t => t.id === schedule.teacherId);
                return `
                  <tr>
                    <td>${schedule.date}</td>
                    <td>${schedule.startTime} - ${schedule.endTime}</td>
                    <td>${schedule.subject}</td>
                    <td>${teacher ? teacher.name : '未知教师'}</td>
                    <td>${Array.isArray(schedule.students) ? schedule.students.length : 0}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    // 添加到body
    document.body.appendChild(modal);
    
    // 添加关闭按钮事件
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      });
    }
    
    // 显示模态框
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }
  
  // 计算教室使用总时长
  calculateRoomUtilizationHours(roomId) {
    const roomSchedules = this.schedules.filter(s => s.room === roomId);
    
    let totalHours = 0;
    roomSchedules.forEach(schedule => {
      const startTime = this.parseTime(schedule.startTime);
      const endTime = this.parseTime(schedule.endTime);
      const hours = (endTime - startTime) / (1000 * 60 * 60);
      totalHours += hours;
    });
    
    return totalHours.toFixed(1);
  }
  
  // 显示教室表单
  showRoomForm(room = null) {
    const isEdit = !!room;
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isEdit ? '编辑教室' : '添加教室'}</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form id="room-form">
            <input type="hidden" id="room-id" value="${isEdit ? room.id : ''}">
            
            <div class="form-group">
              <label for="room-id-input">教室ID</label>
              <input type="text" id="room-id-input" value="${isEdit ? room.id : ''}" ${isEdit ? 'disabled' : 'required'}>
              <small>例如：A101，B203</small>
            </div>
            
            <div class="form-group">
              <label for="room-name">教室名称</label>
              <input type="text" id="room-name" value="${isEdit && room.name ? room.name : ''}" required>
              <small>例如：A101教室，多媒体教室等</small>
            </div>
            
            <div class="form-group">
              <label for="room-capacity">容量（人）</label>
              <input type="number" id="room-capacity" min="1" value="${isEdit && room.capacity ? room.capacity : '20'}" required>
            </div>
            
            <div class="form-group">
              <label for="room-equipment">设备（用逗号分隔）</label>
              <input type="text" id="room-equipment" value="${isEdit && Array.isArray(room.equipment) ? room.equipment.join(',') : ''}">
              <small>例如：投影仪,电子白板,音响</small>
            </div>
            
            <div class="form-actions">
              <button type="button" class="cancel-btn">取消</button>
              <button type="submit" class="submit-btn">${isEdit ? '保存' : '添加'}</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // 添加到body
    document.body.appendChild(modal);
    
    // 添加关闭按钮事件
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      });
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      });
    }
    
    // 表单提交
    const form = modal.querySelector('#room-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (isEdit) {
          this.updateRoom(form, modal);
        } else {
          this.addRoom(form, modal);
        }
      });
    }
    
    // 显示模态框
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }
  
  // 添加教室
  addRoom(form, modal) {
    const roomId = document.getElementById('room-id-input').value;
    const name = document.getElementById('room-name').value;
    const capacity = parseInt(document.getElementById('room-capacity').value, 10);
    const equipmentText = document.getElementById('room-equipment').value;
    const equipment = equipmentText ? equipmentText.split(',').map(e => e.trim()).filter(e => e) : [];
    
    // 验证数据
    if (!roomId || !name || isNaN(capacity) || capacity < 1) {
      alert('请填写必填字段，并确保容量为正整数');
      return;
    }
    
    // 检查ID是否已存在
    if (this.rooms.some(r => r.id === roomId)) {
      alert('教室ID已存在，请使用其他ID');
      return;
    }
    
    // 创建新教室对象
    const newRoom = {
      id: roomId,
      name: name,
      capacity: capacity,
      equipment: equipment
    };
    
    // 添加到教室数组
    this.rooms.push(newRoom);
    
    // 保存数据到localStorage
    this.saveData();
    
    // 重新渲染教室列表
    this.renderRoomsList();
    
    // 关闭模态框
    modal.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(modal);
    }, 300);
    
    // 显示成功消息
    this.showToast('教室添加成功');
  }
  
  // 更新教室
  updateRoom(form, modal) {
    const roomId = document.getElementById('room-id').value;
    const name = document.getElementById('room-name').value;
    const capacity = parseInt(document.getElementById('room-capacity').value, 10);
    const equipmentText = document.getElementById('room-equipment').value;
    const equipment = equipmentText ? equipmentText.split(',').map(e => e.trim()).filter(e => e) : [];
    
    // 验证数据
    if (!roomId || !name || isNaN(capacity) || capacity < 1) {
      alert('请填写必填字段，并确保容量为正整数');
      return;
    }
    
    // 查找要更新的教室
    const roomIndex = this.rooms.findIndex(r => r.id === roomId);
    if (roomIndex === -1) {
      alert('未找到教室');
      return;
    }
    
    // 更新教室信息
    this.rooms[roomIndex] = {
      ...this.rooms[roomIndex],
      name: name,
      capacity: capacity,
      equipment: equipment
    };
    
    // 保存数据到localStorage
    this.saveData();
    
    // 重新渲染教室列表
    this.renderRoomsList();
    
    // 关闭模态框
    modal.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(modal);
    }, 300);
    
    // 显示成功消息
    this.showToast('教室信息已更新');
  }
  
  // 删除教室
  deleteRoom(roomId) {
    // 确认删除
    if (!confirm('确定要删除此教室吗？此操作不可撤销。')) {
      return;
    }
    
    // 检查是否有课程正在使用该教室
    const roomSchedules = this.schedules.filter(s => s.room === roomId);
    if (roomSchedules.length > 0) {
      if (!confirm(`该教室有 ${roomSchedules.length} 个课程正在使用，删除教室将清空这些课程的教室分配。是否继续？`)) {
        return;
      }
      
      // 清空关联课程的教室信息
      this.schedules.forEach(schedule => {
        if (schedule.room === roomId) {
          schedule.room = '';
        }
      });
    }
    
    // 从数组中删除教室
    this.rooms = this.rooms.filter(r => r.id !== roomId);
    
    // 保存数据到localStorage
    this.saveData();
    
    // 重新渲染教室列表
    this.renderRoomsList();
    
    // 显示成功消息
    this.showToast('教室已删除');
  }
  
  // 重新加载教室管理界面
  reloadRoomsSection() {
    if (this.currentSection === 'teachers') {
      this.renderRoomsList();
    }
  }
  
  // 导出教师课程数据
  exportTeacherScheduleData(teacherId = null) {
    try {
      let exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {}
      };
      
      // 如果指定了教师ID，只导出该教师的数据
      if (teacherId) {
        const teacher = this.teachers.find(t => t.id === teacherId);
        if (!teacher) {
          throw new Error('找不到指定的教师');
        }
        
        const teacherSchedules = this.schedules.filter(s => s.teacherId === teacherId);
        exportData.data = {
          teacher: teacher,
          schedules: teacherSchedules
        };
        
        // 创建下载链接
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `teacher_${teacher.name}_schedules_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        
        this.showToast(`${teacher.name}的课程数据导出成功`);
      } else {
        // 导出所有教师的课程数据
        const teacherSchedules = {};
        
        // 按教师组织课程数据
        this.teachers.forEach(teacher => {
          const schedules = this.schedules.filter(s => s.teacherId === teacher.id);
          teacherSchedules[teacher.id] = {
            teacher: teacher,
            schedules: schedules
          };
        });
        
        exportData.data = teacherSchedules;
        
        // 创建下载链接
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `all_teachers_schedules_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        
        this.showToast('所有教师课程数据导出成功');
      }
    } catch (error) {
      console.error('导出教师课程数据失败:', error);
      alert('导出教师课程数据失败: ' + error.message);
    }
  }
  
  // 修改导出CSV的方法，确保正确使用数据
  exportTeacherScheduleAsCSV(teacherId = null) {
    try {
      // 确保数据已加载
      if (!this.teachers.length || !this.rooms.length) {
        console.warn('数据可能未完全加载，尝试重新加载...');
        this.loadData();
        setTimeout(() => this.exportTeacherScheduleAsCSV(teacherId), 500);
        return;
      }

      // CSV头部
      let csvContent = "教师ID,教师姓名,课程名称,日期,开始时间,结束时间,教室,学生人数\n";
      
      // 如果指定了教师ID，只导出该教师的数据
      if (teacherId) {
        const teacher = this.teachers.find(t => t.id === teacherId);
        if (!teacher) {
          throw new Error('找不到指定的教师');
        }
        
        const teacherSchedules = this.schedules.filter(s => s.teacherId === teacherId);
        console.log(`为教师 ${teacher.name} 找到 ${teacherSchedules.length} 条课程记录`);
        
        // 添加数据行
        teacherSchedules.forEach(schedule => {
          const roomName = this.rooms.find(r => r.id === schedule.room)?.name || '未分配';
          const studentCount = Array.isArray(schedule.students) ? schedule.students.length : 0;
          csvContent += `${teacher.id},${teacher.name},${schedule.subject},${schedule.date},${schedule.startTime},${schedule.endTime},${roomName},${studentCount}\n`;
        });
        
        // 处理中文字符
        const encodedUri = encodeURI("data:text/csv;charset=utf-8,\uFEFF" + csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `教师${teacher.name}课程数据_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        this.showToast(`${teacher.name}的课程数据已导出为CSV格式`);
      } else {
        // 导出所有教师的课程数据
        console.log(`导出所有教师课程数据，找到 ${this.teachers.length} 位教师`);
        let totalCourses = 0;
        
        this.teachers.forEach(teacher => {
          const teacherSchedules = this.schedules.filter(s => s.teacherId === teacher.id);
          totalCourses += teacherSchedules.length;
          
          // 添加数据行
          teacherSchedules.forEach(schedule => {
            const roomName = this.rooms.find(r => r.id === schedule.room)?.name || '未分配';
            const studentCount = Array.isArray(schedule.students) ? schedule.students.length : 0;
            csvContent += `${teacher.id},${teacher.name},${schedule.subject},${schedule.date},${schedule.startTime},${schedule.endTime},${roomName},${studentCount}\n`;
          });
        });
        
        console.log(`共导出 ${totalCourses} 条课程记录`);
        
        // 如果没有课程数据，添加提示行
        if (csvContent === "教师ID,教师姓名,课程名称,日期,开始时间,结束时间,教室,学生人数\n") {
          csvContent += "暂无课程数据";
        }
        
        // 处理中文字符
        const encodedUri = encodeURI("data:text/csv;charset=utf-8,\uFEFF" + csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `全部教师课程数据_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        this.showToast('所有教师课程数据已导出为CSV格式');
      }
    } catch (error) {
      console.error('导出CSV数据失败:', error);
      alert('导出CSV数据失败: ' + error.message);
    }
  }

  // 显示教师排课情况
  showTeacherSchedules(teacherId) {
    const teacher = this.teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    
    // 获取该教师的所有课程
    const teacherSchedules = this.schedules.filter(s => s.teacherId === teacherId);
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${teacher.name}的排课情况</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="stats-summary">
            <div class="stat-item">
              <div class="stat-value">${teacherSchedules.length}</div>
              <div class="stat-label">总课程数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${this.calculateTotalTeacherHours(teacherId)}</div>
              <div class="stat-label">总课时</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${Array.from(new Set(teacherSchedules.map(s => s.subject))).length}</div>
              <div class="stat-label">课程类型</div>
            </div>
          </div>
          
          <div class="action-bar">
            <button id="export-teacher-data" class="primary-btn">
              <span class="btn-icon">📊</span>导出JSON
            </button>
            <button id="export-teacher-csv" class="secondary-btn">
              <span class="btn-icon">📄</span>导出CSV
            </button>
          </div>
          
          <h4>课程列表</h4>
          <table class="data-table">
            <thead>
              <tr>
                <th>课程名称</th>
                <th>日期</th>
                <th>时间</th>
                <th>教室</th>
                <th>学生人数</th>
              </tr>
            </thead>
            <tbody>
              ${teacherSchedules.map(schedule => `
                <tr>
                  <td>${schedule.subject}</td>
                  <td>${schedule.date}</td>
                  <td>${schedule.startTime} - ${schedule.endTime}</td>
                  <td>${schedule.room || '未分配'}</td>
                  <td>${Array.isArray(schedule.students) ? schedule.students.length : 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    // 添加到body
    document.body.appendChild(modal);
    
    // 添加关闭按钮事件
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
          modal.remove();
        }, 300);
      });
    }
    
    // 显示模态框
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
    
    // 导出教师课程数据按钮 - JSON格式
    const teacherExportBtn = modal.querySelector('#export-teacher-data');
    if (teacherExportBtn) {
      teacherExportBtn.addEventListener('click', () => {
        this.exportTeacherScheduleData(teacherId);
      });
    }
    
    // 导出教师课程数据按钮 - CSV格式
    const teacherCSVBtn = modal.querySelector('#export-teacher-csv');
    if (teacherCSVBtn) {
      teacherCSVBtn.addEventListener('click', () => {
        this.exportTeacherScheduleAsCSV(teacherId);
      });
    }
  }

  // 清空所有数据
  clearData() {
    // 确认清空
    if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      return;
    }
    
    // 清除localStorage中的数据
    localStorage.removeItem('teachers');
    localStorage.removeItem('rooms');
    localStorage.removeItem('schedules');
    
    // 重新初始化数据
    this.teachers = [];
    this.rooms = [];
    this.schedules = [];
    
    // 加载默认数据
    this.loadTeachers();
    this.loadRooms();
    this.loadSchedules();
    
    // 保存到localStorage
    this.saveData();
    
    // 根据当前页面重新加载数据
    if (this.currentSection === 'dashboard') {
      this.loadDashboard();
    } else if (this.currentSection === 'teachers') {
      this.loadTeachersSection();
    } else if (this.currentSection === 'courses') {
      this.loadCoursesSection();
    }
    
    this.showToast('系统数据已重置');
  }
}

// 初始化管理后台
document.addEventListener('DOMContentLoaded', () => {
  window.adminManager = new AdminManager();
}); 
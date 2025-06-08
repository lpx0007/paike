/**
 * 排课管理功能
 * 处理课程的展示、创建、编辑和删除
 */
class ScheduleManager {
  constructor() {
    this.currentUser = null;
    this.schedules = [];
    this.rooms = [];
    this.teachers = [];
    this.courseCategories = []; // 添加课程类别数组
    this.selectedColor = null;
    this.selectedTimeCells = []; // 存储已选择的时间格子
    this.isSelecting = false; // 是否正在选择时间格子
    this.subjectColors = {}; // 添加课程颜色映射
    
    this.init();
  }
  
  async init() {
    // 检查登录状态
    this.currentUser = await this.checkAuth();
    if (!this.currentUser) {
      window.location.href = 'login.html';
      return;
    }
    
    // 输出当前用户信息便于调试
    console.log('当前用户信息:', this.currentUser);
    console.log('用户ID:', this.currentUser.id);
    console.log('教师ID:', this.currentUser.teacherId);
    
    // 更新页面上的机构名称
    this.updateOrgName();
    
    // 强制清除旧的课程类别数据，确保每次都获取最新数据
    try {
      localStorage.removeItem('courseCategoriesData');
      console.log('已清除旧的课程类别数据');
    } catch (e) {
      console.error('清除课程类别数据失败:', e);
    }
    
    // 加载数据
    await Promise.all([
      this.loadSchedules(),
      this.loadRooms(),
      this.loadTeachers(),
      this.loadCourseCategories() // 添加加载课程类别
    ]);
    
    // 初始化课程颜色映射
    this.initSubjectColors();
    
    // 初始化UI
    this.initUI();
    this.renderSchedules();
    this.setupEventListeners();
    
    // 高亮显示当前登录教师的列
    this.highlightCurrentTeacherColumn();
    
    // 显示操作提示
    setTimeout(() => {
      this.showToast("提示：长按时间格子创建新课程");
    }, 1000);
  }
  
  // 更新页面上的机构名称
  updateOrgName() {
    const orgName = localStorage.getItem('orgName');
    if (orgName) {
      // 更新页面标题
      document.title = orgName;
      
      // 更新各处显示的机构名称
      const sectionTitle = document.querySelector('.section-title');
      if (sectionTitle) {
        // 保留"日历框（月度）"的文本
        if (sectionTitle.textContent.includes('日历框')) {
          sectionTitle.textContent = '日历框（月度）';
        } else {
          sectionTitle.textContent = orgName;
        }
      }
      
      // 更新排课表标题
      const scheduleTitle = document.querySelector('.schedule-title h2');
      if (scheduleTitle) {
        scheduleTitle.textContent = `${orgName}排课表`;
      }
      
      // 更新页面头部（如果存在）
      const appTitle = document.querySelector('.app-header .title');
      if (appTitle) {
        appTitle.textContent = orgName;
      }
      
      console.log('已更新机构名称:', orgName);
    }
  }
  
  async checkAuth() {
    // 从authManager获取真实的当前用户信息
    if (window.authManager) {
      const user = window.authManager.getCurrentUser();
      if (!user) {
        window.location.href = 'login.html';
        return null;
      }
      return user;
    } else {
      // 如果找不到authManager，重定向到登录页面
      console.error('找不到authManager，未登录');
      window.location.href = 'login.html';
      return null;
    }
  }
  
  async loadSchedules() {
    // 直接从localStorage读取数据
    try {
      // 尝试从localStorage读取课程数据
      const schedulesData = localStorage.getItem('schedules');
      if (schedulesData) {
        this.schedules = JSON.parse(schedulesData);
        console.log('从localStorage加载了课程数据');
      } else {
        // 如果localStorage中没有数据，尝试初始化默认数据
        this.forceInitDefaultData();
        return;
      }
    } catch(error) {
      console.error('加载课程数据失败:', error);
      // 尝试使用默认数据
      this.forceInitDefaultData();
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
        "color": "#4361ee"
      },
      {
        "id": 2,
        "teacherId": 2,
        "name": "李老师",
        "subject": ["钢琴"],
        "color": "#3a0ca3"
      },
      {
        "id": 3,
        "teacherId": 3,
        "name": "王老师",
        "subject": ["声乐", "艺考"],
        "color": "#7209b7"
      },
      {
        "id": 4,
        "teacherId": 4,
        "name": "刘老师",
        "subject": ["675"],
        "color": "#4cc9f0"
      },
      {
        "id": 5,
        "teacherId": 5,
        "name": "赵老师",
        "subject": ["艺考"],
        "color": "#f72585"
      }
    ];
    
    // 初始化教室数据
    this.rooms = [
      {
        "id": "1",
        "name": "教室1",
        "capacity": 30
      },
      {
        "id": "2",
        "name": "教室2",
        "capacity": 25
      },
      {
        "id": "3",
        "name": "教室3",
        "capacity": 20
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
    
    // 课程类别数据
    this.courseCategories = [
      { id: 1, name: "钢琴" },
      { id: 2, name: "声乐" },
      { id: 3, name: "艺考" },
      { id: 4, name: "675" }
    ];
    
    // 保存所有数据到localStorage
    this.saveAllData();
    console.log('默认数据已初始化并保存到localStorage');
    
    return true;
  }
  
  // 保存所有数据到localStorage
  saveAllData() {
    // 保存教师数据
    localStorage.setItem('teachers', JSON.stringify(this.teachers));
    
    // 保存教室数据
    localStorage.setItem('rooms', JSON.stringify(this.rooms));
    
    // 保存课程数据
    localStorage.setItem('schedules', JSON.stringify(this.schedules));
    
    // 保存课程类别数据
    localStorage.setItem('courseCategoriesData', JSON.stringify(this.courseCategories));
    
    console.log('所有数据已保存到localStorage');
  }
  
  async loadRooms() {
    // 直接从localStorage读取数据
    try {
      // 尝试从localStorage读取教室数据
      const roomsData = localStorage.getItem('rooms');
      if (roomsData) {
        this.rooms = JSON.parse(roomsData);
        console.log('从localStorage加载了教室数据');
      } else {
        // 如果localStorage中没有数据，尝试初始化默认数据
        this.forceInitDefaultData();
        return;
      }
    } catch(error) {
      console.error('加载教室数据失败:', error);
      // 尝试使用默认数据
      this.forceInitDefaultData();
    }
  }
  
  async loadTeachers() {
    // 如果AuthManager已经加载了教师数据，我们可以直接使用
    if (window.authManager && window.authManager.getAllTeachers) {
      this.teachers = window.authManager.getAllTeachers();
      console.log('从authManager加载了教师数据:', this.teachers);
      return;
    }
    
    // 否则从localStorage读取
    try {
      const teachersData = localStorage.getItem('teachers');
      if (teachersData) {
        this.teachers = JSON.parse(teachersData);
        console.log('从localStorage加载了教师数据');
      } else {
        // 如果localStorage中没有数据，使用默认数据
        this.forceInitDefaultData();  // 使用新添加的默认数据初始化方法
        return;
      }
    } catch(error) {
      console.error('加载教师数据失败:', error);
      // 尝试使用默认数据
      this.forceInitDefaultData();
    }
  }
  
  async loadCourseCategories() {
    // 首先从localStorage获取课程数据
    try {
      // 1. 检查是否有已存储的课程类别
      const courseCategoriesData = localStorage.getItem('courseCategoriesData');
      if (courseCategoriesData) {
        this.courseCategories = JSON.parse(courseCategoriesData);
        console.log('从localStorage加载了课程类别数据:', this.courseCategories);
        return;
      }
      
      // 2. 从课程数据中提取课程类别
      const schedulesData = localStorage.getItem('schedules');
      if (schedulesData) {
        const schedules = JSON.parse(schedulesData);
        // 提取所有不同的课程类别
        const subjects = schedules.map(s => s.subject);
        const uniqueSubjects = Array.from(new Set(subjects)).filter(s => s); // 过滤空值
        
        this.courseCategories = uniqueSubjects.map((name, index) => ({
          id: index + 1,
          name: name
        }));
        
        console.log('从课程数据中提取了课程类别:', this.courseCategories);
        
        // 保存到localStorage
        localStorage.setItem('courseCategoriesData', JSON.stringify(this.courseCategories));
        return;
      }
      
      // 3. 如果上述方法都失败，使用默认值
      const defaultCourseCategories = [
        { id: 1, name: "数学" },
        { id: 2, name: "英语" },
        { id: 3, name: "物理" },
        { id: 4, name: "化学" },
        { id: 5, name: "生物" },
        { id: 6, name: "历史" },
        { id: 7, name: "地理" },
        { id: 8, name: "政治" },
        { id: 9, name: "信息技术" },
        { id: 10, name: "艺术" }
      ];
      
      // 检查是否与管理员界面图片中看到的一致
      const fromScreenshot = ["钢琴", "声乐", "艺考", "675"];
      if (fromScreenshot.length > 0) {
        this.courseCategories = fromScreenshot.map((name, index) => ({
          id: index + 1,
          name: name
        }));
      } else {
        this.courseCategories = defaultCourseCategories;
      }
      
      console.log('使用默认课程类别:', this.courseCategories);
      localStorage.setItem('courseCategoriesData', JSON.stringify(this.courseCategories));
      
    } catch (error) {
      console.error('加载课程类别数据失败:', error);
      // 出错时使用少量默认值
      this.courseCategories = [
        { id: 1, name: "钢琴" },
        { id: 2, name: "声乐" },
        { id: 3, name: "艺考" },
        { id: 4, name: "675" }
      ];
    }
  }
  
  // 清除和刷新课程类别数据
  refreshCourseCategories() {
    try {
      // 删除旧数据
      localStorage.removeItem('courseCategoriesData');
      
      // 重新加载
      this.loadCourseCategories();
      
      console.log('课程类别数据已刷新:', this.courseCategories);
      return true;
    } catch (error) {
      console.error('刷新课程类别数据失败:', error);
      return false;
    }
  }
  
  initUI() {
    // 设置用户信息
    const username = document.querySelector('.username');
    if (username) {
      username.textContent = this.getTeacherName(this.currentUser.teacherId);
    }
    
    // 设置用户头像颜色
    const avatar = document.querySelector('.avatar');
    if (avatar) {
      // 获取预设头像列表
      const avatarColors = [
        '#e491a9', // 粉红色
        '#9f86c0', // 紫色
        '#5cbdb9', // 蓝绿色
        '#f7a595', // 珊瑚色
        '#fdcea9', // 桃色
        '#a2d7d2', // 薄荷绿
        '#bfe9b7', // 淡绿色
        '#4cc9f0', // 天蓝色
        '#d1c2d3', // 薰衣草色
        '#e8d3a9'  // 浅棕黄色
      ];
      
      // 获取或设置当前头像信息
      const currentTeacherId = this.currentUser.teacherId;
      const teacherName = this.getTeacherName(currentTeacherId);
      const currentAvatarIndex = localStorage.getItem(`avatar_${currentTeacherId}`) || 0;
      const currentAvatarColor = avatarColors[currentAvatarIndex];
      
      // 将图片头像替换为彩色文字头像
      const parent = avatar.parentNode;
      parent.removeChild(avatar);
      
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'avatar avatar-circle';
      avatarDiv.style.backgroundColor = currentAvatarColor;
      avatarDiv.style.color = 'white';
      avatarDiv.style.display = 'flex';
      avatarDiv.style.alignItems = 'center';
      avatarDiv.style.justifyContent = 'center';
      avatarDiv.style.fontWeight = '500';
      avatarDiv.style.fontSize = '16px';
      avatarDiv.textContent = teacherName.charAt(0);
      
      parent.appendChild(avatarDiv);
    }
    
    // 填充教室选项
    const roomSelect = document.getElementById('course-room');
    if (roomSelect) {
      this.rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = room.name;
        roomSelect.appendChild(option);
      });
    }
    
    // 填充教师选项
    const teacherSelect = document.getElementById('course-teacher');
    if (teacherSelect) {
      this.teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = teacher.name;
        // 默认选中当前用户
        if (teacher.id === this.currentUser.teacherId) {
          option.selected = true;
        }
        teacherSelect.appendChild(option);
      });
    }
    
    // 初始化颜色选择器
    const colorOptions = document.querySelectorAll('.color-option');
    if (colorOptions.length) {
      colorOptions.forEach(option => {
        option.style.backgroundColor = option.dataset.color;
      });
      
      // 默认选择第一个颜色
      this.selectColor(colorOptions[0]);
    }
  }
  
  getTeacherName(teacherId) {
    const teacher = this.teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : '未知老师';
  }
  
  selectColor(colorElement) {
    // 清除之前的选择
    document.querySelectorAll('.color-option').forEach(el => {
      el.classList.remove('selected');
    });
    
    // 选择新颜色
    colorElement.classList.add('selected');
    this.selectedColor = colorElement.dataset.color;
  }
  
  renderSchedules() {
    // 获取当前日期信息
    const dateInfo = window.calendarController ? window.calendarController.getCurrentDateInfo() : { date: new Date(), view: 'day' };
    
    switch(dateInfo.view) {
      case 'day':
        this.renderDayView(dateInfo.date);
        break;
      case 'week':
        this.renderWeekView(dateInfo.date);
        break;
      case 'month':
        this.renderMonthView(dateInfo.date);
        break;
    }
  }
  
  renderDayView(date) {
    // 清空内容区域
    const teacherColumns = document.querySelectorAll('.teacher-column');
    teacherColumns.forEach(column => {
      const slots = column.querySelector('.teacher-slots');
      if (slots) {
        slots.innerHTML = '';
      } else {
        // 如果没有找到teacher-slots容器，就创建一个
        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'teacher-slots';
        column.appendChild(slotsContainer);
      }
    });
    
    // 清空时间槽
    const timeSlotsContainer = document.getElementById('time-slots');
    if (timeSlotsContainer) {
      timeSlotsContainer.innerHTML = '';
    }
    
    // 获取选中日期的字符串格式
    const dateString = this.formatDateToString(date);
    
    // 筛选当天的课程
    const daySchedules = this.schedules.filter(s => s.date === dateString);
    
    // 生成时间槽
    this.generateTimeSlots();
    
    // 为每个教师列创建时间格子
    for (let i = 0; i < teacherColumns.length; i++) {
      const teacherId = parseInt(teacherColumns[i].dataset.teacherId);
      const teacherSlots = teacherColumns[i].querySelector('.teacher-slots');
      
      if (!teacherSlots) continue;
      
      // 创建时间格子
      for (let hour = 9; hour < 22; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          const timeCell = document.createElement('div');
          timeCell.className = 'time-cell';
          timeCell.dataset.time = timeString;
          timeCell.dataset.date = dateString;
          timeCell.dataset.teacherId = teacherId;
          timeCell.style.height = '60px';
          
          // 添加鼠标事件，用于时间段选择
          timeCell.addEventListener('mousedown', (e) => this.startTimeSelection(e, timeCell));
          timeCell.addEventListener('mouseover', (e) => this.continueTimeSelection(e, timeCell));
          timeCell.addEventListener('mouseup', (e) => this.endTimeSelection(e));
          
          // 触摸事件支持
          timeCell.addEventListener('touchstart', (e) => this.startTimeSelection(e, timeCell));
          timeCell.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const elementAtTouch = document.elementFromPoint(touch.clientX, touch.clientY);
            if (elementAtTouch && elementAtTouch.classList.contains('time-cell')) {
              this.continueTimeSelection(e, elementAtTouch);
            }
          });
          timeCell.addEventListener('touchend', (e) => this.endTimeSelection(e));
          
          teacherSlots.appendChild(timeCell);
        }
      }
    }
    
    // 渲染每个课程块
    daySchedules.forEach(schedule => {
      const teacherSlots = document.querySelector(`.teacher-column[data-teacher-id="${schedule.teacherId}"] .teacher-slots`);
      if (teacherSlots) {
        const courseElement = this.createCourseElement(schedule);
        teacherSlots.appendChild(courseElement);
      }
    });
    
    // 添加标题元素
    const scheduleTitle = document.querySelector('.schedule-title');
    if (scheduleTitle) {
      // 确保标题内容正确
      scheduleTitle.innerHTML = '<h2>每日排课表</h2>';
    }
  }
  
  // 生成时间槽
  generateTimeSlots() {
    const timeSlotsContainer = document.getElementById('time-slots');
    if (!timeSlotsContainer) return;
    
    // 清空内容
    timeSlotsContainer.innerHTML = '';
    
    // 添加时间格子
    for (let hour = 9; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = timeString;
        timeSlot.style.height = '60px';
        timeSlotsContainer.appendChild(timeSlot);
      }
    }
  }
  
  renderWeekView(date) {
    const container = document.querySelector('.schedule-content');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 创建周视图容器
    const weekViewContainer = document.createElement('div');
    weekViewContainer.className = 'week-view';
    
    // 获取当前周的日期范围
    const weekDates = this.getWeekDates(date);
    
    // 创建表头（显示日期）
    const headerRow = document.createElement('div');
    headerRow.className = 'week-header';
    
    // 添加时间列
    const timeHeader = document.createElement('div');
    timeHeader.className = 'week-time-header';
    timeHeader.textContent = '时间';
    headerRow.appendChild(timeHeader);
    
    // 添加每一天的列头
    weekDates.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'week-day-header';
      
      const dayName = document.createElement('div');
      dayName.className = 'week-day-name';
      dayName.textContent = this.getDayName(day.date);
      
      const dayDate = document.createElement('div');
      dayDate.className = 'week-day-date';
      dayDate.textContent = `${day.date.getMonth() + 1}月${day.date.getDate()}日`;
      
      dayHeader.appendChild(dayName);
      dayHeader.appendChild(dayDate);
      headerRow.appendChild(dayHeader);
    });
    
    weekViewContainer.appendChild(headerRow);
    
    // 创建时间槽
    for (let hour = 8; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeRow = document.createElement('div');
        timeRow.className = 'week-time-row';
        
        // 添加时间标签
        const timeCell = document.createElement('div');
        timeCell.className = 'week-time-cell';
        timeCell.textContent = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        timeRow.appendChild(timeCell);
        
        // 添加每天的时间格子
        weekDates.forEach(day => {
          const dayCell = document.createElement('div');
          dayCell.className = 'week-day-cell';
          dayCell.dataset.date = day.dateString;
          dayCell.dataset.time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          dayCell.dataset.teacherId = this.currentUser.teacherId; // 添加教师ID以兼容选择逻辑
          
          // 修改为长按创建课程
          dayCell.addEventListener('mousedown', (e) => this.startTimeSelection(e, dayCell));
          dayCell.addEventListener('mouseover', (e) => this.continueTimeSelection(e, dayCell));
          dayCell.addEventListener('mouseup', (e) => this.endTimeSelection(e));
          
          // 触摸事件支持
          dayCell.addEventListener('touchstart', (e) => this.startTimeSelection(e, dayCell));
          dayCell.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const elementAtTouch = document.elementFromPoint(touch.clientX, touch.clientY);
            if (elementAtTouch && (elementAtTouch.classList.contains('week-day-cell') || elementAtTouch.classList.contains('time-cell'))) {
              this.continueTimeSelection(e, elementAtTouch);
            }
          });
          dayCell.addEventListener('touchend', (e) => this.endTimeSelection(e));
          
          timeRow.appendChild(dayCell);
        });
        
        weekViewContainer.appendChild(timeRow);
      }
    }
    
    container.appendChild(weekViewContainer);
    
    // 渲染每天的课程
    weekDates.forEach((day, dayIndex) => {
      // 筛选当天的课程
      const daySchedules = this.schedules.filter(s => s.date === day.dateString);
      
      // 根据当前用户角色筛选课程
      let filteredSchedules;
      if (this.currentUser.role === 'admin') {
        filteredSchedules = daySchedules;
      } else {
        filteredSchedules = daySchedules.filter(s => s.teacherId === this.currentUser.teacherId);
      }
      
      // 在周视图中渲染课程
      filteredSchedules.forEach(schedule => {
        const courseElement = this.createWeekCourseElement(schedule, dayIndex);
        container.appendChild(courseElement);
      });
    });
  }
  
  renderMonthView(date) {
    const container = document.querySelector('.schedule-content');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 创建月视图容器
    const monthViewContainer = document.createElement('div');
    monthViewContainer.className = 'month-view';
    
    // 获取当月的第一天和最后一天
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 创建表头（显示星期）
    const headerRow = document.createElement('div');
    headerRow.className = 'month-header';
    
    // 添加星期表头
    const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
    daysOfWeek.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'month-day-header';
      dayHeader.textContent = day;
      headerRow.appendChild(dayHeader);
    });
    
    monthViewContainer.appendChild(headerRow);
    
    // 创建日历网格
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'month-grid';
    
    // 确定第一天是星期几
    const firstDayOfWeek = firstDay.getDay();
    
    // 添加上个月的日期（如果需要）
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < firstDayOfWeek; i++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'month-day-cell month-day-prev';
      
      const dayNumber = document.createElement('div');
      dayNumber.className = 'month-day-number';
      dayNumber.textContent = prevMonthLastDay - firstDayOfWeek + i + 1;
      
      dayCell.appendChild(dayNumber);
      calendarGrid.appendChild(dayCell);
    }
    
    // 添加当月的日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      const currentDateString = this.formatDateToString(currentDate);
      
      const dayCell = document.createElement('div');
      dayCell.className = 'month-day-cell';
      dayCell.dataset.date = currentDateString;
      dayCell.dataset.teacherId = this.currentUser.teacherId; // 添加教师ID以兼容选择逻辑
      
      // 如果是今天，高亮显示
      if (this.isToday(currentDate)) {
        dayCell.classList.add('month-day-today');
      }
      
      const dayNumber = document.createElement('div');
      dayNumber.className = 'month-day-number';
      dayNumber.textContent = i;
      
      const courseContainer = document.createElement('div');
      courseContainer.className = 'month-day-courses';
      
      // 筛选当天的课程
      const dayCourses = this.schedules.filter(s => s.date === currentDateString);
      
      // 显示所有课程但标记当前教师的课程
      let coursesToShow = dayCourses.slice(0, 3);
      
      coursesToShow.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.className = 'month-day-course';
        courseItem.style.backgroundColor = course.color;
        
        // 根据是否是当前教师的课程设置透明度
        const isCurrentTeacherCourse = this.currentUser.teacherId === course.teacherId;
        if (!isCurrentTeacherCourse) {
          courseItem.style.opacity = '0.6';  // 非当前教师的课程设置较低的透明度
        }
        
        // 获取学生名称，如果有多个学生，只显示第一个
        const studentName = course.students && course.students.length > 0 
                          ? course.students[0] 
                          : '';
        
        // 课程内容 - 修改显示格式，只显示课程名称和时间，不显示教师名称
        const displayText = studentName 
                          ? `${course.startTime} ${course.subject} ${studentName}`
                          : `${course.startTime} ${course.subject}`;
        
        courseItem.textContent = displayText;
        courseItem.addEventListener('click', (e) => {
          e.stopPropagation();
          this.showCourseDetails(course);
        });
        courseContainer.appendChild(courseItem);
      });
      
      if (dayCourses.length > 3) {
        const moreItem = document.createElement('div');
        moreItem.className = 'month-day-more';
        moreItem.textContent = `还有${dayCourses.length - 3}个课程`;
        moreItem.addEventListener('click', (e) => {
          e.stopPropagation();
          // 显示当天所有课程的弹窗
          this.showDayCoursesList(dayCourses, currentDateString);
        });
        courseContainer.appendChild(moreItem);
      }
      
      // 修改为长按创建课程
      dayCell.addEventListener('mousedown', (e) => {
        // 确保点击的是日期单元格本身，而不是里面的课程项
        if (e.target === dayCell || e.target === dayNumber || e.target === courseContainer) {
          this.startTimeSelection(e, dayCell);
        }
      });
      dayCell.addEventListener('mouseup', (e) => {
        if (e.target === dayCell || e.target === dayNumber || e.target === courseContainer) {
          this.endTimeSelection(e);
        }
      });
      
      // 触摸事件支持
      dayCell.addEventListener('touchstart', (e) => {
        if (e.target === dayCell || e.target === dayNumber || e.target === courseContainer) {
          this.startTimeSelection(e, dayCell);
        }
      });
      dayCell.addEventListener('touchend', (e) => {
        if (e.target === dayCell || e.target === dayNumber || e.target === courseContainer) {
          this.endTimeSelection(e);
        }
      });
      
      dayCell.appendChild(dayNumber);
      dayCell.appendChild(courseContainer);
      calendarGrid.appendChild(dayCell);
    }
    
    // 填充下个月的开始几天（如果需要）
    const daysFromNextMonth = 42 - (firstDayOfWeek + lastDay.getDate());
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'month-day-cell month-day-next';
      
      const dayNumber = document.createElement('div');
      dayNumber.className = 'month-day-number';
      dayNumber.textContent = i;
      
      dayCell.appendChild(dayNumber);
      calendarGrid.appendChild(dayCell);
    }
    
    monthViewContainer.appendChild(calendarGrid);
    container.appendChild(monthViewContainer);
  }
  
  showDayCoursesList(courses, dateString) {
    // 创建弹窗显示当天所有课程
    alert(`${dateString} 共有 ${courses.length} 个课程`);
    // 实际应用中应该显示一个更美观的弹窗列表
  }
  
  isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
  
  getWeekDates(date) {
    const result = [];
    const currentDate = new Date(date);
    const day = currentDate.getDay(); // 0是周日，1是周一，以此类推
    
    // 获取本周的周一（如果当前是周日，则获取上周的周一）
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() - (day === 0 ? 6 : day - 1));
    
    // 获取本周的7天
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      result.push({
        date: date,
        dateString: this.formatDateToString(date)
      });
    }
    
    return result;
  }
  
  getDayName(date) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  }
  
  // 获取课程对应颜色
  getColorForSubject(subject) {
    // 如果已经有这个课程的颜色，则返回
    if (this.subjectColors[subject]) {
      return this.subjectColors[subject];
    }
    
    // 预定义颜色列表
    const colors = [
      '#e491a9', // 柔和粉红色
      '#9f86c0', // 淡紫色
      '#5cbdb9', // 蒂芙尼蓝绿色
      '#f7a595', // 珊瑚色
      '#fdcea9', // 桃色
      '#a2d7d2', // 薄荷绿
      '#bfe9b7', // 淡绿色
      '#dadbe8', // 淡紫色
      '#d1c2d3', // 薰衣草色
      '#e8d3a9'  // 浅棕黄色
    ];
    
    // 根据课程名称的哈希值分配颜色
    const hashCode = subject.split('').reduce((hash, char) => {
      return char.charCodeAt(0) + ((hash << 5) - hash);
    }, 0);
    
    // 确保是正数
    const index = Math.abs(hashCode % colors.length);
    this.subjectColors[subject] = colors[index];
    
    return colors[index];
  }
  
  // 初始化课程颜色映射
  initSubjectColors() {
    // 更新现有课程的颜色映射
    this.schedules.forEach(schedule => {
      if (schedule.subject && !this.subjectColors[schedule.subject]) {
        this.subjectColors[schedule.subject] = schedule.color;
      }
    });
    
    // 为课程类别分配颜色
    this.courseCategories.forEach(category => {
      if (!this.subjectColors[category.name]) {
        // 使用预定义颜色列表中的随机颜色
        this.getColorForSubject(category.name);
      }
    });
  }
  
  createCourseElement(schedule) {
    const startTime = this.parseTime(schedule.startTime);
    const endTime = this.parseTime(schedule.endTime);
    const duration = (endTime - startTime) / (1000 * 60); // 课程时长（分钟）
    
    const courseElement = document.createElement('div');
    courseElement.className = 'course-item';
    courseElement.style.backgroundColor = schedule.color;
    
    // 根据是否是当前教师的课程设置透明度
    const isCurrentTeacherCourse = this.currentUser.teacherId === schedule.teacherId;
    if (!isCurrentTeacherCourse) {
      courseElement.style.opacity = '0.6';  // 非当前教师的课程设置较低的透明度
    }
    
    // 计算位置和高度
    const startMinutes = this.timeToMinutes(schedule.startTime);
    const endMinutes = this.timeToMinutes(schedule.endTime);
    const startFromDayMinutes = startMinutes - (9 * 60); // 从早上9点开始计算
    const durationMinutes = endMinutes - startMinutes;
    
    // 每60px代表30分钟，所以1分钟是2px
    const topPosition = (startFromDayMinutes * 2); // 不再加上教师标题的高度
    const height = durationMinutes * 2;
    
    courseElement.style.top = `${topPosition}px`;
    courseElement.style.height = `${height}px`;
    courseElement.style.position = 'absolute';
    courseElement.style.left = '5px';
    courseElement.style.right = '5px';
    courseElement.style.zIndex = '10';
    courseElement.style.borderRadius = 'var(--radius-sm)';
    courseElement.style.padding = 'var(--spacing-sm)';
    courseElement.style.color = 'white';
    courseElement.style.boxShadow = 'var(--shadow-sm)';
    courseElement.style.overflow = 'hidden';
    courseElement.dataset.id = schedule.id;
    
    // 获取教室名称
    const roomName = schedule.roomName || this.getRoomName(schedule.room);
    
    // 获取学生名称，如果有多个学生，只显示第一个
    const studentName = schedule.students && schedule.students.length > 0 
                      ? schedule.students[0] 
                      : '';
    
    // 课程内容 - 修改显示格式，只显示课程名称和学生姓名
    const firstLine = studentName ? `${schedule.subject} ${studentName}` : schedule.subject;
    
    courseElement.innerHTML = `
      <div class="course-title">${firstLine}</div>
      <div class="course-time">${schedule.startTime} - ${schedule.endTime}</div>
      <div class="course-room">${roomName}</div>
    `;
    
    // 添加点击事件
    courseElement.addEventListener('click', (e) => {
      e.stopPropagation(); // 阻止事件冒泡，避免触发时间格子的点击事件
      this.showCourseDetails(schedule);
    });
    
    return courseElement;
  }
  
  // 获取教室名称
  getRoomName(roomId) {
    const room = this.rooms.find(r => r.id === roomId);
    return room ? room.name : roomId;
  }
  
  createWeekCourseElement(schedule, dayIndex) {
    const startTime = this.parseTime(schedule.startTime);
    const endTime = this.parseTime(schedule.endTime);
    const duration = (endTime - startTime) / (1000 * 60); // 课程时长（分钟）
    
    const courseElement = document.createElement('div');
    courseElement.className = 'week-course-item';
    courseElement.style.backgroundColor = schedule.color;

    // 根据是否是当前教师的课程设置透明度
    const isCurrentTeacherCourse = this.currentUser.teacherId === schedule.teacherId;
    if (!isCurrentTeacherCourse) {
      courseElement.style.opacity = '0.6';  // 非当前教师的课程设置较低的透明度
    }
    
    courseElement.style.top = `${this.timeToPixels(startTime) + 40}px`; // 40px是表头高度
    courseElement.style.height = `${duration / 30 * 60}px`; // 每30分钟60像素
    courseElement.style.left = `${60 + dayIndex * 14.28}%`; // 时间列宽度60px，每天的宽度为14.28%
    courseElement.style.width = '14.28%';
    courseElement.dataset.id = schedule.id;
    
    // 获取学生名称，如果有多个学生，只显示第一个
    const studentName = schedule.students && schedule.students.length > 0 
                      ? schedule.students[0] 
                      : '';
                      
    // 课程内容 - 修改显示格式，只显示课程名称和学生姓名，不显示教师名称
    const firstLine = studentName ? `${schedule.subject} ${studentName}` : schedule.subject;
    
    courseElement.innerHTML = `
      <div class="course-title">${firstLine}</div>
      <div class="course-time">${schedule.startTime} - ${schedule.endTime}</div>
      <div class="course-room">${schedule.roomName || this.getRoomName(schedule.room)}</div>
    `;
    
    // 添加点击事件
    courseElement.addEventListener('click', () => this.showCourseDetails(schedule));
    
    return courseElement;
  }
  
  parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  
  timeToPixels(time) {
    // 计算从9:00开始的偏移量
    const start = new Date();
    start.setHours(9, 0, 0, 0);
    const diffMinutes = (time - start) / (1000 * 60);
    return diffMinutes / 30 * 60; // 每30分钟60像素
  }
  
  showCourseDetails(schedule) {
    // 显示课程详情，在实际应用中应该显示一个弹窗
    console.log('课程详情', schedule);
    
    // 获取学生信息
    const studentsText = schedule.students && schedule.students.length > 0 
                        ? schedule.students.join(', ') 
                        : '无';
    
    // 检查权限：只有课程的教师本人或管理员可以编辑和删除
    const hasEditPermission = this.currentUser.role === 'admin' || this.currentUser.teacherId === schedule.teacherId;
    
    // 创建一个简单的弹窗显示课程详情
    const modalHtml = `
      <div class="modal-header">
        <h3>${schedule.subject}</h3>
        <button class="close">&times;</button>
      </div>
      <div class="modal-body">
        <p><strong>时间：</strong>${schedule.date} ${schedule.startTime} - ${schedule.endTime}</p>
        <p><strong>教室：</strong>${schedule.roomName || this.getRoomName(schedule.room)}</p>
        <p><strong>教师：</strong>${schedule.teacherName || this.getTeacherName(schedule.teacherId)}</p>
        <p><strong>学生：</strong>${studentsText}</p>
        ${hasEditPermission ? `
        <div class="modal-actions">
          <button class="btn-edit" data-id="${schedule.id}">编辑</button>
          <button class="btn-delete" data-id="${schedule.id}">删除</button>
        </div>
        ` : ''}
      </div>
    `;
    
    const modal = document.getElementById('course-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.innerHTML = modalHtml;
    
    // 注册按钮事件
    modalContent.querySelector('.close').addEventListener('click', () => this.hideModal());
    
    if (hasEditPermission) {
      modalContent.querySelector('.btn-edit').addEventListener('click', () => this.editCourse(schedule));
      modalContent.querySelector('.btn-delete').addEventListener('click', () => this.deleteCourse(schedule));
    }
    
    // 显示弹窗
    modal.style.display = 'block';
  }
  
  editCourse(schedule) {
    // 课程编辑功能
    
    // 检查权限：只有课程的教师本人或管理员可以编辑
    if (this.currentUser.role !== 'admin' && this.currentUser.teacherId !== schedule.teacherId) {
      this.showToast('您没有权限编辑此课程');
      return;
    }
    
    const modal = document.getElementById('course-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    // 学生信息
    const studentsText = schedule.students && schedule.students.length > 0 
                        ? schedule.students.join(', ') 
                        : '';
    
    // 构建课程类别选项
    const courseOptions = this.courseCategories.map(category => 
      `<option value="${category.name}" ${schedule.subject === category.name ? 'selected' : ''}>${category.name}</option>`
    ).join('');
    
    // 创建编辑表单
    modalContent.innerHTML = `
      <div class="modal-header">
        <h3>编辑课程</h3>
        <button class="close">&times;</button>
      </div>
      <div class="modal-body">
        <form id="edit-course-form">
          <div class="form-group">
            <label for="edit-course-name">课程名称</label>
            <select id="edit-course-name" required>
              <option value="">请选择课程</option>
              ${courseOptions}
            </select>
          </div>
          <div class="form-group">
            <label for="edit-course-date">日期</label>
            <input type="date" id="edit-course-date" required value="${schedule.date}">
          </div>
          <div class="form-group">
            <label for="edit-course-start">开始时间</label>
            <input type="time" id="edit-course-start" step="1800" required value="${schedule.startTime}">
          </div>
          <div class="form-group">
            <label for="edit-course-end">结束时间</label>
            <input type="time" id="edit-course-end" step="1800" required value="${schedule.endTime}">
          </div>
          <div class="form-group">
            <label for="edit-course-room">教室</label>
            <select id="edit-course-room" required>
              <option value="">请选择教室</option>
            </select>
          </div>
          <div class="form-group">
            <label for="edit-course-students">学生</label>
            <textarea id="edit-course-students" placeholder="请输入学生姓名，多个学生用逗号分隔">${studentsText}</textarea>
          </div>
          <input type="hidden" id="edit-course-id" value="${schedule.id}">
          <input type="hidden" id="edit-course-teacher" value="${schedule.teacherId}">
          <button type="submit" class="btn-submit">保存更改</button>
        </form>
      </div>
    `;
    
    // 填充教室选项
    const roomSelect = modalContent.querySelector('#edit-course-room');
    if (roomSelect) {
      this.rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = room.name;
        // 选中当前课程的教室
        if (room.id === schedule.room) {
          option.selected = true;
        }
        roomSelect.appendChild(option);
      });
    }
    
    // 注册表单提交事件
    const form = modalContent.querySelector('#edit-course-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.updateCourse();
    });
    
    // 注册关闭按钮事件
    modalContent.querySelector('.close').addEventListener('click', () => this.hideModal());
    
    // 显示弹窗
    modal.style.display = 'block';
  }
  
  updateCourse() {
    const id = parseInt(document.getElementById('edit-course-id').value);
    const course = this.schedules.find(s => s.id === id);
    
    if (!course) {
      alert('课程不存在');
      return;
    }
    
    const newName = document.getElementById('edit-course-name').value;
    const newDate = document.getElementById('edit-course-date').value;
    const newStartTime = document.getElementById('edit-course-start').value;
    const newEndTime = document.getElementById('edit-course-end').value;
    const newRoom = document.getElementById('edit-course-room').value;
    const studentsText = document.getElementById('edit-course-students').value;
    const students = studentsText ? studentsText.split(',').map(s => s.trim()).filter(s => s) : [];
    
    // 使用课程名称自动分配颜色
    const newColor = this.getColorForSubject(newName);
    
    // 验证时间
    if (this.parseTime(newStartTime) >= this.parseTime(newEndTime)) {
      alert('结束时间必须晚于开始时间');
      return;
    }
    
    // 验证房间占用情况（排除当前课程）
    if (!this.isRoomAvailable(newRoom, newDate, newStartTime, newEndTime, id)) {
      alert('该教室在选定的时间段已被占用');
      return;
    }
    
    // 获取教室名称
    const roomObj = this.rooms.find(r => r.id === newRoom);
    const roomName = roomObj ? roomObj.name : newRoom;
    
    // 更新课程信息
    course.subject = newName;
    course.date = newDate;
    course.startTime = newStartTime;
    course.endTime = newEndTime;
    course.room = newRoom;
    course.roomName = roomName;
    course.color = newColor;
    course.students = students;
    
    // 保存到localStorage
    try {
      localStorage.setItem('schedules', JSON.stringify(this.schedules));
    } catch (e) {
      console.error('无法保存课程数据到localStorage:', e);
    }
    
    // 关闭弹窗并刷新视图
    this.hideModal();
    this.renderSchedules();
    
    // 显示成功信息
    this.showToast('课程已更新');
  }
  
  deleteCourse(schedule) {
    // 课程删除功能
    
    // 检查权限：只有课程的教师本人或管理员可以删除
    if (this.currentUser.role !== 'admin' && this.currentUser.teacherId !== schedule.teacherId) {
      this.showToast('您没有权限删除此课程');
      return;
    }
    
    if (confirm(`确定要删除课程"${schedule.subject}"吗？此操作无法撤销。`)) {
      // 从数据中移除课程
      this.schedules = this.schedules.filter(s => s.id !== schedule.id);
      
      // 保存到localStorage
      try {
        localStorage.setItem('schedules', JSON.stringify(this.schedules));
      } catch (e) {
        console.error('无法保存课程数据到localStorage:', e);
      }
      
      // 关闭弹窗并刷新视图
      this.hideModal();
      this.renderSchedules();
      
      // 显示成功信息
      this.showToast('课程已删除');
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
  
  isRoomAvailable(roomId, date, startTime, endTime, excludeId = null) {
    // 检查房间在指定时间段是否可用（可以排除指定的课程ID）
    const conflicts = this.schedules.filter(s => 
      s.room === roomId && 
      s.date === date && 
      (excludeId === null || s.id !== excludeId) && // 排除当前编辑的课程
      !(
        this.parseTime(s.endTime) <= this.parseTime(startTime) || 
        this.parseTime(s.startTime) >= this.parseTime(endTime)
      )
    );
    
    return conflicts.length === 0;
  }
  
  setupEventListeners() {
    // 监听日历变更事件
    document.addEventListener('calendar:dateChanged', (e) => this.renderSchedules());
    document.addEventListener('calendar:viewChanged', (e) => this.renderSchedules());
    
    // 添加课程按钮
    const addButton = document.getElementById('add-course');
    if (addButton) {
      addButton.addEventListener('click', () => this.showAddCourseModal());
    }
    
    // 关闭弹窗按钮
    const closeButton = document.querySelector('.modal .close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.hideModal());
    }
    
    // 颜色选择
    document.querySelectorAll('.color-option').forEach(option => {
      option.addEventListener('click', () => this.selectColor(option));
    });
    
    // 表单提交
    const form = document.getElementById('course-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.createCourse();
      });
    }
    
    // 添加课程统计按钮
    const statsButton = document.getElementById('filter');
    if (statsButton) {
      // 更改按钮内容，从"筛选"改为"统计"
      statsButton.textContent = '统计';
      statsButton.addEventListener('click', () => this.showStatsModal());
    }
    
    // 添加"我的"个人中心按钮
    const profileButton = document.getElementById('view-rooms');
    if (profileButton) {
      // 更改按钮内容，从"教室"改为"我的"
      profileButton.textContent = '我的';
      profileButton.addEventListener('click', () => this.showProfileModal());
    }
    
    // 同步表头与内容区的滚动
    this.setupSyncScrolling();
  }
  
  // 设置同步滚动
  setupSyncScrolling() {
    // 获取正确的内容区域和表头元素
    const contentArea = document.querySelector('.content-area');
    const teachersColumns = document.querySelector('.teachers-columns');
    const teachersHeaderRow = document.querySelector('.teachers-header-row');
    const timeHeaderCell = document.querySelector('.time-header-cell');
    
    if (contentArea && teachersHeaderRow && teachersColumns) {
      // 当内容区域滚动时同步表头
      contentArea.addEventListener('scroll', () => {
        // 使用CSS变换来移动教师表头，而不是改变滚动位置
        teachersHeaderRow.style.transform = `translateX(-${contentArea.scrollLeft}px)`;
      });
      
      // 给老师标题添加点击导航功能
      const teacherHeaders = document.querySelectorAll('.teacher-header');
      teacherHeaders.forEach((header, index) => {
        header.addEventListener('click', () => {
          // 找到对应的老师列
          const teacherColumn = document.querySelector(`.teacher-column[data-teacher-id="${index + 1}"]`);
          if (teacherColumn) {
            // 计算滚动位置，使老师列居中
            const columnLeft = teacherColumn.offsetLeft;
            const containerWidth = contentArea.clientWidth;
            const columnWidth = teacherColumn.clientWidth;
            const timeColumnWidth = 60; // 时间列宽度
            const scrollTo = columnLeft - (containerWidth - columnWidth) / 2 + timeColumnWidth;
            
            // 平滑滚动到目标位置
            contentArea.scrollTo({
              left: scrollTo,
              behavior: 'smooth'
            });
            
            // 添加高亮效果
            this.highlightColumn(index + 1);
          }
        });
      });
      
      // 添加水平滑动支持
      let touchStartX = 0;
      let scrollLeft = 0;
      
      // 内容区域触摸事件
      contentArea.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        scrollLeft = contentArea.scrollLeft;
      });
      
      contentArea.addEventListener('touchmove', (e) => {
        if (!touchStartX) return;
        const touchX = e.touches[0].clientX;
        const walk = (touchStartX - touchX);
        contentArea.scrollLeft = scrollLeft + walk;
      });
      
      contentArea.addEventListener('touchend', () => {
        touchStartX = 0;
      });
      
      // 表头触摸事件 - 通过表头滑动来控制内容区域
      teachersHeaderRow.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        scrollLeft = contentArea.scrollLeft;
        teachersHeaderRow.style.cursor = 'grabbing';
        e.preventDefault(); // 防止点击事件
      });
      
      teachersHeaderRow.addEventListener('touchmove', (e) => {
        if (!touchStartX) return;
        const touchX = e.touches[0].clientX;
        const walk = (touchStartX - touchX);
        contentArea.scrollLeft = scrollLeft + walk;
        e.preventDefault(); // 防止页面滚动
      });
      
      teachersHeaderRow.addEventListener('touchend', () => {
        touchStartX = 0;
        teachersHeaderRow.style.cursor = '';
      });
      
      // 鼠标拖动事件
      let isMouseDown = false;
      
      teachersHeaderRow.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        touchStartX = e.clientX;
        scrollLeft = contentArea.scrollLeft;
        teachersHeaderRow.style.cursor = 'grabbing';
        e.preventDefault();
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        const x = e.clientX;
        const walk = (touchStartX - x);
        contentArea.scrollLeft = scrollLeft + walk;
      });
      
      document.addEventListener('mouseup', () => {
        isMouseDown = false;
        teachersHeaderRow.style.cursor = 'grab';
      });
    }
  }
  
  // 高亮显示老师列
  highlightColumn(teacherId) {
    // 移除之前的高亮
    document.querySelectorAll('.teacher-column.highlight, .teacher-header.highlight').forEach(el => {
      el.classList.remove('highlight');
    });
    
    // 添加新的高亮
    const teacherColumn = document.querySelector(`.teacher-column[data-teacher-id="${teacherId}"]`);
    const teacherHeader = document.querySelectorAll('.teacher-header')[teacherId - 1];
    
    if (teacherColumn && teacherHeader) {
      teacherColumn.classList.add('highlight');
      teacherHeader.classList.add('highlight');
      
      // 300ms后移除高亮
      setTimeout(() => {
        teacherColumn.classList.remove('highlight');
        teacherHeader.classList.remove('highlight');
      }, 1000);
    }
  }
  
  showAddCourseModal(date, startTime, endTime, teacherId, autoSelectTeacher) {
    const modal = document.getElementById('course-modal');
    if (modal) {
      // 重置弹窗内容为添加课程表单
      const modalContent = modal.querySelector('.modal-content');
      if (modalContent) {
        // 获取用户信息
        let currentTeacherId = this.currentUser.teacherId || this.currentUser.id;
        
        // 允许用户创建课程，无论选择哪个教师列
        // 如果是教师用户，则自动设置教师为当前用户
        if (this.currentUser.role !== 'admin') {
          teacherId = currentTeacherId;
          autoSelectTeacher = true;
        }
        
        // 如果是从教师列创建，或者不是管理员，则隐藏教师选择
        const teacherFormGroup = (autoSelectTeacher || this.currentUser.role !== 'admin') ? 'display: none;' : '';
        
        // 构建课程类别选项
        const courseOptions = this.courseCategories.map(category => 
          `<option value="${category.name}">${category.name}</option>`
        ).join('');
        
        modalContent.innerHTML = `
          <div class="modal-header">
            <h3>创建新课程</h3>
            <button class="close">&times;</button>
          </div>
          <div class="modal-body">
            <form id="course-form">
              <div class="form-group">
                <label for="course-name">课程名称</label>
                <select id="course-name" required>
                  <option value="">请选择课程</option>
                  ${courseOptions}
                </select>
              </div>
              <div class="form-group" style="${teacherFormGroup}">
                <label for="course-teacher">教师</label>
                <select id="course-teacher" required>
                  <option value="">请选择教师</option>
                  ${this.teachers.map(teacher => 
                    `<option value="${teacher.id}" ${(autoSelectTeacher && teacher.id == teacherId) || (this.currentUser.role !== 'admin' && teacher.id == currentTeacherId) ? 'selected' : ''}>${teacher.name}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="form-group">
                <label for="course-date">日期</label>
                <input type="date" id="course-date" required>
              </div>
              <div class="form-group">
                <label for="course-start">开始时间</label>
                <input type="time" id="course-start" step="1800" required>
              </div>
              <div class="form-group">
                <label for="course-end">结束时间</label>
                <input type="time" id="course-end" step="1800" required>
              </div>
              <div class="form-group">
                <label for="course-room">教室</label>
                <select id="course-room" required>
                  <option value="">请选择教室</option>
                </select>
              </div>
              <div class="form-group">
                <label for="course-students">学生</label>
                <textarea id="course-students" placeholder="请输入学生姓名，多个学生用逗号分隔"></textarea>
              </div>
              ${(autoSelectTeacher || this.currentUser.role !== 'admin') ? `<input type="hidden" id="course-teacher" value="${teacherId}">` : ''}
              <button type="submit" class="btn-submit">保存</button>
            </form>
          </div>
        `;
        
        // 重新注册事件
        modalContent.querySelector('.close').addEventListener('click', () => this.hideModal());
        
        // 填充教室选项
        const roomSelect = modalContent.querySelector('#course-room');
        if (roomSelect) {
          this.rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = room.name;
            roomSelect.appendChild(option);
          });
        }
        
        // 表单提交
        const form = modalContent.querySelector('#course-form');
        if (form) {
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createCourse();
          });
        }
      }
      
      // 重置表单
      setTimeout(() => {
        const form = document.getElementById('course-form');
        if (form) form.reset();
        
        // 设置默认日期和时间
        const dateInput = document.getElementById('course-date');
        const startTimeInput = document.getElementById('course-start');
        const endTimeInput = document.getElementById('course-end');
        
        if (dateInput && date) {
          dateInput.value = date;
        } else if (dateInput && window.calendarController) {
          dateInput.value = window.calendarController.getDateString();
        }
        
        if (startTimeInput && startTime) {
          startTimeInput.value = startTime;
        }
        
        if (endTimeInput && endTime) {
          endTimeInput.value = endTime;
        } else if (endTimeInput && startTime) {
          // 设置默认结束时间为开始时间后1小时
          const [hours, minutes] = startTime.split(':').map(Number);
          let endHour = hours + 1;
          if (endHour > 21) endHour = 21; // 限制最晚到晚上10点
          endTimeInput.value = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }, 100);
      
      // 清除选中的时间格子
      this.clearSelectedTimeCells();
      
      // 显示弹窗
      modal.style.display = 'block';
      modal.classList.add('fadeIn');
      modal.querySelector('.modal-content').classList.add('slideUp');
    }
  }
  
  hideModal() {
    const modal = document.getElementById('course-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('fadeIn');
      modal.querySelector('.modal-content').classList.remove('slideUp');
    }
  }
  
  createCourse() {
    // 获取表单数据
    const courseName = document.getElementById('course-name').value;
    const courseDate = document.getElementById('course-date').value;
    const startTime = document.getElementById('course-start').value;
    const endTime = document.getElementById('course-end').value;
    const room = document.getElementById('course-room').value;
    const teacherId = parseInt(document.getElementById('course-teacher').value);
    const studentsText = document.getElementById('course-students').value;
    
    // 使用自动分配的颜色，而非手动选择的颜色
    const color = this.getColorForSubject(courseName);
    
    // 处理学生信息
    const students = studentsText ? studentsText.split(',').map(s => s.trim()).filter(s => s) : [];
    
    // 表单验证
    if (!courseName || !courseDate || !startTime || !endTime || !room || !teacherId) {
      alert('请填写所有必填字段');
      return;
    }
    
    // 获取用户信息
    let currentTeacherId = this.currentUser.teacherId || this.currentUser.id;
    
    // 普通教师只能为自己创建课程，这段代码在showAddCourseModal中已经保证了
    // 此处无需再检查权限，因为表单中的教师ID已经被设置为当前用户
    
    // 验证时间
    if (this.parseTime(startTime) >= this.parseTime(endTime)) {
      alert('结束时间必须晚于开始时间');
      return;
    }
    
    // 验证房间占用情况
    if (!this.isRoomAvailable(room, courseDate, startTime, endTime)) {
      alert('该教室在选定的时间段已被占用');
      return;
    }
    
    // 获取教室名称和教师名称
    const roomObj = this.rooms.find(r => r.id === room);
    const teacherObj = this.teachers.find(t => t.id === teacherId);
    
    const roomName = roomObj ? roomObj.name : room;
    const teacherName = teacherObj ? teacherObj.name : '未知教师';
    
    // 创建新课程对象
    const newCourse = {
      id: Date.now(), // 临时ID，实际应用中应由服务器生成
      teacherId: teacherId,
      teacherName: teacherName,
      subject: courseName,
      date: courseDate,
      startTime: startTime,
      endTime: endTime,
      room: room,
      roomName: roomName,
      color: color,
      students: students
    };
    
    // 添加到数据中
    this.schedules.push(newCourse);
    
    // 保存到localStorage
    try {
      localStorage.setItem('schedules', JSON.stringify(this.schedules));
    } catch (e) {
      console.error('无法保存课程数据到localStorage:', e);
    }
    
    // 关闭弹窗并刷新视图
    this.hideModal();
    this.renderSchedules();
    
    // 显示成功消息
    this.showToast(`成功创建课程: ${courseName}`);
    
    // 在实际应用中，这里应该调用API保存课程
    console.log('创建新课程', newCourse);
  }
  
  showStatsModal() {
    const modal = document.getElementById('course-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    // 获取当前教师的数据
    const currentTeacherId = this.currentUser.teacherId;
    const teacherName = this.getTeacherName(currentTeacherId);
    
    // 筛选当前教师的所有课程
    const allTeacherCourses = this.schedules.filter(s => s.teacherId === currentTeacherId);
    
    // 获取课程费率设置，如果不存在则创建默认值
    const courseRates = JSON.parse(localStorage.getItem(`course_rates_${currentTeacherId}`) || '{}');
    
    // 为没有设置费率的课程类型设置默认费率
    const uniqueSubjects = [...new Set(allTeacherCourses.map(course => course.subject))];
    uniqueSubjects.forEach(subject => {
      if (courseRates[subject] === undefined) {
        courseRates[subject] = 200; // 默认每小时200元
      }
    });
    
    // 保存更新后的费率
    localStorage.setItem(`course_rates_${currentTeacherId}`, JSON.stringify(courseRates));
    
    // 获取当前日期
    const today = new Date();
    const currentDate = this.formatDateToString(today);
    
    // 获取本周开始和结束日期
    const dayOfWeek = today.getDay(); // 0是周日，1是周一，以此类推
    const startOfWeek = new Date(today);
    // 将日期设置为本周一 (如果今天是周日，则为上周一)
    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // 周日
    
    const startOfWeekStr = this.formatDateToString(startOfWeek);
    const endOfWeekStr = this.formatDateToString(endOfWeek);
    
    // 获取本月开始和结束日期
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const startOfMonthStr = this.formatDateToString(startOfMonth);
    const endOfMonthStr = this.formatDateToString(endOfMonth);
    
    // 筛选课程：今日、本周、本月
    const todayCourses = allTeacherCourses.filter(course => course.date === currentDate);
    
    const weekCourses = allTeacherCourses.filter(course => {
      const courseDate = course.date;
      return courseDate >= startOfWeekStr && courseDate <= endOfWeekStr;
    });
    
    const monthCourses = allTeacherCourses.filter(course => {
      const courseDate = course.date;
      return courseDate >= startOfMonthStr && courseDate <= endOfMonthStr;
    });
    
    // 根据时间范围获取课程和统计数据的函数
    const getStatsForRange = (courses) => {
      // 计算总课时数
      const totalHours = courses.reduce((total, course) => {
        const startTime = this.parseTime(course.startTime);
        const endTime = this.parseTime(course.endTime);
        const hours = (endTime - startTime) / (1000 * 60 * 60); // 小时数
        return total + hours;
      }, 0);
      
      // 按课程类型统计
      const subjectStats = {};
      courses.forEach(course => {
        const subject = course.subject;
        if (!subjectStats[subject]) {
          subjectStats[subject] = {
            hours: 0,
            income: 0
          };
        }
        
        // 计算课时和收入
        const startTime = this.parseTime(course.startTime);
        const endTime = this.parseTime(course.endTime);
        const hours = (endTime - startTime) / (1000 * 60 * 60);
        
        subjectStats[subject].hours += hours;
        subjectStats[subject].income += hours * courseRates[subject];
      });
      
      // 计算总收入
      const totalIncome = Object.values(subjectStats).reduce((sum, stat) => sum + stat.income, 0);
      
      return {
        courses: courses,
        count: courses.length,
        hours: totalHours,
        income: totalIncome,
        subjects: subjectStats
      };
    };
    
    // 默认显示本月数据
    let currentRange = 'month';
    let currentStats = getStatsForRange(monthCourses);
    
    // 渲染统计界面的函数
    const renderStats = () => {
      // 根据当前选择的范围获取统计数据
      let stats;
      let rangeName;
      
      switch(currentRange) {
        case 'today':
          stats = getStatsForRange(todayCourses);
          rangeName = '当日';
          break;
        case 'week':
          stats = getStatsForRange(weekCourses);
          rangeName = '本周';
          break;
        case 'month':
        default:
          stats = getStatsForRange(monthCourses);
          rangeName = '本月';
          break;
      }
      
      // 生成课程类型统计HTML
      const subjectsHtml = Object.entries(stats.subjects).map(([subject, data]) => {
        return `<div class="stats-item">
          <div class="stats-label">${subject}</div>
          <div class="stats-detail">
            <div class="stats-hours">${data.hours.toFixed(1)}小时</div>
            <div class="stats-divider">×</div>
            <div class="stats-rate">${courseRates[subject]}元/小时</div>
            <div class="stats-equals">=</div>
            <div class="stats-value">${data.income.toFixed(0)}元</div>
          </div>
        </div>`;
      }).join('');
      
      // 更新DOM
      const statsOverview = document.querySelector('.stats-overview');
      if (statsOverview) {
        statsOverview.innerHTML = `
          <div class="stats-card">
            <div class="stats-number">${stats.count}</div>
            <div class="stats-label">${rangeName}课程数</div>
          </div>
          <div class="stats-card">
            <div class="stats-number">${stats.hours.toFixed(1)}</div>
            <div class="stats-label">${rangeName}课时数</div>
          </div>
          <div class="stats-card">
            <div class="stats-number">${stats.income.toFixed(0)}¥</div>
            <div class="stats-label">${rangeName}预计收入</div>
          </div>
        `;
      }
      
      const statsList = document.querySelector('.stats-list');
      if (statsList) {
        statsList.innerHTML = subjectsHtml;
      }
    };
    
    // 生成统计页面HTML
    modalContent.innerHTML = `
      <div class="modal-header">
        <h3>课程统计</h3>
        <button class="close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="stats-section">
          <h4>${teacherName}的课程统计</h4>
          
          <div class="time-range-tabs">
            <button class="time-range-tab" data-range="today">当日</button>
            <button class="time-range-tab" data-range="week">本周</button>
            <button class="time-range-tab active" data-range="month">本月</button>
          </div>
          
          <div class="stats-overview">
            <!-- 由renderStats函数动态生成内容 -->
          </div>
          
          <h4>课程类型统计</h4>
          <div class="stats-list">
            <!-- 由renderStats函数动态生成内容 -->
          </div>
          
          <h4>课时费设置</h4>
          <div class="course-rates-container">
            ${uniqueSubjects.map(subject => `
              <div class="course-rate-item">
                <div class="course-rate-name">${subject}</div>
                <div class="course-rate-input">
                  <input type="number" class="rate-input" data-subject="${subject}" 
                         value="${courseRates[subject]}" min="0" step="10"> 元/小时
                </div>
              </div>
            `).join('')}
            <button class="btn-submit" id="update-rates">更新费率设置</button>
          </div>
        </div>
      </div>
    `;
    
    // 初始化渲染
    renderStats();
    
    // 注册关闭事件
    modalContent.querySelector('.close').addEventListener('click', () => this.hideModal());
    
    // 注册时间范围切换事件
    const timeRangeTabs = modalContent.querySelectorAll('.time-range-tab');
    timeRangeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // 移除所有选项的active类
        timeRangeTabs.forEach(t => t.classList.remove('active'));
        
        // 添加当前选项的active类
        tab.classList.add('active');
        
        // 更新当前范围
        currentRange = tab.dataset.range;
        
        // 重新渲染统计
        renderStats();
      });
    });
    
    // 注册课时费更新事件
    const updateRatesButton = modalContent.querySelector('#update-rates');
    if (updateRatesButton) {
      updateRatesButton.addEventListener('click', () => {
        // 获取所有课时费输入
        const rateInputs = modalContent.querySelectorAll('.rate-input');
        
        // 更新课时费率
        rateInputs.forEach(input => {
          const subject = input.dataset.subject;
          const rate = parseFloat(input.value) || 200; // 如果无效则使用默认值200
          courseRates[subject] = rate;
        });
        
        // 保存到localStorage
        localStorage.setItem(`course_rates_${currentTeacherId}`, JSON.stringify(courseRates));
        
        // 重新渲染统计
        renderStats();
        
        this.showToast('课时费标准已更新');
    });
    }
    
    // 显示弹窗
    modal.style.display = 'block';
  }
  
  // 显示"我的"个人中心模态框
  showProfileModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>我的信息</h3>
          <button class="close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="profile-info">
            <h4>个人信息</h4>
            <p><strong>姓名:</strong> ${this.currentUser.name}</p>
            <p><strong>用户名:</strong> ${this.currentUser.username}</p>
            <p><strong>角色:</strong> ${this.currentUser.role === 'admin' ? '管理员' : '教师'}</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="profile-settings">
            <h4>个人设置</h4>
            
            <form id="profile-password-form">
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
              <button type="submit" class="btn-submit">修改密码</button>
            </form>
          </div>
          
          <div class="divider"></div>
          
          <div class="profile-actions">
            <h4>更多操作</h4>
            <button id="export-my-data" class="btn-submit">导出我的课程数据</button>
            <button id="restore-default-data" class="btn-submit">恢复默认数据</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    // 修改密码表单
    const passwordForm = modal.querySelector('#profile-password-form');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // 验证密码
        if (!this.currentUser.password) {
          this.showToast('无法验证当前密码');
          return;
        }
        
        if (currentPassword !== this.currentUser.password) {
          this.showToast('当前密码不正确');
          return;
        }
        
        if (newPassword !== confirmPassword) {
          this.showToast('两次输入的新密码不一致');
          return;
        }
        
        // 更新密码
        // 实际环境中应该调用API
        const updatedUser = {...this.currentUser, password: newPassword};
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUser = updatedUser;
        
        this.showToast('密码已成功修改');
        passwordForm.reset();
      });
    }
    
    // 导出数据按钮
    const exportBtn = modal.querySelector('#export-my-data');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        // 获取当前教师的课程数据
        const teacherSchedules = this.schedules.filter(s => s.teacherId === this.currentUser.teacherId);
        
        // 创建导出数据对象
        const exportData = {
          teacher: this.currentUser,
          schedules: teacherSchedules
        };
        
        // 转换为JSON并下载
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${this.currentUser.name}_courses_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        
        this.showToast('数据导出成功');
      });
    }

    // 恢复默认数据按钮
    const restoreBtn = modal.querySelector('#restore-default-data');
    if (restoreBtn) {
      restoreBtn.addEventListener('click', () => {
        if (confirm('确定要恢复默认数据吗？这将重置所有课程、教师和教室数据。此操作不可撤销。')) {
          this.forceInitDefaultData();
          this.showToast('默认数据已恢复');
          
          // 刷新页面以显示新数据
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      });
    }
    
    // 关闭按钮
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });
  }
  
  formatDateToString(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  // 将时间字符串转换为从当天0点开始的分钟数
  timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  // 开始选择时间段
  startTimeSelection(e, timeCell) {
    e.preventDefault();
    
    // 如果不是左键点击或触摸，则忽略
    if (e.type === 'mousedown' && e.button !== 0) return;
    
    this.isSelecting = true;
    this.selectedTimeCells = [timeCell];
    timeCell.classList.add('selected');
    
    // 记录开始选择的教师ID
    this.selectingTeacherId = timeCell.dataset.teacherId;
    
    // 月视图处理：如果没有时间属性，设置默认时间
    if (!timeCell.dataset.time && timeCell.dataset.date) {
      timeCell.dataset.time = "09:00"; // 设置默认开始时间为9:00
    }
  }
  
  // 继续选择时间段
  continueTimeSelection(e, timeCell) {
    if (!this.isSelecting) return;
    
    // 确保只选择同一个教师的时间格子
    if (timeCell.dataset.teacherId !== this.selectingTeacherId) return;
    
    // 如果该时间格子尚未选中，则添加选中状态
    if (!this.selectedTimeCells.includes(timeCell)) {
      this.selectedTimeCells.push(timeCell);
      timeCell.classList.add('selected');
    }
  }
  
  // 结束选择时间段
  endTimeSelection(e) {
    if (!this.isSelecting) return;
    
    this.isSelecting = false;
    
    // 如果选中了至少一个时间格子，则弹出创建课程的对话框
    if (this.selectedTimeCells.length > 0) {
      // 排序时间格子，确保按时间顺序
      this.selectedTimeCells.sort((a, b) => {
        if (!a.dataset.time) return -1;
        if (!b.dataset.time) return 1;
        return this.timeToMinutes(a.dataset.time) - this.timeToMinutes(b.dataset.time);
      });
      
      const firstCell = this.selectedTimeCells[0];
      const lastCell = this.selectedTimeCells[this.selectedTimeCells.length - 1];
      
      const date = firstCell.dataset.date;
      const startTime = firstCell.dataset.time || "09:00";  // 月视图默认9:00
      const endTime = lastCell.dataset.time ? 
        this.calculateEndTime(lastCell.dataset.time) : "10:30";  // 月视图默认1.5小时课程
      const teacherId = parseInt(firstCell.dataset.teacherId);
      
      // 第五个参数设为false，表示不自动选择教师，将使用当前登录用户
      this.showAddCourseModal(date, startTime, endTime, this.currentUser.teacherId, true);
    }
  }
  
  // 计算结束时间（当前时间+30分钟）
  calculateEndTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    let endMinutes = minutes + 30;
    let endHours = hours;
    
    if (endMinutes >= 60) {
      endMinutes = 0;
      endHours += 1;
    }
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }
  
  // 清除选中的时间格子
  clearSelectedTimeCells() {
    this.selectedTimeCells.forEach(cell => {
      cell.classList.remove('selected');
    });
    this.selectedTimeCells = [];
  }
  
  // 高亮显示当前登录教师的列
  highlightCurrentTeacherColumn() {
    if (this.currentUser && this.currentUser.teacherId) {
      const currentTeacherId = this.currentUser.teacherId;
      
      // 高亮显示表头
      const teacherHeaders = document.querySelectorAll('.teacher-header');
      teacherHeaders.forEach((header, index) => {
        if (index + 1 === currentTeacherId) {
          header.classList.add('current-teacher');
        }
      });
      
      // 高亮显示列
      const teacherColumn = document.querySelector(`.teacher-column[data-teacher-id="${currentTeacherId}"]`);
      if (teacherColumn) {
        teacherColumn.classList.add('current-teacher-column');
      }
      
      // 添加提示文字
      const hintSpan = document.createElement('span');
      hintSpan.className = 'current-teacher-hint';
      hintSpan.textContent = '(您)';
      
      const teacherHeader = teacherHeaders[currentTeacherId - 1];
      if (teacherHeader) {
        teacherHeader.appendChild(hintSpan);
      }
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  window.scheduleManager = new ScheduleManager();
}); 
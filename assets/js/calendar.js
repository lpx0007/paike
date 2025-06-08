/**
 * 日历控制器
 * 处理日期选择和日历视图
 */
class CalendarController {
  constructor() {
    this.currentDate = new Date();
    this.currentView = 'day'; // 'day', 'week', 'month'
    
    this.init();
  }
  
  init() {
    this.updateDateDisplay();
    this.setupEventListeners();
    this.renderTimeAxis();
    this.renderMiniCalendar();
  }
  
  updateDateDisplay() {
    const dateDisplay = document.getElementById('current-date');
    if (dateDisplay) {
      dateDisplay.textContent = this.formatDate(this.currentDate);
    }
  }
  
  formatDate(date) {
    // 根据当前视图格式化日期
    switch(this.currentView) {
      case 'day':
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
      case 'week':
        const startOfWeek = this.getStartOfWeek(date);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.getMonth() + 1}月${startOfWeek.getDate()}日 - ${endOfWeek.getMonth() + 1}月${endOfWeek.getDate()}日`;
      case 'month':
        return `${date.getFullYear()}年${date.getMonth() + 1}月`;
      default:
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  }
  
  // 获取一周的开始日期（周一）
  getStartOfWeek(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // 调整为周一为开始
    return new Date(date.setDate(diff));
  }
  
  setupEventListeners() {
    // 日期导航
    const prevButton = document.getElementById('prev-day');
    const nextButton = document.getElementById('next-day');
    
    if (prevButton) {
      prevButton.addEventListener('click', () => this.changeDate(-1));
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', () => this.changeDate(1));
    }
    
    // 月份导航
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    
    if (prevMonthButton) {
      prevMonthButton.addEventListener('click', () => {
        const temp = new Date(this.currentDate);
        temp.setMonth(temp.getMonth() - 1);
        this.currentDate = temp;
        this.renderMiniCalendar();
        this.notifyDateChange();
        this.updateDateDisplay();
      });
    }
    
    if (nextMonthButton) {
      nextMonthButton.addEventListener('click', () => {
        const temp = new Date(this.currentDate);
        temp.setMonth(temp.getMonth() + 1);
        this.currentDate = temp;
        this.renderMiniCalendar();
        this.notifyDateChange();
        this.updateDateDisplay();
      });
    }
    
    // 视图切换
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        if (view) {
          this.changeView(view);
        }
      });
    });
  }
  
  changeDate(offset) {
    // 根据当前视图改变日期
    switch(this.currentView) {
      case 'day':
        this.currentDate.setDate(this.currentDate.getDate() + offset);
        break;
      case 'week':
        this.currentDate.setDate(this.currentDate.getDate() + (offset * 7));
        break;
      case 'month':
        this.currentDate.setMonth(this.currentDate.getMonth() + offset);
        break;
    }
    
    this.updateDateDisplay();
    this.renderMiniCalendar();
    this.notifyDateChange();
  }
  
  changeView(view) {
    if (this.currentView === view) return;
    
    // 隐藏当前视图
    document.getElementById(`${this.currentView}-view`)?.classList.remove('active');
    
    // 移除旧视图的激活状态
    document.querySelector(`.tab[data-view="${this.currentView}"]`)?.classList.remove('active');
    
    // 设置新视图
    this.currentView = view;
    
    // 显示新视图
    document.getElementById(`${view}-view`)?.classList.add('active');
    
    // 添加新视图的激活状态
    document.querySelector(`.tab[data-view="${view}"]`)?.classList.add('active');
    
    // 更新日期显示文本
    this.updateDateDisplay();
    
    // 更新页面标题
    this.updatePageTitle();
    
    // 通知视图变更
    this.notifyViewChange();
  }
  
  updatePageTitle() {
    // 根据当前视图更新页面标题
    const viewText = {
      day: '日视图',
      week: '周视图',
      month: '月视图'
    };
    
    document.title = `课程排期 - ${viewText[this.currentView]}`;
  }
  
  renderTimeAxis() {
    const timeAxisContainer = document.querySelector('.time-axis');
    if (!timeAxisContainer) return;
    
    timeAxisContainer.innerHTML = '';
    
    // 添加时间轴表头
    const timeHeader = document.createElement('div');
    timeHeader.className = 'time-header';
    timeHeader.innerHTML = '时间';
    timeAxisContainer.appendChild(timeHeader);
    
    // 创建从早上9点到晚上10点的时间轴，每半小时一格
    for (let hour = 9; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        timeAxisContainer.appendChild(timeSlot);
      }
    }
  }
  
  getCurrentDateInfo() {
    return {
      date: this.currentDate,
      view: this.currentView
    };
  }
  
  notifyDateChange() {
    // 触发日期变更事件
    const event = new CustomEvent('calendar:dateChanged', {
      detail: this.getCurrentDateInfo()
    });
    document.dispatchEvent(event);
  }
  
  notifyViewChange() {
    // 触发视图变更事件
    const event = new CustomEvent('calendar:viewChanged', {
      detail: this.getCurrentDateInfo()
    });
    document.dispatchEvent(event);
  }
  
  // 获取当前日期对应的字符串格式 (YYYY-MM-DD)
  getDateString() {
    const date = this.currentDate;
    return this.formatDateToString(date);
  }
  
  // 获取一周的日期范围
  getWeekRange() {
    const startOfWeek = this.getStartOfWeek(new Date(this.currentDate));
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      dates.push({
        date: currentDate,
        dateString: this.formatDateToString(currentDate)
      });
    }
    
    return dates;
  }
  
  // 获取一个月的所有日期
  getMonthDates() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const dates = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      dates.push({
        date: date,
        dateString: this.formatDateToString(date)
      });
    }
    
    return dates;
  }
  
  // 获取完整月视图的日期（包括上个月和下个月的日期）
  getFullMonthDates() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 获取月初是周几（0是周日，1是周一，以此类推）
    const firstDayOfWeek = firstDay.getDay();
    
    // 计算需要显示多少个上个月的日期
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // 计算日历中总共需要多少天（42天，即6行7列）
    const totalDays = 42;
    
    const dates = [];
    
    // 添加上个月的日期
    const prevMonth = new Date(year, month - 1, 1);
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i + 1);
      dates.push({
        date: date,
        dateString: this.formatDateToString(date),
        isCurrentMonth: false
      });
    }
    
    // 添加当前月的日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      dates.push({
        date: date,
        dateString: this.formatDateToString(date),
        isCurrentMonth: true
      });
    }
    
    // 添加下个月的日期
    const remainingDays = totalDays - dates.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      dates.push({
        date: date,
        dateString: this.formatDateToString(date),
        isCurrentMonth: false
      });
    }
    
    return dates;
  }
  
  // 将日期格式化为字符串 (YYYY-MM-DD)
  formatDateToString(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  // 检查一个日期是否是今天
  isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
  
  // 获取一个日期是星期几
  getDayOfWeek(date) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  }
  
  renderMiniCalendar() {
    const miniCalendar = document.getElementById('mini-calendar');
    if (!miniCalendar) return;
    
    miniCalendar.innerHTML = '';
    
    // 获取当前月的第一天和最后一天
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 更新月份标题
    const sectionTitle = document.querySelector('.calendar-header .section-title');
    if (sectionTitle) {
      sectionTitle.textContent = `${year}年${month + 1}月`;
    }
    
    // 获取当前选中的日期
    const currentDay = this.currentDate.getDate();
    
    // 添加星期表头
    const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
    daysOfWeek.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'mini-calendar-header';
      dayHeader.textContent = day;
      miniCalendar.appendChild(dayHeader);
    });
    
    // 确定第一天是星期几
    const firstDayOfWeek = firstDay.getDay();
    
    // 添加上个月的日期（如果需要）
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < firstDayOfWeek; i++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'mini-calendar-day other-month';
      
      // 添加日期包装器确保对齐
      const dayWrapper = document.createElement('div');
      dayWrapper.className = 'day-number';
      dayWrapper.textContent = prevMonthLastDay - firstDayOfWeek + i + 1;
      dayElement.textContent = '';
      dayElement.appendChild(dayWrapper);
      
      // 添加点击事件
      const prevDate = new Date(year, month - 1, prevMonthLastDay - firstDayOfWeek + i + 1);
      dayElement.addEventListener('click', () => this.selectDay(prevDate));
      
      miniCalendar.appendChild(dayElement);
    }
    
    // 添加当月的日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'mini-calendar-day';
      
      // 添加日期包装器确保对齐
      const dayWrapper = document.createElement('div');
      dayWrapper.className = 'day-number';
      dayWrapper.textContent = i;
      dayElement.appendChild(dayWrapper);
      
      // 如果是今天，高亮显示
      const today = new Date();
      if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
        dayElement.classList.add('today');
      }
      
      // 如果是当前选中的日期，标记为选中
      if (i === currentDay) {
        dayElement.classList.add('selected');
      }
      
      // 添加点击事件
      const date = new Date(year, month, i);
      dayElement.addEventListener('click', () => this.selectDay(date));
      
      miniCalendar.appendChild(dayElement);
    }
    
    // 添加下个月的日期（填充到7的倍数）
    const totalDays = firstDayOfWeek + lastDay.getDate();
    const remainingDays = 7 - (totalDays % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'mini-calendar-day other-month';
        
        // 添加日期包装器确保对齐
        const dayWrapper = document.createElement('div');
        dayWrapper.className = 'day-number';
        dayWrapper.textContent = i;
        dayElement.appendChild(dayWrapper);
        
        // 添加点击事件
        const nextDate = new Date(year, month + 1, i);
        dayElement.addEventListener('click', () => this.selectDay(nextDate));
        
        miniCalendar.appendChild(dayElement);
      }
    }
  }
  
  // 选择日期
  selectDay(date) {
    this.currentDate = date;
    this.updateDateDisplay();
    this.renderMiniCalendar();
    this.notifyDateChange();
  }
}

// 初始化日历
document.addEventListener('DOMContentLoaded', () => {
  window.calendarController = new CalendarController();
}); 
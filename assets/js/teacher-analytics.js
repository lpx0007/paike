/**
 * 教师排课分析模块
 * 用于仪表盘中展示教师排课数据分析
 */
class TeacherAnalytics {
  constructor(adminManager) {
    this.adminManager = adminManager;
    this.teachers = [];
    this.schedules = [];
    this.charts = {};
    this.timeRange = 'all'; // 默认显示所有数据，可选值：'week', 'month', 'all'
  }

  /**
   * 初始化分析数据
   */
  init(teachers, schedules) {
    this.teachers = teachers || [];
    this.schedules = schedules || [];
    console.log('教师排课分析模块初始化完成');
  }

  /**
   * 设置时间范围
   * @param {string} range - 时间范围，可选值：'week', 'month', 'all'
   */
  setTimeRange(range) {
    this.timeRange = range;
    console.log(`时间范围已设置为: ${range}`);
  }

  /**
   * 根据当前时间范围筛选课程
   * @returns {Array} 筛选后的课程数组
   */
  getFilteredSchedules() {
    if (this.timeRange === 'all') {
      return this.schedules;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 计算本周的开始日期（周一）
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day; // 如果是周日，则算作上周的最后一天
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    
    // 计算本月的开始日期
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return this.schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      
      if (this.timeRange === 'week') {
        return scheduleDate >= startOfWeek;
      } else if (this.timeRange === 'month') {
        return scheduleDate >= startOfMonth;
      }
      
      return true;
    });
  }

  /**
   * 渲染教师工作量分析图表
   * @param {string} containerId - 图表容器ID
   */
  renderTeacherWorkloadChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 确保已加载ECharts
    if (typeof echarts === 'undefined') {
      console.error('未找到ECharts库，请先引入ECharts');
      container.innerHTML = '<div class="error-message">图表加载失败：未找到ECharts库</div>';
      return;
    }

    // 获取时间范围标题后缀
    const titleSuffix = this.getTimeRangeTitle();

    // 计算每位教师的课时数
    const teacherWorkloads = this.calculateTeacherWorkloads();
    
    // 准备图表数据
    const chartData = {
      teachers: teacherWorkloads.map(item => item.name),
      hours: teacherWorkloads.map(item => item.hours),
      counts: teacherWorkloads.map(item => item.courseCount)
    };

    // 初始化图表
    const chart = echarts.init(container);
    
    // 图表配置
    const option = {
      title: {
        text: `教师课时工作量${titleSuffix}`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params) {
          const teacherName = params[0].name;
          const hours = params[0].value;
          const count = params[1].value;
          return `${teacherName}<br/>总课时: ${hours}小时<br/>课程数: ${count}节`;
        }
      },
      legend: {
        data: ['课时数(小时)', '课程数(节)'],
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: chartData.teachers,
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '课时数(小时)',
          position: 'left'
        },
        {
          type: 'value',
          name: '课程数(节)',
          position: 'right'
        }
      ],
      series: [
        {
          name: '课时数(小时)',
          type: 'bar',
          data: chartData.hours,
          itemStyle: {
            color: '#4361ee'
          }
        },
        {
          name: '课程数(节)',
          type: 'bar',
          yAxisIndex: 1,
          data: chartData.counts,
          itemStyle: {
            color: '#f72585'
          }
        }
      ]
    };

    // 使用配置项显示图表
    chart.setOption(option);
    this.charts.workload = chart;

    // 响应窗口调整大小
    window.addEventListener('resize', () => {
      chart.resize();
    });
  }

  /**
   * 渲染教师科目分布饼图
   * @param {string} containerId - 图表容器ID
   */
  renderTeacherSubjectDistribution(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 确保已加载ECharts
    if (typeof echarts === 'undefined') {
      console.error('未找到ECharts库，请先引入ECharts');
      container.innerHTML = '<div class="error-message">图表加载失败：未找到ECharts库</div>';
      return;
    }

    // 获取时间范围标题后缀
    const titleSuffix = this.getTimeRangeTitle();

    // 计算课程类型分布
    const subjectDistribution = this.calculateSubjectDistribution();
    
    // 准备图表数据
    const chartData = subjectDistribution.map(item => ({
      name: item.subject,
      value: item.count
    }));

    // 初始化图表
    const chart = echarts.init(container);
    
    // 图表配置
    const option = {
      title: {
        text: `课程类型分布${titleSuffix}`,
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}节课 ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        data: chartData.map(item => item.name)
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: chartData
        }
      ]
    };

    // 使用配置项显示图表
    chart.setOption(option);
    this.charts.subjects = chart;
    
    // 响应窗口调整大小
    window.addEventListener('resize', () => {
      chart.resize();
    });
  }

  /**
   * 渲染教师时间段热力图
   * @param {string} containerId - 图表容器ID
   */
  renderTimeDistributionHeatmap(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 确保已加载ECharts
    if (typeof echarts === 'undefined') {
      console.error('未找到ECharts库，请先引入ECharts');
      container.innerHTML = '<div class="error-message">图表加载失败：未找到ECharts库</div>';
      return;
    }

    // 获取时间范围标题后缀
    const titleSuffix = this.getTimeRangeTitle();

    // 获取时间段分布数据
    const timeDistribution = this.calculateTimeDistribution();
    
    // 准备热力图数据
    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    const days = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
    
    // 初始化图表
    const chart = echarts.init(container);
    
    // 图表配置
    const option = {
      title: {
        text: `课程时段热力图${titleSuffix}`,
        left: 'center'
      },
      tooltip: {
        position: 'top',
        formatter: function (params) {
          return `${params.name}: ${params.value[2]}节课`;
        }
      },
      grid: {
        left: 2,
        bottom: '10%',
        right: '5%',
        top: '18%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: hours,
        splitArea: {
          show: true
        },
        axisLabel: {
          interval: 0,
          rotate: 45
        }
      },
      yAxis: {
        type: 'category',
        data: days,
        splitArea: {
          show: true
        }
      },
      visualMap: {
        min: 0,
        max: Math.max(...timeDistribution.map(item => item.value[2]), 5),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#e0f7fa', '#4cc9f0', '#3a0ca3', '#480ca8']
        }
      },
      series: [{
        name: '课程数量',
        type: 'heatmap',
        data: timeDistribution,
        label: {
          show: true
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };

    // 使用配置项显示图表
    chart.setOption(option);
    this.charts.heatmap = chart;
    
    // 响应窗口调整大小
    window.addEventListener('resize', () => {
      chart.resize();
    });
  }

  /**
   * 渲染教师课程类型明细图表
   * @param {string} containerId - 图表容器ID
   */
  renderTeacherSubjectDetailChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 确保已加载ECharts
    if (typeof echarts === 'undefined') {
      console.error('未找到ECharts库，请先引入ECharts');
      container.innerHTML = '<div class="error-message">图表加载失败：未找到ECharts库</div>';
      return;
    }

    // 获取时间范围标题后缀
    const titleSuffix = this.getTimeRangeTitle();

    // 计算每位教师的课程类型课时明细
    const teacherSubjectDetails = this.calculateTeacherSubjectDetails();
    
    // 准备图表数据
    const teachers = [...new Set(teacherSubjectDetails.map(item => item.teacherName))];
    const subjects = [...new Set(teacherSubjectDetails.map(item => item.subject))];
    
    // 创建系列数据
    const seriesData = [];
    subjects.forEach(subject => {
      const data = [];
      teachers.forEach(teacher => {
        const detail = teacherSubjectDetails.find(
          item => item.teacherName === teacher && item.subject === subject
        );
        data.push(detail ? detail.hours : 0);
      });
      
      seriesData.push({
        name: subject,
        type: 'bar',
        stack: 'total',
        label: {
          show: true,
          formatter: (params) => {
            return params.value > 0 ? params.value : '';
          }
        },
        emphasis: {
          focus: 'series'
        },
        data: data
      });
    });

    // 初始化图表
    const chart = echarts.init(container);
    
    // 图表配置
    const option = {
      title: {
        text: `教师课程类型课时明细${titleSuffix}`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params) {
          let tooltip = params[0].name + '<br/>';
          let totalHours = 0;
          
          params.forEach(param => {
            if (param.value > 0) {
              tooltip += `${param.marker} ${param.seriesName}: ${param.value}小时<br/>`;
              totalHours += param.value;
            }
          });
          
          tooltip += `<b>总课时: ${totalHours.toFixed(1)}小时</b>`;
          return tooltip;
        }
      },
      legend: {
        data: subjects,
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: teachers,
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value',
        name: '课时数(小时)'
      },
      series: seriesData
    };

    // 使用配置项显示图表
    chart.setOption(option);
    this.charts.subjectDetail = chart;

    // 响应窗口调整大小
    window.addEventListener('resize', () => {
      chart.resize();
    });
  }

  /**
   * 根据当前时间范围设置获取标题后缀
   * @returns {string} 标题后缀
   */
  getTimeRangeTitle() {
    switch (this.timeRange) {
      case 'week':
        return '（本周）';
      case 'month':
        return '（本月）';
      default:
        return '（全部）';
    }
  }

  /**
   * 计算每位教师的课时工作量
   * @returns {Array} 教师工作量数组
   */
  calculateTeacherWorkloads() {
    const workloads = [];
    const filteredSchedules = this.getFilteredSchedules();
    
    // 为每位教师计算工作量
    this.teachers.forEach(teacher => {
      // 过滤出该教师的所有课程
      const teacherSchedules = filteredSchedules.filter(s => s.teacherId === teacher.id);
      
      // 计算总课时
      let totalHours = 0;
      teacherSchedules.forEach(schedule => {
        // 解析时间
        const startTime = this.parseTime(schedule.startTime);
        const endTime = this.parseTime(schedule.endTime);
        const hours = (endTime - startTime) / (1000 * 60 * 60);
        totalHours += hours;
      });
      
      // 添加到结果数组
      workloads.push({
        id: teacher.id,
        name: teacher.name,
        hours: parseFloat(totalHours.toFixed(1)),
        courseCount: teacherSchedules.length
      });
    });
    
    // 按课时降序排序
    return workloads.sort((a, b) => b.hours - a.hours);
  }

  /**
   * 计算课程类型分布
   * @returns {Array} 课程类型分布数组
   */
  calculateSubjectDistribution() {
    const subjects = {};
    const filteredSchedules = this.getFilteredSchedules();
    
    // 统计每种课程类型的数量
    filteredSchedules.forEach(schedule => {
      const subject = schedule.subject;
      if (!subjects[subject]) {
        subjects[subject] = 0;
      }
      subjects[subject]++;
    });
    
    // 转换为数组格式
    const result = Object.keys(subjects).map(subject => ({
      subject,
      count: subjects[subject]
    }));
    
    // 按数量降序排序
    return result.sort((a, b) => b.count - a.count);
  }

  /**
   * 计算时间段分布数据
   * @returns {Array} 热力图数据
   */
  calculateTimeDistribution() {
    const timeData = [];
    const dayMap = {
      '1': 0, // 周一
      '2': 1, // 周二
      '3': 2, // 周三
      '4': 3, // 周四
      '5': 4, // 周五
      '6': 5, // 周六
      '0': 6  // 周日
    };
    
    // 时间段映射（向下取整到小时）
    const hourRanges = {
      '09': 0, '10': 1, '11': 2, '12': 3,
      '13': 4, '14': 5, '15': 6, '16': 7,
      '17': 8, '18': 9, '19': 10, '20': 11
    };
    
    // 初始化热力图数据
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 12; hour++) {
        timeData.push([hour, day, 0]);
      }
    }
    
    // 获取过滤后的课程
    const filteredSchedules = this.getFilteredSchedules();
    
    // 统计每个时间段的课程数
    filteredSchedules.forEach(schedule => {
      // 获取日期对应的星期几
      const date = new Date(schedule.date);
      const dayOfWeek = date.getDay(); // 0是周日，1-6是周一至周六
      const dayIndex = dayMap[dayOfWeek];
      
      // 获取开始小时
      const startHour = schedule.startTime.split(':')[0];
      if (startHour in hourRanges) {
        const hourIndex = hourRanges[startHour];
        
        // 找到对应的数据点并增加计数
        const dataPoint = timeData.find(point => point[0] === hourIndex && point[1] === dayIndex);
        if (dataPoint) {
          dataPoint[2]++;
        }
      }
    });
    
    // 转换为ECharts需要的格式
    return timeData.map(item => ({
      value: [item[0], item[1], item[2]],
      name: `${['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'][item[0]]} ${['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'][item[1]]}`
    }));
  }

  /**
   * 计算每位教师的课程类型课时明细
   * @returns {Array} 教师课程类型明细数组
   */
  calculateTeacherSubjectDetails() {
    const details = [];
    const filteredSchedules = this.getFilteredSchedules();
    
    // 为每位教师计算各科目课时
    this.teachers.forEach(teacher => {
      // 过滤出该教师的所有课程
      const teacherSchedules = filteredSchedules.filter(s => s.teacherId === teacher.id);
      
      // 按科目统计课时
      const subjectHours = {};
      
      teacherSchedules.forEach(schedule => {
        const subject = schedule.subject;
        if (!subjectHours[subject]) {
          subjectHours[subject] = 0;
        }
        
        // 解析时间计算课时
        const startTime = this.parseTime(schedule.startTime);
        const endTime = this.parseTime(schedule.endTime);
        const hours = (endTime - startTime) / (1000 * 60 * 60);
        
        subjectHours[subject] += hours;
      });
      
      // 转换为数组格式
      Object.keys(subjectHours).forEach(subject => {
        details.push({
          teacherId: teacher.id,
          teacherName: teacher.name,
          subject: subject,
          hours: parseFloat(subjectHours[subject].toFixed(1)),
          courseCount: teacherSchedules.filter(s => s.subject === subject).length
        });
      });
    });
    
    return details;
  }

  /**
   * 更新所有图表
   * 当时间范围变化时调用此方法重新渲染所有图表
   */
  updateAllCharts() {
    if (this.charts.workload) {
      this.renderTeacherWorkloadChart('teacher-workload-chart');
    }
    
    if (this.charts.subjects) {
      this.renderTeacherSubjectDistribution('subject-distribution-chart');
    }
    
    if (this.charts.heatmap) {
      this.renderTimeDistributionHeatmap('time-distribution-chart');
    }
    
    if (this.charts.subjectDetail) {
      this.renderTeacherSubjectDetailChart('subject-detail-chart');
    }
  }

  /**
   * 解析时间字符串为Date对象
   * @param {string} timeString - 时间字符串 (HH:MM)
   * @returns {Date} 时间对象
   */
  parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
}

// 全局导出
window.TeacherAnalytics = TeacherAnalytics; 
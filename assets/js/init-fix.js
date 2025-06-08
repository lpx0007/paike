/**
 * 页面加载优化和数据一致性修复脚本
 */
(function() {
  // 防止重复执行
  if (window.initFixExecuted) {
    console.log('数据一致性修复已经执行过，跳过');
    return;
  }
  
  console.log('正在执行数据一致性修复...');
  
  // 清除所有可能的计时器，防止页面不断刷新
  const highestTimeoutId = setTimeout(() => {}, 0);
  for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i);
  }
  
  // 修复数据一致性问题
  function fixDataConsistency() {
    try {
      // 检查是否已经修复过
      const dataVersion = localStorage.getItem('dataVersion');
      if (dataVersion === '1.0.2') {
        console.log('数据已是最新版本，无需修复');
        return true;
      }
      
      // 1. 读取现有数据
      const teachersData = localStorage.getItem('teachers');
      const roomsData = localStorage.getItem('rooms');
      const schedulesData = localStorage.getItem('schedules');
      
      let teachers = [];
      let rooms = [];
      let schedules = [];
      
      // 2. 解析并验证教师数据
      if (teachersData) {
        try {
          teachers = JSON.parse(teachersData);
          if (!Array.isArray(teachers)) {
            console.error('教师数据格式错误，重置为空数组');
            teachers = [];
          }
        } catch (e) {
          console.error('解析教师数据失败:', e);
          teachers = [];
        }
      }
      
      // 3. 解析并验证教室数据
      if (roomsData) {
        try {
          rooms = JSON.parse(roomsData);
          if (!Array.isArray(rooms)) {
            console.error('教室数据格式错误，重置为空数组');
            rooms = [];
          }
        } catch (e) {
          console.error('解析教室数据失败:', e);
          rooms = [];
        }
      }
      
      // 4. 解析并验证课程数据
      if (schedulesData) {
        try {
          schedules = JSON.parse(schedulesData);
          if (!Array.isArray(schedules)) {
            console.error('课程数据格式错误，重置为空数组');
            schedules = [];
          }
        } catch (e) {
          console.error('解析课程数据失败:', e);
          schedules = [];
        }
      }
      
      // 5. 确保数据格式一致性
      // 教师数据标准化
      const standardTeachers = [
        {
          id: 1,
          teacherId: 1,
          name: "杨小菲",
          username: "teacher1",
          password: "123456",
          role: "teacher",
          subject: ["钢琴", "声乐"],
          color: "#4361ee"
        },
        {
          id: 2,
          teacherId: 2,
          name: "李老师",
          username: "teacher2",
          password: "123456",
          role: "teacher",
          subject: ["钢琴"],
          color: "#3a0ca3"
        },
        {
          id: 3,
          teacherId: 3,
          name: "王老师",
          username: "teacher3",
          password: "123456",
          role: "teacher",
          subject: ["声乐", "艺考"],
          color: "#7209b7"
        },
        {
          id: 4,
          teacherId: 4,
          name: "刘老师",
          username: "teacher4",
          password: "123456",
          role: "teacher",
          subject: ["675"],
          color: "#4cc9f0"
        },
        {
          id: 5,
          teacherId: 5,
          name: "赵老师",
          username: "teacher5",
          password: "123456",
          role: "teacher",
          subject: ["艺考"],
          color: "#f72585"
        },
        {
          id: 999,
          teacherId: 999,
          name: "系统管理员",
          username: "admin",
          password: "admin123",
          role: "admin",
          color: "#f72585"
        }
      ];
      
      // 教室数据标准化
      const standardRooms = [
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
      
      // 如果数据为空或格式不正确，使用标准数据
      if (teachers.length === 0) {
        console.log('使用标准教师数据');
        teachers = standardTeachers;
      }
      
      if (rooms.length === 0) {
        console.log('使用标准教室数据');
        rooms = standardRooms;
      }
      
      // 确保所有教室ID为字符串类型
      rooms = rooms.map(room => {
        return {
          ...room,
          id: String(room.id)
        };
      });
      
      // 6. 保存修复后的数据
      localStorage.setItem('teachers', JSON.stringify(teachers));
      localStorage.setItem('rooms', JSON.stringify(rooms));
      if (schedules.length > 0) {
        localStorage.setItem('schedules', JSON.stringify(schedules));
      }
      
      // 7. 设置数据版本，防止重复修复
      localStorage.setItem('dataVersion', '1.0.2');
      
      console.log('数据一致性修复完成');
      return true;
    } catch (error) {
      console.error('修复数据一致性失败:', error);
      return false;
    }
  }
  
  // 执行数据修复
  fixDataConsistency();
  
  // 标记已执行
  window.initFixExecuted = true;
  
  console.log('init-fix.js执行完成，版本1.0.2');
})(); 
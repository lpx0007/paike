/**
 * 身份验证管理器
 * 处理用户登录、注销和权限控制
 */
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.teachers = [];
    this.initialized = false;
    
    // 初始化
    this.init();
  }
  
  async init() {
    console.log('AuthManager 初始化开始...');
    
    // 加载教师数据
    await this.loadTeachers();
    
    // 检查是否已经登录
    this.checkLogin();
    
    // 设置登录表单事件监听
    this.setupLoginFormListener();
    
    this.initialized = true;
    console.log('AuthManager 初始化完成');
  }
  
  async loadTeachers() {
    // 尝试从localStorage读取教师数据
    const teachersData = localStorage.getItem('teachers');
    if (teachersData) {
      try {
        this.teachers = JSON.parse(teachersData);
        console.log('从localStorage加载了教师数据');
        
        // 确保管理员账号存在
        this.ensureAdminAccount();
      } catch (error) {
        console.error('解析教师数据失败:', error);
        await this.loadDefaultTeachers();
      }
    } else {
      // 如果localStorage中没有数据，加载默认数据
      await this.loadDefaultTeachers();
    }
  }
  
  async loadDefaultTeachers() {
    try {
      // 尝试从服务器加载数据
      const response = await fetch('data/teachers.json');
      if (response.ok) {
        const teachersData = await response.json();
        console.log('从服务器加载了教师数据');
        
        // 验证数据格式正确性
        if (Array.isArray(teachersData) && teachersData.length > 0) {
          this.teachers = teachersData;
        } else {
          throw new Error('教师数据格式不正确');
        }
      } else {
        throw new Error('无法加载教师数据');
      }
    } catch (error) {
      console.error('加载教师数据失败:', error);
      // 提供一些默认数据
      this.teachers = [
        {
          id: 1,
          teacherId: 1,
          name: "杨小菲",
          username: "teacher1",
          password: "123456", // 实际应用中应该加密
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
    }
    
    // 保存到localStorage前确保数据格式一致
    const sanitizedData = this.teachers.map(teacher => {
      // 确保所有教师数据格式一致
      return {
        id: teacher.id,
        teacherId: teacher.teacherId || teacher.id,
        name: teacher.name,
        username: teacher.username,
        password: teacher.password,
        role: teacher.role || "teacher",
        subject: Array.isArray(teacher.subject) ? teacher.subject : (teacher.subject ? [teacher.subject] : []),
        color: teacher.color || "#4361ee"
      };
    });
    
    this.teachers = sanitizedData;
    // 保存到localStorage
    localStorage.setItem('teachers', JSON.stringify(this.teachers));
    console.log('已保存标准化的教师数据到localStorage');
    
    // 确保管理员账号存在
    this.ensureAdminAccount();
  }
  
  // 确保管理员账号存在
  ensureAdminAccount() {
    const adminExists = this.teachers.some(t => t.role === 'admin');
    
    if (!adminExists) {
      // 添加管理员账号
      const adminAccount = {
        id: 999,
        teacherId: 999,
        name: "系统管理员",
        username: "admin",
        password: "admin123",
        role: "admin",
        color: "#f72585"
      };
      
      this.teachers.push(adminAccount);
      localStorage.setItem('teachers', JSON.stringify(this.teachers));
      console.log('已添加默认管理员账号');
    } else {
      console.log('管理员账号已存在');
    }
  }
  
  checkLogin() {
    // 从sessionStorage中获取当前用户信息
    const userJson = sessionStorage.getItem('currentUser');
    if (userJson) {
      try {
        this.currentUser = JSON.parse(userJson);
        this.updateUserInfoUI();
        console.log('已检测到登录状态:', this.currentUser.username);
      } catch (error) {
        console.error('解析用户数据失败:', error);
        this.currentUser = null;
      }
    } else {
      console.log('未检测到登录状态');
      
      // 防止无限重定向
      if (sessionStorage.getItem('redirectCheck')) {
        console.log('检测到可能的重定向循环，停止重定向');
        return;
      }
      
      // 获取当前页面路径
      const currentPath = window.location.pathname;
      const fileName = currentPath.split('/').pop() || '';
      
      // 检查是否在登录页面
      const isLoginPage = fileName.includes('login.html') || fileName === 'login';
      // 检查是否是首页
      const isIndexPage = fileName === 'index.html' || fileName === '' || fileName === 'index';
      // 检查是否是修复页面
      const isFixPage = fileName.includes('fix') || fileName.includes('setup');
      
      console.log('当前页面:', fileName);
      
      // 如果不是登录页、首页或修复页，需要重定向到登录页
      if (!isLoginPage && !isIndexPage && !isFixPage) {
        console.log('需要登录，准备重定向');
        sessionStorage.setItem('redirectCheck', 'true');
        // 设置超时，避免立即触发可能导致的问题
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 100);
      } else {
        console.log('当前页面不需要重定向');
      }
    }
  }
  
  setupLoginFormListener() {
    // 为登录表单添加提交事件监听
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      console.log('设置登录表单事件监听器');
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }
  }
  
  handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
      this.showLoginError('请输入用户名和密码');
      return;
    }
    
    console.log('尝试登录:', username);
    
    // 查找用户
    const user = this.teachers.find(
      t => t.username && t.username.toLowerCase() === username.toLowerCase()
    );
    
    if (!user) {
      this.showLoginError('用户不存在');
      return;
    }
    
    // 验证密码（实际应用中应该使用加密比较）
    if (user.password !== password) {
      this.showLoginError('密码错误');
      return;
    }
    
    // 清除重定向标记
    sessionStorage.removeItem('redirectCheck');
    sessionStorage.removeItem('redirectAttempted');
    
    // 登录成功
    this.currentUser = { ...user };
    // 不存储密码
    delete this.currentUser.password;
    sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    
    // 根据角色重定向
    if (user.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'index.html';
    }
  }
  
  logout() {
    // 清除会话数据
    sessionStorage.removeItem('currentUser');
    this.currentUser = null;
    
    // 重定向到登录页
    window.location.href = 'login.html';
  }
  
  showLoginError(message) {
    // 显示登录错误消息
    const errorElem = document.getElementById('login-error');
    if (errorElem) {
      errorElem.textContent = message;
      errorElem.style.display = 'block';
      
      // 3秒后自动隐藏错误消息
      setTimeout(() => {
        errorElem.style.display = 'none';
      }, 3000);
    } else {
      alert(message);
    }
  }
  
  updateUserInfoUI() {
    // 更新界面上的用户信息
    if (!this.currentUser) return;
    
    const usernameElem = document.querySelector('.username');
    if (usernameElem) {
      usernameElem.textContent = this.currentUser.name;
    }
    
    // 如果不是管理员，隐藏某些管理功能
    if (this.currentUser.role !== 'admin') {
      document.querySelectorAll('.admin-only').forEach(elem => {
        elem.style.display = 'none';
      });
    }
  }
  
  hasPermission(teacherId) {
    // 检查当前用户是否有权限操作指定教师的数据
    // 管理员有所有权限，教师只能操作自己的数据
    if (!this.currentUser) return false;
    
    return (
      this.currentUser.role === 'admin' || 
      this.currentUser.id === teacherId
    );
  }
  
  getCurrentUser() {
    return this.currentUser;
  }
  
  // 调试用：获取当前所有教师数据
  getAllTeachers() {
    return this.teachers;
  }
}

// 创建全局实例
window.authManager = new AuthManager();

// 添加登出按钮事件监听
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM加载完成');
  const logoutButtons = document.querySelectorAll('.logout-btn');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.authManager.logout();
    });
  });
}); 
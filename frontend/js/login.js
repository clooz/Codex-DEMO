/**
 * 登录页面逻辑
 * 支持账号密码登录和手机验证码登录
 * 包含表单验证、验证码、短信倒计时等功能
 */

(function () {
  'use strict';

  // ==================== 配置 ====================
  var CONFIG = {
    API_BASE: '/api',
    SMS_INTERVAL: 60,
    CAPTCHA_KEY: 'login_captcha_token',
    USER_KEY: 'login_user',
    REMEMBER_KEY: 'login_remember'
  };

  // ==================== DOM 元素 ====================
  var tabs = document.querySelectorAll('.login-tab');
  var panes = document.querySelectorAll('.login-pane');
  var loginForm = document.getElementById('loginForm');
  var loginBtn = document.getElementById('loginBtn');
  var loginError = document.getElementById('loginError');
  var loginErrorText = document.getElementById('loginErrorText');
  
  // 账号密码登录
  var usernameInput = document.getElementById('username');
  var passwordInput = document.getElementById('password');
  var captchaInput = document.getElementById('captcha');
  var captchaImage = document.getElementById('captchaImage');
  var passwordToggle = document.getElementById('passwordToggle');
  var rememberCheckbox = document.getElementById('remember');
  
  // 手机验证码登录
  var phoneInput = document.getElementById('phone');
  var smsCodeInput = document.getElementById('smsCode');
  var smsBtn = document.getElementById('smsBtn');

  // 当前登录方式
  var currentTab = 'password';

  // ==================== 初始化 ====================
  function init() {
    initTabs();
    initPasswordToggle();
    initCaptcha();
    initFormValidation();
    initSmsButton();
    loadRememberedUser();
  }

  // ==================== Tab 切换 ====================
  function initTabs() {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var tabName = tab.dataset.tab;
        switchTab(tabName);
      });
    });
  }

  function switchTab(tabName) {
    currentTab = tabName;
    
    tabs.forEach(function (tab) {
      var isActive = tab.dataset.tab === tabName;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });

    panes.forEach(function (pane) {
      var isActive = pane.id === 'pane-' + tabName;
      pane.classList.toggle('is-active', isActive);
    });

    clearErrors();
    hideLoginError();
  }

  // ==================== 密码显示/隐藏 ====================
  function initPasswordToggle() {
    if (!passwordToggle) return;
    
    passwordToggle.addEventListener('click', function () {
      var isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      
      var eyeOn = passwordToggle.querySelector('.icon-eye');
      var eyeOff = passwordToggle.querySelector('.icon-eye-off');
      
      if (eyeOn && eyeOff) {
        eyeOn.style.display = isPassword ? 'block' : 'none';
        eyeOff.style.display = isPassword ? 'none' : 'block';
      }
      
      passwordToggle.setAttribute('aria-label', isPassword ? '隐藏密码' : '显示密码');
    });
  }

  // ==================== 图形验证码 ====================
  function initCaptcha() {
    if (!captchaImage) return;
    
    refreshCaptcha();
    
    captchaImage.addEventListener('click', refreshCaptcha);
  }

  function refreshCaptcha() {
    // 模拟验证码API，实际项目中替换为真实接口
    var token = generateCaptchaToken();
    localStorage.setItem(CONFIG.CAPTCHA_KEY, token);
    
    // 生成简单的验证码图片（实际项目中应该是后端返回的图片URL）
    captchaImage.src = generateCaptchaImage(token);
  }

  function generateCaptchaToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  function generateCaptchaImage(token) {
    // 实际项目中这里应该是后端API返回的图片
    // 模拟生成一个简单的验证码图片URL
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var code = '';
    for (var i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    localStorage.setItem('login_captcha_code', code.toLowerCase());
    
    // 使用 Canvas 生成验证码图片
    return 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40">' +
        '<rect fill="#f5f5f5" width="100" height="40"/>' +
        '<text x="10" y="28" font-family="Arial" font-size="20" fill="#333">' + code + '</text>' +
      '</svg>'
    );
  }

  function validateCaptcha() {
    if (!captchaInput) return true;
    
    var input = captchaInput.value.trim().toLowerCase();
    var actual = (localStorage.getItem('login_captcha_code') || '').toLowerCase();
    
    if (!input) {
      showFieldError('captcha', '请输入验证码');
      return false;
    }
    
    if (input !== actual) {
      showFieldError('captcha', '验证码错误');
      refreshCaptcha();
      captchaInput.value = '';
      return false;
    }
    
    clearFieldError('captcha');
    return true;
  }

  // ==================== 表单验证 ====================
  function initFormValidation() {
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', handleSubmit);
    
    // 输入时清除错误
    var inputs = loginForm.querySelectorAll('.form-input');
    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        clearFieldError(input.id);
        hideLoginError();
      });
      
      input.addEventListener('blur', function () {
        validateField(input);
      });
    });
  }

  function validateField(input) {
    var id = input.id;
    var value = input.value.trim();
    
    switch (id) {
      case 'username':
        if (!value) {
          showFieldError(id, '请输入用户名');
          return false;
        }
        if (value.length < 3) {
          showFieldError(id, '用户名至少3个字符');
          return false;
        }
        break;
        
      case 'password':
        if (!value) {
          showFieldError(id, '请输入密码');
          return false;
        }
        if (value.length < 6) {
          showFieldError(id, '密码至少6位');
          return false;
        }
        break;
        
      case 'phone':
        if (!value) {
          showFieldError(id, '请输入手机号');
          return false;
        }
        if (!/^1[3-9]\d{9}$/.test(value)) {
          showFieldError(id, '请输入正确的手机号');
          return false;
        }
        break;
        
      case 'smsCode':
        if (!value) {
          showFieldError(id, '请输入验证码');
          return false;
        }
        if (!/^\d{6}$/.test(value)) {
          showFieldError(id, '验证码为6位数字');
          return false;
        }
        break;
    }
    
    clearFieldError(id);
    return true;
  }

  function validateForm() {
    clearErrors();
    
    if (currentTab === 'password') {
      var usernameValid = validateField(usernameInput);
      var passwordValid = validateField(passwordInput);
      var captchaValid = validateCaptcha();
      
      return usernameValid && passwordValid && captchaValid;
    } else {
      var phoneValid = validateField(phoneInput);
      var smsCodeValid = validateField(smsCodeInput);
      
      return phoneValid && smsCodeValid;
    }
  }

  function showFieldError(fieldId, message) {
    var input = document.getElementById(fieldId);
    var errorEl = document.getElementById(fieldId + '-error');
    
    if (input) {
      input.classList.add('is-invalid');
    }
    
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  function clearFieldError(fieldId) {
    var input = document.getElementById(fieldId);
    var errorEl = document.getElementById(fieldId + '-error');
    
    if (input) {
      input.classList.remove('is-invalid');
    }
    
    if (errorEl) {
      errorEl.textContent = '';
    }
  }

  function clearErrors() {
    var inputs = loginForm.querySelectorAll('.form-input');
    inputs.forEach(function (input) {
      clearFieldError(input.id);
    });
  }

  function showLoginError(message) {
    loginErrorText.textContent = message;
    loginError.classList.add('is-visible');
  }

  function hideLoginError() {
    loginError.classList.remove('is-visible');
  }

  // ==================== 登录提交 ====================
  function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    hideLoginError();
    
    var loginData;
    
    if (currentTab === 'password') {
      loginData = {
        type: 'password',
        username: usernameInput.value.trim(),
        password: passwordInput.value,
        captcha: captchaInput.value.trim(),
        remember: rememberCheckbox.checked
      };
    } else {
      loginData = {
        type: 'sms',
        phone: phoneInput.value.trim(),
        smsCode: smsCodeInput.value.trim()
      };
    }
    
    // 调用登录API（模拟）
    login(loginData)
      .then(function (result) {
        setLoading(false);
        
        if (result.success) {
          // 保存记住的用户信息
          if (loginData.remember && loginData.type === 'password') {
            saveRememberUser(loginData.username);
          }
          
          // 登录成功，跳转或提示
          showLoginSuccess(result);
        } else {
          showLoginError(result.message || '登录失败，请稍后重试');
          
          // 验证码错误时刷新
          if (result.needRefreshCaptcha) {
            refreshCaptcha();
            captchaInput.value = '';
          }
        }
      })
      .catch(function (error) {
        setLoading(false);
        showLoginError('网络错误，请检查网络连接');
        console.error('Login error:', error);
      });
  }

  function setLoading(loading) {
    if (loading) {
      loginBtn.classList.add('loading');
      loginBtn.disabled = true;
    } else {
      loginBtn.classList.remove('loading');
      loginBtn.disabled = false;
    }
  }

  // ==================== 登录 API（模拟） ====================
  function login(data) {
    return new Promise(function (resolve) {
      // 模拟API请求延迟
      setTimeout(function () {
        // 模拟登录逻辑
        var result;
        
        if (data.type === 'password') {
          // 模拟账号密码登录
          // 实际项目中替换为真实API调用
          if (data.username === 'admin' && data.password === '123456') {
            result = {
              success: true,
              message: '登录成功',
              user: {
                id: 1,
                username: 'admin',
                name: '管理员',
                role: 'admin'
              },
              token: 'mock_token_' + Date.now()
            };
          } else {
            result = {
              success: false,
              message: '用户名或密码错误',
              needRefreshCaptcha: true
            };
          }
        } else {
          // 模拟手机验证码登录
          if (data.smsCode === '123456') {
            result = {
              success: true,
              message: '登录成功',
              user: {
                id: 2,
                phone: data.phone,
                name: '用户',
                role: 'student'
              },
              token: 'mock_token_' + Date.now()
            };
          } else {
            result = {
              success: false,
              message: '验证码错误'
            };
          }
        }
        
        resolve(result);
      }, 1000);
    });
  }

  function showLoginSuccess(result) {
    // 保存token到localStorage
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('user_info', JSON.stringify(result.user));
    
    // 提示并跳转
    alert('登录成功！欢迎回来，' + result.user.name);
    
    // 跳转到首页或之前页面
    var redirectUrl = getQueryParam('redirect') || 'index.html';
    window.location.href = redirectUrl;
  }

  // ==================== 短信验证码 ====================
  function initSmsButton() {
    if (!smsBtn) return;
    
    smsBtn.addEventListener('click', sendSmsCode);
  }

  function sendSmsCode() {
    var phone = phoneInput ? phoneInput.value.trim() : '';
    
    // 验证手机号
    if (!phone) {
      showFieldError('phone', '请输入手机号');
      phoneInput.focus();
      return;
    }
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showFieldError('phone', '请输入正确的手机号');
      phoneInput.focus();
      return;
    }
    
    clearFieldError('phone');
    
    // 发送验证码（模拟）
    smsBtn.disabled = true;
    startSmsCountdown();
    
    // 模拟发送验证码API
    console.log('Sending SMS to:', phone);
    
    // 实际项目中这里调用后端API
    setTimeout(function () {
      // 模拟成功
      console.log('SMS sent successfully');
      // 实际项目中应该由后端返回验证码或发送状态
    }, 500);
  }

  function startSmsCountdown() {
    var countdown = CONFIG.SMS_INTERVAL;
    
    smsBtn.textContent = countdown + 's';
    smsBtn.classList.add('countdown');
    
    var timer = setInterval(function () {
      countdown--;
      
      if (countdown <= 0) {
        clearInterval(timer);
        smsBtn.textContent = '获取验证码';
        smsBtn.disabled = false;
        smsBtn.classList.remove('countdown');
      } else {
        smsBtn.textContent = countdown + 's';
      }
    }, 1000);
  }

  // ==================== 记住我 ====================
  function saveRememberUser(username) {
    try {
      localStorage.setItem(CONFIG.USER_KEY, username);
      localStorage.setItem(CONFIG.REMEMBER_KEY, 'true');
    } catch (e) {
      console.warn('Cannot save remember user:', e);
    }
  }

  function loadRememberedUser() {
    try {
      var remembered = localStorage.getItem(CONFIG.REMEMBER_KEY);
      var username = localStorage.getItem(CONFIG.USER_KEY);
      
      if (remembered === 'true' && username && usernameInput) {
        usernameInput.value = username;
        rememberCheckbox.checked = true;
      }
    } catch (e) {
      console.warn('Cannot load remembered user:', e);
    }
  }

  // ==================== 工具函数 ====================
  function getQueryParam(name) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  // ==================== 退出登录 ====================
  window.logout = function () {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    window.location.href = 'login.html';
  };

  // ==================== 检查登录状态 ====================
  window.checkLogin = function () {
    var token = localStorage.getItem('auth_token');
    var userInfo = localStorage.getItem('user_info');
    
    if (token && userInfo) {
      try {
        return JSON.parse(userInfo);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // ==================== 初始化 ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

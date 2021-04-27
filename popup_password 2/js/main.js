/**
 * 覆盖型页面组件
 */
define(function(require, exports, module) {
	'use strict'; //开启严格模式
	//***********
	//页面对象引用 
	//***********
	var core = require("util/core"),
		common = require("util/common"),
		navigate = require("util/navigate"),
		user = require("config/user"),
		views = require("config/views");

	//***********
	//页面全局变量
	//***********
	var value;
	var count = 0;
	var password_list = [];
	//***********
	//页面公共方法
	//***********
	var fun = {
		/**
		 * 重置密码
		 */
		resetPassword: function() {
			document.getElementById("hidden_password").value = "";
			if (!!e.detail.title) document.getElementById("title_info").innerText = e.detail.title;
			if (!!e.detail.message) document.getElementById("pay_msg").innerText = e.detail.message;
			for (var i = 0; i < 6; i++) {
				mui(".single_div")[i].classList.remove("hasValue");
				mui(".single_div")[i].classList.remove("active");
			}
			mui.later(function() {
				common.openSoftKeyboard("#hidden_password");
			}, 100);
		}
	}

	//***********
	//页面数据绑定
	//***********
	var vm = core.VM({
		data: {
			title: "",
			message: "",
			forget: false,
			uiHeight: ""
		},
		methods: {
			/**
			 * 关闭控件
			 */
			cancel: function() {
				common.hideSoftKeyboard();
				mui.later(function() {
					mui.fire(plus.webview.currentWebview().opener(), "password_cancel");
				}, 200);
			},
			/**
			 * 点击密码框
			 */
			password_tap: function() {
//				for (var i = 0; i < 6; i++) {
//					if (mui(".single_div")[i].classList.contains("active")) {
//						break;
//					}
//					if (!mui(".single_div")[i].classList.contains("active") && !mui(".single_div")[i].classList.contains("hasValue")) {
//						mui(".single_div")[i].classList.add("active");
//						break;
//					}
//				}
				var keyboard = document.getElementsByClassName('keyboard');
				console.log(keyboard[0].style.display)
				keyboard[0].style.display = "block";
			},
			/**
			 * 点击键盘
			 */
			keyboard_tap: function(e) {
				if (count < 6) {
					count ++;
					var index = count - 1;
					mui(".single_div")[index].classList.add("hasValue");
					var pwd = document.getElementById('password').value = e.target.innerText;
					password_list.push(e.target.innerText);
				}
				if (password_list.length == 6) {
					mui.later(function() {
						mui.fire(plus.webview.currentWebview().opener(), "password_finish", {
							password: password_list.join("")
						});
					}, 200);
					return;
				}
			},
			/**
			 * 删除密码
			 * 
			 */
			delete_tap: function() {
				password_list.pop();
				if (count > 0) {
					count --;
					var index = count ;
					mui(".single_div")[index].classList.remove("hasValue");	
				}
			},
			/**
			 * 密码框失去焦点
			 */
			password_blur: function() {
				for (var i = 0; i < 6; i++) {
					if (mui(".single_div")[i].classList.contains("active")) {
						mui(".single_div")[i].classList.remove("active");
						break;
					}
				}
			},
			/**
			 * 密码框输入
			 * @param {Object} e
			 */
			password_input: function(e) {
				var len = e.target.value.length;
				if (len > 6) {
					e.target.value = e.target.value.substr(0, 6);
				}
				if (e.target.validity.badInput || e.target.value == ".") {
					e.target.value = e.target.value.substr(0, len - 1);
					return;
				}
				for (var i = 0; i < len; i++) {
					mui(".single_div")[i].classList.add("hasValue");
					mui(".single_div")[i].classList.remove("active");
				}
				if (len == 6) {
					var triggerElement = document.activeElement;
					if (triggerElement) {
						triggerElement.blur();
					}
					mui.later(function() {
						mui.fire(plus.webview.currentWebview().opener(), "password_finish", {
							password: e.target.value
						});
					}, 200);
					return;
				}
				for (var i = len; i < 6; i++) {
					mui(".single_div")[i].classList.remove("hasValue");
					mui(".single_div")[i].classList.remove("active");
				}
				mui(".single_div")[len].classList.add("active");
			},
			/**
			 * 点击忘记密码
			 */
			forget_tap: function() {
				var triggerElement = document.activeElement;
				if (triggerElement) {
					triggerElement.blur();
				}

				var mode;
				mode = (user.getUserData(user.realname) != "") ? 1 : 2;
				navigate.redirectTo({
					view: views.user.payPassword,
					extras: {
						mode: mode
					}
				});
				/*mui.later(function() {
					mui.fire(plus.webview.currentWebview().opener(), "password_cancel");
				}, 500);*/
			}
		}
	});

	//***********
	//页面初始逻辑
	//***********
	core.pageReady({
		gestureConfig: {
			tap: true, //默认为true
			doubletap: true //默认为false
		}
	}, function(data) {
		vm.uiHeight = plus.screen.resolutionWidth * 0.9 + "px";
		vm.title = data.detail.title;
		vm.message = data.detail.message;
		vm.forget = !!data.detail.forget;
		window.addEventListener("password_reset", fun.resetPassword);
		window.addEventListener("touchmove", function(e) {
			e.preventDefault();
		});
	});
});
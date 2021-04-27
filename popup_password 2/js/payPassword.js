define(function(require, exports, module) {
	//开启严格模式
	'use strict';

	//页面对象引用
	var core = require("util/core"),
		net = require("util/net"),
		common = require("util/common"),
		navigate = require("util/navigate"),
		notify = require("util/notify"),
		server = require("config/server"),
		user = require("config/user"),
		views = require("config/views"),
		crypto = require("util/crypto"),
		view = require("libs/mui/js/mui.view"),
		verify = require("control/verify/main"),
		network = require("control/network/main");

	//页面全局变量

	var viewApi;
	var uid;
	var true_realname;
	var phonenumber;
	var password;
	var repassword;

	var backctrl = 0;
	var backctrl_2 = 0;
	//页面公共方法
	var fun = (function(fun) {
		fun.verifySuccess = function(flag, data, phone) {
			if(flag) {
				if(data.user_exists == 1) {
					vm.phonenumber = phone;
					viewApi.go("#identify_div");
				}
			} else {
				notify.toast("验证码错误");
			}
		};
		fun.verify_idCard = function(e) {
			var reg = /^[0-9Xx]*$/;
			(!reg.test(e.target.value) || e.target.value.length > 18) &&
			(e.target.value = e.target.value.substr(0, e.target.value.length - 1));
		};
		fun.verifyIdentify = function() {
			if(!vm.username) {
				notify.toast("请输入您的姓名!");
				return;
			}
			if(!vm.idCard) {
				notify.toast("请输入您的身份证号!");
				return;
			}
			if(!fun.checkId(vm.idCard)) {
				return;
			}
			if(vm.mode == 1) {
				if(true_realname != vm.username) {
					notify.toast("您输入的姓名与注册的信息不符!");
					return;
				}
				net.send({
					server: server.account.vertify_idcard,
					params: {
						uid: uid,
						realname: vm.username,
						idcard: vm.idCard
					},
					waiting: true,
					success: function(data) {
						notify.toast("身份验证通过!");
						common.hideSoftKeyboard();
						viewApi.go("#setPassword_div");
					},
					failure: function(data) {
						notify.toast(data.errmsg);
						plus.nativeUI.closeWaiting();
					}
				});
			} else {
				net.send({
					server: server.account.set_idcard,
					params: {
						uid: uid,
						realname: vm.username,
						idcard: vm.idCard
					},
					waiting: true,
					success: function(data) {
						notify.toast("身份信息成功添加!");
						user.setUserData(user.realname, vm.realname);
						viewApi.go("#setPassword_div");
					},
					failure: function(data) {
						notify.toast(data.errmsg);
						plus.nativeUI.closeWaiting();
					}
				});
			}
		};
		fun.checkId = function(id) {
			if(id.length != 18) {
				notify.toast("身份证长度不正确!");
				return false;
			}
			if(id[17] == "x") {
				id[17] = "X";
			}
			var str = id.substr(0, 17);
			var w = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
			var c = [1, 0, "X", 9, 8, 7, 6, 5, 4, 3, 2];
			var sum = 0;
			for(var i = 0; i < 17; i++) {
				sum += str[i] * w[i];
			}
			var r = sum % 11;
			var res = c[r];
			if(res == id[17]) {
				return true;
			} else {
				//document.getElementById("IdCard").value = cardId_value.substr(0, 17);
				notify.toast("请输入正确的身份证号!");
				return false;
			}
		};
		fun.password_input_1 = function(e) {
			var len = e.target.value.length;
			if(len > 6) {
				e.target.value = e.target.value.substr(0, 6);
			}
			if(e.target.validity.badInput || e.target.value == ".") {
				e.target.value = e.target.value.substr(0, len - 1);
				return;
			}
			for(var i = 0; i < len; i++) {
				mui(".single_div")[i].classList.add("hasValue");
				mui(".single_div")[i].classList.remove("active");
			}
			for(var i = len; i < 6; i++) {
				mui(".single_div")[i].classList.remove("hasValue");
				mui(".single_div")[i].classList.remove("active");
			}
			if(len == 6) {
				password = crypto.md5(vm.password_1);
				document.getElementById("password_1").disabled = true;
				document.getElementById("password_2").disabled = false;
				/*vm.disabled_1 = true;
				vm.disabled_2 = false;*/
				return;
			}
			mui(".single_div")[len].classList.add("active");
		};
		fun.password_input_2 = function(e) {
			var len = e.target.value.length;
			if(len > 6) {
				e.target.value = e.target.value.substr(0, 6);
			}
			if(e.target.validity.badInput || e.target.value == ".") {
				e.target.value = e.target.value.substr(0, len - 1);
				return;
			}
			for(var i = 0; i < len; i++) {
				mui(".re_single_div")[i].classList.add("hasValue");
				mui(".re_single_div")[i].classList.remove("active");
			}
			for(var i = len; i < 6; i++) {
				mui(".re_single_div")[i].classList.remove("hasValue");
				mui(".re_single_div")[i].classList.remove("active");
			}
			if(len == 6) {
				repassword = crypto.md5(vm.password_2);
				document.getElementById("password_2").disabled = true;
				vm.disabled_2 = true;
				fun.judgePassword();
				return;
			}
			mui(".re_single_div")[len].classList.add("active");
		};
		fun.password_tap_1 = function() {
			for(var i = 0; i < 6; i++) {
				if(mui(".single_div")[i].classList.contains("active")) {
					break;
				}
				if(!mui(".single_div")[i].classList.contains("active") && !mui(".single_div")[i].classList.contains("hasValue")) {
					mui(".single_div")[i].classList.add("active");
					break;
				}
			}
		};
		fun.password_tap_2 = function() {
			for(var i = 0; i < 6; i++) {
				if(mui(".re_single_div")[i].classList.contains("active")) {
					break;
				}
				if(!mui(".re_single_div")[i].classList.contains("active") && !mui(".re_single_div")[i].classList.contains("hasValue")) {
					mui(".re_single_div")[i].classList.add("active");
					break;
				}
			}
		};
		fun.password_blur_1 = function() {
			for(var i = 0; i < 6; i++) {
				if(mui(".single_div")[i].classList.contains("active")) {
					mui(".single_div")[i].classList.remove("active");
					break;
				}
			}
		};
		fun.password_blur_2 = function() {
			for(var i = 0; i < 6; i++) {
				if(mui(".re_single_div")[i].classList.contains("active")) {
					mui(".re_single_div")[i].classList.remove("active");
					break;
				}
			}
		};
		fun.judgePassword = function() {
			if(password == repassword) {
				vm.disabled_1 = true;
				vm.disabled_2 = true;
				fun.setPassword();
			} else {
				document.getElementById("password_1").value = "";
				document.getElementById("password_2").value = "";
				document.getElementById("password_1").disabled = false;
				for(var i = 0; i < 6; i++) {
					mui(".single_div")[i].classList.remove("hasValue")
					mui(".single_div")[i].classList.remove("active");
				}
				for(var i = 0; i < 6; i++) {
					mui(".re_single_div")[i].classList.remove("hasValue")
					mui(".re_single_div")[i].classList.remove("active");
				}
				notify.toast("两次密码输入不一致,请重新输入!");
			}
		};
		fun.setPassword = function() {
			var uid = user.getUserData(user.userid);
			net.send({
				server: server.account.set_pay_password,
				params: {
					uid: uid,
					new: password
				},
				waiting: true,
				success: function(e) {
					notify.toast("支付密码设置成功,请牢记!");
					user.setUserData(user.paypasswdstate, "1");
					var timeout = setTimeout(function() {
						backctrl_2 = 1;
						mui.back();
						clearTimeout(timeout);
					}, 200);
				},
				failure: function(e) {
					notify.toast("支付密码设置失败,请重试!");
					vm.disabled_1 = "";
					vm.password_1 = "";
					vm.password_2 = "";
					for(var i = 0; i < 6; i++) {
						mui(".single_div")[i].classList.remove("hasValue")
						mui(".single_div")[i].classList.remove("active");
					}
					for(var i = 0; i < 6; i++) {
						mui(".re_single_div")[i].classList.remove("hasValue")
						mui(".re_single_div")[i].classList.remove("active");
					}
				}
			});
		};
		return fun;
	})(fun || {});

	//页面数据绑定
	var vm = core.VM({
		data: {
			mode: "",
			verify_tips_1: "请输入绑定手机",
			verify_tips_2: "我们将为您验证",
			realname: "",
			username: "",
			idCard: "",
			identify_tips_1: "",
			identify_tips_2: "",
			setPassword_tips_1: "为了您的安全",
			setPassword_tips_2: "现在请设置您的支付密码",
			password_1: "",
			password_2: "",
			disabled_1: false,
			disabled_2: true
		},
		methods: {
			next_page: fun.verifyIdentify,
			verify_idCard: fun.verify_idCard,
			password_input_1: fun.password_input_1,
			password_input_2: fun.password_input_2,
			password_tap_1: fun.password_tap_1,
			password_tap_2: fun.password_tap_2,
			password_blur_1: fun.password_blur_1,
			password_blur_2: fun.password_blur_2
		},
		computed: {}
	});

	//页面初始化
	core.pageReady(function(data) {
		vm.mode = data.detail.mode;
		uid = user.getUserData(user.userid);
		phonenumber = user.getUserData(user.userphone);
		true_realname = vm.realname = user.getUserData(user.realname);
		vm.realname = true_realname && true_realname.substr(0, 1);
		if(!!true_realname) {
			for(var i = 1; i < true_realname.length; i++) {
				vm.realname += "*";
			}
		}

		if(vm.mode == 1) {
			vm.identify_tips_1 = "为了您的支付安全";
			vm.identify_tips_2 = "我们将验证您的身份信息";
		} else {
			vm.identify_tips_1 = "为了您的支付安全";
			vm.identify_tips_2 = "请输入您的身份信息";
		}

		viewApi = mui('#payPassword_page').view({
			//默认显示div配置
			defaultPage: '#verify_div',
			//配置测试开启侧滑返回
			swipeBackPageActiveArea: 0
		});
		verify.verifySelfPhone(true);
		verify.verifyCodeSuccess(fun.verifySuccess);

		navigate.beforeBack(function() {
			if(backctrl_2) {
				return true;
			}
			if(backctrl) {
				return false;
			} else {
				backctrl = 1;
				var tips;
				var bts = ["取消", "现在放弃"];
				plus.nativeUI.confirm("您现在是否要放弃设置支付密码?", function(e) {
					var i = e.index;
					switch(i) {
						case 1:
							{
								backctrl_2 = 1;
								mui.back();
							}
						case 0:
							{
								backctrl_2 = 0;
								backctrl = 0;
							}
					}
				}, "提示", bts);
				return false;
			}
		});
		//初始化数据加载
		core.loadReady([]);
	});
});
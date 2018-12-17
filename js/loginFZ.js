$(function () {
    var letao = new Letao();
    letao.login();
    letao.goRegister();
})
var Letao = function () {

}
Letao.prototype = {
    //1.登录功能
   
    login: function () {
        var that=this;
        $('.btn-sure').on('tap', function () {
            //获取账号
            var username = $('.username').val();
            //如果用户没输入账号就弹出提示框
            if (!username.trim()) {
                mui.alert('请输入用户名', '温馨提示', '确定');
                return false;
            }
            //获取密码
            var password = $('.password').val();
            // console.log(username)
            // console.log(password)
            if (!password.trim()) {
                mui.alert('请输入密码', '温馨提示', '确定');
                return false;
            }
            //发起ajax请求
            $.ajax({
                url: "/user/login",
                type: 'post',
                data: {
                    username: username,
                    password: password
                },
                success: function (data) {
                    console.log(data);
                    if (data.error == 403) {
                        mui.toast('请输入正确的用户名或者密码', {
                            duration: 1000,
                            type: 'div'
                        })
                    } else if (data.success) {
                        //返回上一页
                        // history.back()  
                        // 1. 获取当前登录页面的参数 returnUrl 的值
                        var returnUrl = that.getQueryString('returnUrl');
                        // 2. 使用location跳转到这个地址
                        location = returnUrl;
                    }
                }
            })
        })
    },

    //2.注册功能
    goRegister: function () {
        //2.注册页面
        $('.btn-register').on('tap', function () {
            //跳转到注册页面
            location = 'register.html';
        })
    },

    //获取url参数页面
    getQueryString:function(name){
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            // 用了另一种转码方式 我们是默认转码方式 使用decodeURI
            // return unescape(r[2]);
            return decodeURI(r[2]);
        }
        return null;
    }
}
$(function(){
    //1.实现登录按钮功能
    //1.1对用户的账号和密码进行非空判断
    //1.2获取用户的账号和密码
    //1.3发起ajax请求
    $('.btn-sure').on('tap',function(){
        //获取账号
        var username=$('.username').val();
        //如果用户没输入账号就弹出提示框
        if(!username.trim()){
            mui.alert('请输入用户名', '温馨提示', '确定');
            return false;
        }
        //获取密码
        var password=$('.password').val();
        // console.log(username)
        // console.log(password)
        if(!password.trim()){
            mui.alert('请输入密码', '温馨提示', '确定');
            return false;
        }
       //发起ajax请求
       $.ajax({
           url:"/user/login",
           type:'post',
           data:{username:username,password:password},
           success:function(data){
                console.log(data);
                if(data.error==403){
                    mui.toast('请输入正确的用户名或者密码',{ duration:1000, type:'div' }) 
                }else if(data.success){
                    //返回上一页
                    // history.back()  
                    // 1. 获取当前登录页面的参数 returnUrl 的值
                    var returnUrl=getQueryString('returnUrl');
                     // 2. 使用location跳转到这个地址
                    location=returnUrl;
                }
           }
       })
    })


    //2.注册页面
    $('.btn-register').on('tap',function(){
        //跳转到注册页面
        location='register.html';
    })
})


//别人使用正则写的获取url地址栏参数的方法
function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        // 用了另一种转码方式 我们是默认转码方式 使用decodeURI
        // return unescape(r[2]);
        return decodeURI(r[2]);
    }
    return null;
}
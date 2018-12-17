$(function(){
    var letao=new Letao();
    letao.register();
    letao.getvCode();
})

function Letao(){
    Letao.prototype.vCode='';
    //1.注册
    Letao.prototype.register=function(){
        var that=this;
        $('.btn-confirm').on('tap',function(){
            var check = true;
            mui(".mui-input-group input").each(function() {
                //1.1若当前input为空，则alert提醒 
                if(!this.value || this.value.trim() == "") {
                    var label = this.previousElementSibling;
                    mui.alert(label.innerText + "不允许为空");
                    check = false;
                    return false;
                }
                }); //校验通过，继续执行业务逻辑 
                if(check){
                   //1.2获手机号
                   var mobile=$('.mobile').val();
                   //1.3获取用户名
                   var username=$('.username').val();
                   //1.4验证手机号是否符合要求
                   if (!(/^1[345789]\d{9}$/.test(mobile))) {
                    mui.alert('您输入的手机号不符合要求！');
                    return false;
                    }
                    //1.5判断密码是否一致
                    var password1=$('.password1').val();
                    var password2=$('.password2').val();
                    if(password1!=password2){
                        mui.alert('两次输入的密码不一致！');
                        return false;   
                    }
                    //1.6判断验证码是否获取
                    if(!that.vCode){
                        mui.toast('请获取验证码',{ duration:1000, type:'div' }) 
                        return false;
                    }
                    //1.7判断验证码是否一致
                    var nowvCode = $('.input-vcode').val();
                    console.log(nowvCode);
                    if(that.vCode!=nowvCode){
                        mui.toast('请输入正确的验证码');
                        return false;     
                    }
                    //1.8发起ajax请求
                    $.ajax({
                        url: '/user/register',
                        type: 'post',
                        data: {username:username,password:password1,mobile:mobile,vCode:that.vCode},
                        success: function (data) {
                            // 8. 判断如果注册失败 提示用户失败的原因
                            if(data.error == 403){
                                // 把错误的信息通过toast提示用户错误的原因
                                mui.toast(data.message);
                            }else{
                                //// 表示注册成功 返回到登录页面去登录 而且传递了一个参数  登录成功后要跳转到的页面是首页
                                location = 'login.html?returnUrl=index.html';
                            }
                        }
                    })
                }
           
        })
    
    }
    //2.获取验证码
    Letao.prototype.getvCode=function(){
        var that=this;
        $('.btn-get-vcode').on('tap',function(){
            $.ajax({
                url:'/user/vCode',
                type:'get',
                success:function(data){
                    that.vCode=data.vCode;
                    console.log(that.vCode);
                }
            })
        })
    }
}
$(function(){
    //1.渲染个人中心信息
    $.ajax({
        url:'/user/queryUserMessage',
        success:function(data){
            console.log(data)
            // 2.判断数据有没有成功 没有就去登录
            if(data.error==400){
                location='login.html?returnUrl='+location.href;
            }else{
                //3.渲染到页面上
                $('.username span').html(data.username);
                $('.mobile span').html(data.mobile);
            }
        }
    })

    //2.退出登录
    $('.btn-exit').on('tap',function(){
        $.ajax({
            url:'/user/logout',
            success:function (data) {
                console.log(data);
                // 3. 判断如果退出成功就去登录
                if(data.success){
                    // 4. 退出成功就跳转到登录页面
                    location = 'login.html?returnUrl='+location.href;
                }
            }
        })
    })
})
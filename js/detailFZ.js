$(function(){
    var letao=new Letao();
    letao.queryProductDetail();
    letao.addCart();
})
var Letao=function(){

}
Letao.prototype={

     // 1. 查询商品详情 并渲染
    queryProductDetail:function(){
     var that=this;
         // 1. 实现商品详情渲染
    // 	1. 获取url中id参数的值
    // 	2. 根据id参数的值去请求详情数据
    // 	3. 分开渲染
    // 		1. 渲染商品的轮播图
    // 		2. 渲染商品的详情信息
    // 1. 使用获取地址栏参数的函数 获取id参数的值
    that.id=that.getQueryString('id');
    //1.2准备ajax渲染轮播图
    $.ajax({
        url:'/product/queryProductDetail',
        type:'get',
        data:{id:that.id},
        success:function(data){
            console.log(data)
            // 1.2在渲染轮播图之前把页面的静态结构清空 不清空会有问题
            // 1.3调用轮播图模板去渲染轮播图
            var html=template('slideTpl',data);
            $('#slider .mui-slider').html(html);
            // 轮播图初始化
            var slider = mui(".mui-slider");
            slider.slider({
                interval: 1000
            });

             //2.渲染商品信息
            //2.1因为码数并不是数组，所以我们要做个处理，获取码数的属性
            var sizeArr=data.size.split('-');
            console.log(sizeArr);//["40", "50"]
            //2.2声明一个空的数组，用来后面的循环添加到新的数组里面
            var size = [];
            //2.3开始循环 sizeArr[0]-0为了转成数字类型,后面自动转
            for(var i=(sizeArr[0]-0);i<=sizeArr[1];i++){
                size.push(i);
            }
            console.log(size);//[40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]
            //2.3给size重新赋值
            data.size=size;
            //1.9渲染前拿出以前存储在本地的码数和数量
            data.prevSize=localStorage.getItem('size');
            data.prevNum=localStorage.getItem('num');
            //2.4开始导入模板
            var html = template('productTpl', data);
            //2.5渲染到容器上
            $('#product').html(html);
            //2.6因为渲染了模板，导致数字框功能失效，所以要重新初始化
            mui('.mui-numbox').numbox();
            //2.0读取到本地储存的数量，并开始赋值
            mui('.mui-numbox').numbox().setValue(data.prevNum);
            //2.7给码数添加点击事件，因为是渲染完了，所以不用事件委托事件
            $('.product-size .btn-size').on('tap',function(){
                //2.8给当前的点击尺码按钮添加 类名 其他尺码删除类名
                $(this).addClass('mui-btn-warning').siblings().removeClass('mui-btn-warning')
            })
             //2.9等渲染完再区域滚动
             mui('.mui-scroll-wrapper').scroll({
                deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
            });
           
        }
        
       
        
    })
    },
    
    //2.加入购物车
    addCart:function(){
        var that=this;
        $('#footer .btn-buyCar').on('tap',function(){
            //1.2获取当前获取的码数,如果有按钮btn-size,又有mui-btn-warning表示被选中了,获取按钮身上的data-size属性的值
            var size=$('.btn-size.mui-btn-warning').data('size');
            console.log(size);
            //1.3进行size判断，如果用户没选择码数就弹出提示框
            if(!size){
                //duration 提示的时间
                mui.toast('选择你的码数',{ duration:1000, type:'div' });
                return false;
            }
            //1.4获取当前的码数,使用MUI提供的方法获取数字框的值 传递一个数字框的容器
            var num=mui('.mui-numbox').numbox().getValue();
            console.log(num);
            //1.5对数量进行判断，如果没有数量的值，提示用户
            if(!num){
                mui.toast('请选择数量',{ duration:1000, type:'div' });
                return false;  
            }
            //1.8实现返回购买页面显示当初显示的码数和数量
            localStorage.setItem('size',size);
            localStorage.setItem('num',num);
    
            //1.6当码数和数量都选完了，就进行发起ajax请求
            $.ajax({
                url:'/cart/addCart',
                type:'post',
                data:{productId:that.id,num:num,size:size},
                success:function(data){
                    console.log(data);
                    //1.7 判断当前是否加入购车成功  不成功跳转到登录
                    //后台返回数据里面有error表示失败未登录
                    if(data.error==400){
                        console.log(location.href);//就是当前页面url
                        // 未登录跳转到登录页面
                        location='login.html?returnUrl='+location.href;
                    }else {
                        mui.confirm('加入购物车是否去购物车查看?', '温馨提示', ['yes', 'no'], function(e) {
                            // 8. 因为e.index == 0 表示点击了左边的确定 e.index == 1表示点击了右边的取消
                            if(e.index == 0){
                                // 9.点击了是 跳转到购物车
                                location = 'cart.html';
                            }
                        }); 
                    }
                }
            })
        })
    },

    // 3. 获取ur参数的值
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
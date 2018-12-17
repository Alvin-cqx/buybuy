$(function(){
    /* 1.实现购物车商品的渲染 
        1.1发起ajax请求
        1.2创建购物车商品的模板
        1.3调用模板进行渲染
    */
    var page=1;
    $.ajax({
        url:'/cart/queryCartPaging',
        data:{page:page,pageSize:4},
        success:function(data){
            console.log(data)
            // data数据库后台返回的值有问题 当没有数据的时候 后台返回空数组 []
            //如果返回空数组传入模板使用的data会报错
            //进行判断 如果是空数据 就赋值给一个对象 里面就有data数组值为空
            if(Array.isArray(data)){
                data={
                    data:[]
                }
            }
            var html=template('cartProductTpl',data);
            $('.cart-list').html(html);
        }
    
    })
    


    
/* 2.实现购物车上拉刷新 下拉加载更多
     2.1写结构  
     2.2初始化下拉和上拉
     2.3下拉刷新回调函数 发送请求 刷新页面 结束下拉刷新 重置page 和上拉加载
     2.4上拉加载回调函数 发送发一页数据 追加到页面 结束上拉加载 判断 如果没有数据就提示  */
    mui.init({
    pullRefresh : {
      container:"#refreshContainer",//下拉刷新容器标识，querySelector能定位的css选择器均可，比如：id、.class等
      down : {
        callback :function(){
            //用定时器模拟加载
            setTimeout(function(){
             //每次加载都重置第一页
             page=1;
             $.ajax({
                 url:'/cart/queryCartPaging',
                 data:{page:page,pageSize:4},
                 success:function(data){
                     console.log(data)
                     // data数据库后台返回的值有问题 当没有数据的时候 后台返回空数组 []
                     //如果返回空数组传入模板使用的data会报错
                     //进行判断 如果是空数据 就赋值给一个对象 里面就有data数组值为空
                     if(Array.isArray(data)){
                         data={
                             data:[]
                         }
                     }
                     var html=template('cartProductTpl',data);
                     $('.cart-list').html(html);
                      // 3. 结束上拉加载 注意官方结束代码有问题 改成 endPulldownToRefresh
                      mui('#refreshContainer').pullRefresh().endPulldownToRefresh();
                    // 4. 结束了下拉刷新后 要重置上拉加载的效果
                      mui('#refreshContainer').pullRefresh().refresh(true);
                 }
             })
            },800)
        }
      },
      up: {
         //上拉加载的回调函数       
         callback: function() {
             // 1. 为了模拟延迟写一个定时器
             setTimeout(function() {
                 // 上拉请求数据之前 让page ++
                 page++;
                 // 2. 请求数据
                 $.ajax({
                     url: '/cart/queryCartPaging', //请求带分页的API
                     data: { page: page, pageSize: 4 },
                     success: function(data) {
                         console.log(data);
                         // 因为data数据后台返回有点问题 当没有数据 后台直接返回空数组 而不是对象 
                         // 如果是空数组传入到模板使用里面的data会报错
                         if (Array.isArray(data)) {
                             // 判断如果是一个空数组 赋值给一个对象 里面有data数组值为空
                             data = {
                                 data: []
                             };
                             // 如果已经是空数组了 表示没有数据了 
                             // 3. 结束上拉加载 注意官方结束代码有问题 改成 endPullupToRefresh
                             mui('#refreshContainer').pullRefresh().endPullupToRefresh(true);
                             // 并且return 后面代码不执行
                             return false;
                         }
                         var html = template('cartProductTpl', data);
                         // 4. 上拉追加不是替换
                         $('.cart-list').append(html);
                         // 3. 结束上拉加载 注意官方结束代码有问题 改成 endPullupToRefresh
                         mui('#refreshContainer').pullRefresh().endPullupToRefresh();
                     }
                 });
             }, 2000);
         }
     }
     }
     });


/* 3.实现计算总金额
    3.1获取当前所有复选框(添加change事件，当复选框的值发生改变的时候就出发)
    3.2遍历所有选中的复选框 计算每一个复选框的商品价格和数量 为商品单价
    3.3 定义一个和把所有商品单价相加求总和
    3.4把总金额渲染到页面中*/
//3.1给所有复选框添加changge事件，因为是动态添加 用事件委托来完成
$('.cart-list').on('change','.checkbox-product',function(){
    // 获取所有被选中的复选框
    var checkboxs=$('.checkbox-product:checked');
    // 声明一个空的变量来存储总金额
    var sum =0;
    //遍历所有被选中的复选框
    for(var i=0;i<checkboxs.length;i++){
        //获取当前每个选中复选框的价格和数量，模板用自定义属性设置
        var price=$(checkboxs[i]).data('price');
        var num=$(checkboxs[i]).data('num');
        //计算当前单个商品的总价
        var singleCount=price*num;
        //计算总和
        sum+=singleCount;
        console.log(singleCount);
        
    }
    // 因为js计算的小数点 所以保留2位
    sum = sum.toFixed(2);
    console.log(sum);
    // 计算总金额到页面
    $('.order-total span').html(sum);
    
})


/* 4.商品的删除 
    4.1点击删除按钮弹出确定框
    4.2如果点击确定就删除商品id
    4.3调用删除的api删除商品
    4.4删除完重新加载页面
    4.5点击取消 不删 页面滑动回去*/
//4.1给所有删除按钮动态添加点击事件
$('.cart-list').on('tap','.btn-delete',function(){
    //改变this的指向 因为后面的回调函数要用 所以是这个函数内部的全局变量 
    var that=this; 
    console.log(that);
    mui.confirm('你确定要删除吗？','温馨提示',['确定','取消'],function(e){
         // console.log(this);//这个函数没人调用 是window 就不是按钮 把按钮提前保存到that变量中
         //4.2判断用户点击了确定删除
         console.log(e);
         if(e.index==0){
           var id=$(that).data('id');
           $.ajax({
               url:'/cart/deleteCart',
               data:{id:id},
               success:function(data){
                    console.log(data)
                    //4.3 如果删除成功就刷新页面
                    if(data.success){
                        //4.4重置为第一页
                        page=1;
                        $.ajax({
                            url: '/cart/queryCartPaging', //请求带分页的API
                            data: { page: page, pageSize: 4 },
                            success: function(data) {
                                console.log(data);
                                // 因为data数据后台返回有点问题 当没有数据 后台直接返回空数组 而不是对象 
                                // 如果是空数组传入到模板使用里面的data会报错
                                if (Array.isArray(data)) {
                                    // 判断如果是一个空数组 赋值给一个对象 里面有data数组值为空
                                    data = {
                                        data: []
                                    }
                                }
                                console.log(data);
                                var html = template('cartProductTpl', data);
                                $('.cart-list').html(html);
                                // 9. 刷新页面的时候重置 上拉加载的效果
                                mui('#refreshContainer').pullRefresh().refresh(true);
                            }
                        });
                    }
               }
           })

         }else{
            //4.4点击取消后 滑动会原始状态
            // 获取当前要滑动回去的li 只能使用dom元素 不能是zpeto对象
            var li=that.parentNode.parentNode;
            //调用官方的滑动关闭函数
            mui.swipeoutClose(li);
        }

    })
})


/* 5.对商品进行编辑
    5.1点击编辑按钮弹出一个确定框
        5.11确定框里面有样式 有标签 有文字
        5.12让编辑栏可以选尺码和数量
    5.2点击了确定 获取当前所选的尺码和数量 
    5.3调用编辑的api传入新的尺码和数量
    5.4编辑成功后重新刷新页面
    5.5如果点击取消了 滑动列表回去*/

    //5.1点击编辑按钮弹出一个确定框,动态添加 需要委托事件
    $('.cart-list').on('tap','.btn-edit',function(){
        //后面有回调函数，需声明一个局部变量
        var that=this;
        //5.2在弹出框出来前去渲染当前的码数和数量
        //5.3获取当前按钮上绑定的单个商品所有数据
        var data=$(that).data('product');
        // console.log(data);
        //5.4把商品尺码40-50字符串 转成数组
        var sizeArr = data.productSize.split('-');
        // 5.5 真正的尺码数组
        var size = [];
        // 5.6定义一个循环从数组[0] 40开始 到 [1] 50结束  包含<= 把循环的每个i的值加到数组中
        for (var i = (sizeArr[0] - 0); i <= sizeArr[1]; i++) {
            size.push(i);
        }
        // 5.7把临时真实数组放到data对象里面 productSize属性上
        data.productSize = size;
        console.log(data);
        //5.8开始渲染编辑商品页面
        var html=template('editCartTpl',data);
        // 5.9把html字符串的回车换行去掉 
        html = html.replace(/[\r\n]/g, '');
        // 5.10. 弹出一个确认框 把准备好的尺码数量模板放到确认框里面
        mui.confirm(html,'编辑商品',['确定', '取消'],function(e){
            console.log(e)
            // 选中确定 
            if(e.index==0){
                //获取当前的尺码 和数量
                var size = $('.btn-size.mui-btn-warning').data('size');
                var num = mui('.mui-numbox').numbox().getValue();
                //调用ajax,更新你选的尺码和数量
                $.ajax({
                    url:'/cart/updateCart',
                    type:'post',
                    data:{id: data.id, size: size, num: num},
                    success:function(data){
                        console.log(data)
                        //如果编辑成功了就刷新页面
                        if(data.success){
                            page = 1;
                            $.ajax({
                                url: '/cart/queryCartPaging', //请求带分页的API
                                data: { page: page, pageSize: 4 },
                                success: function(data) {
                                    console.log(data);
                                    // 因为data数据后台返回有点问题 当没有数据 后台直接返回空数组 而不是对象 
                                    // 如果是空数组传入到模板使用里面的data会报错
                                    if (Array.isArray(data)) {
                                        // 判断如果是一个空数组 赋值给一个对象 里面有data数组值为空
                                        data = {
                                            data: []
                                        }
                                    }
                                    console.log(data);
                                    var html = template('cartProductTpl', data);
                                    $('.cart-list').html(html);
                                    // 7. 刷新页面的时候重置 上拉加载的效果
                                    mui('#refreshContainer').pullRefresh().refresh(true);
                                }
                            }); 
                        }
                    }
                })
            }else{
                //点击了取消 把当前列表滑动回去
                // 1. 获取当前要滑动回去的li 只能使用dom元素 不能是zpeto对象
                var li = that.parentNode.parentNode;
                // 2. 调用官方的滑动关闭函数
                mui.swipeoutClose(li);   
               }
        })
        //5.11等确定框代码执行html渲染到确认框里面就初始化数量框，让他能够选择
        mui('.mui-numbox').numbox();
        //5.12使用数字框设置的方法  设置value的值为当前选中商品的数量
        mui('.mui-numbox').numbox().setValue(data.num);
        //5.13让尺码添加点击事件
        $('.product-size .btn-size').on('tap', function() {
            // 5.14.给当前的点击尺码按钮添加 类名 其他尺码删除类名
            $(this).addClass('mui-btn-warning').siblings().removeClass('mui-btn-warning');
        });
    })
})

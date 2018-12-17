$(function(){
   var letao=new Letao();
   letao.pullDownUpRefresh();
   letao.queryCart();
   letao.totall();
   letao.deleteProduct();
   letao.editProduct();

})
function Letao(){
    Letao.prototype.page=1;
    Letao.prototype.pageSize=4;
    //ajax封装
    Letao.prototype.queryCartData=function(callback){
        var that=this;
        $.ajax({
            url:'/cart/queryCartPaging',
            data:{page:that.page,pageSize:that.pageSize},
            success:function(data){
                console.log(data)
                if (data.error == 400) {
                    // 跳转到登录页面 并且指定登录成功后返回当前页面
                    location = 'login.html?returnUrl=' + location.href;
                }
                // data数据库后台返回的值有问题 当没有数据的时候 后台返回空数组 []
                //如果返回空数组传入模板使用的data会报错
                //进行判断 如果是空数据 就赋值给一个对象 里面就有data数组值为空
                if(Array.isArray(data)){
                    data={
                        data:[]
                    }
                }
                callback(data);
            }
        
        })
        
    }


    //1.实现购物车商品的渲染 
    Letao.prototype.queryCart=function(){
        var that=this;
        that.page=1;
       
        that.queryCartData(function(data){
            // 3. 渲染和重置上拉加载更多
            var html = template('cartProductTpl', data);
            $('.cart-list').html(html);
            // 4. 刷新页面的时候重置 上拉加载的效果
            mui('#refreshContainer').pullRefresh().refresh(true);
        })
        
    };

    //2.初始化上拉下拉
    Letao.prototype.pullDownUpRefresh=function(){
        var that=this;
        mui.init({
            pullRefresh : {
              container:"#refreshContainer",//下拉刷新容器标识，querySelector能定位的css选择器均可，比如：id、.class等
              down : {
                callback :function(){
                    //用定时器模拟加载
                    setTimeout(function(){
                     //每次加载都重置第一页
                     that.page=1;
                     that.queryCartData(function(data){
                        var html=template('cartProductTpl',data);
                        $('.cart-list').html(html);
                         // 3. 结束上拉加载 注意官方结束代码有问题 改成 endPulldownToRefresh
                         mui('#refreshContainer').pullRefresh().endPulldownToRefresh();
                       // 4. 结束了下拉刷新后 要重置上拉加载的效果
                         mui('#refreshContainer').pullRefresh().refresh(true);
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
                         that.page++;
                         // 2. 请求数据
                         that.queryCartData(function(data){
                            if(data.data.length>0){
                                // 3. 渲染和重置上拉加载更多
                                var html = template('cartProductTpl', data);
                                $('.cart-list').append(html);
                                // 4. 刷新页面的时候重置 上拉加载的效果
                                mui('#refreshContainer').pullRefresh().endPullupToRefresh(); 
                            }else{
                                mui('#refreshContainer').pullRefresh().endPullupToRefresh(true);  
                            }
                           
                        })
                     }, 2000);
                 }
             }
             }
             });
    }

    //3.实现计算总金额
    Letao.prototype.totall=function(){
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
        
    }

    //4.删除商品
    Letao.prototype.deleteProduct=function(){
        var that=this;
        $('.cart-list').on('tap','.btn-delete',function(){
            //改变this的指向 因为后面的回调函数要用 所以是这个函数内部的全局变量 
            var btn=this; 
            console.log(btn);
            mui.confirm('你确定要删除吗？','温馨提示',['确定','取消'],function(e){
                 // console.log(this);//这个函数没人调用 是window 就不是按钮 把按钮提前保存到that变量中
                 //4.2判断用户点击了确定删除
                 console.log(e);
                 if(e.index==0){
                   var id=$(btn).data('id');
                   $.ajax({
                       url:'/cart/deleteCart',
                       data:{id:id},
                       success:function(data){
                            console.log(data)
                            //4.3 如果删除成功就刷新页面
                            if(data.success){
                                //4.4重置为第一页
                                that.page=1;
                                that.queryCartData(function(data){
                                    // 3. 渲染和重置上拉加载更多
                                    var html = template('cartProductTpl', data);
                                    $('.cart-list').html(html);
                                    // 4. 刷新页面的时候重置 上拉加载的效果
                                    mui('#refreshContainer').pullRefresh().refresh(true);
                                })
                            }
                       }
                   })
        
                 }else{
                    //4.4点击取消后 滑动会原始状态
                    // 获取当前要滑动回去的li 只能使用dom元素 不能是zpeto对象
                    var li=btn.parentNode.parentNode;
                    //调用官方的滑动关闭函数
                    mui.swipeoutClose(li);
                }
        
            })
        })
        
    }

    //5.编辑商品
    Letao.prototype.editProduct=function(){
        var that=this;
        $('.cart-list').on('tap','.btn-edit',function(){
            //后面有回调函数，需声明一个局部变量
            var btn=this;
            //5.2在弹出框出来前去渲染当前的码数和数量
            //5.3获取当前按钮上绑定的单个商品所有数据
            var data=$(btn).data('product');
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
                                that.page = 1;
                                that.queryCartData(function(data){
                                    // 3. 渲染和重置上拉加载更多
                                    var html = template('cartProductTpl', data);
                                    $('.cart-list').html(html);
                                    // 4. 刷新页面的时候重置 上拉加载的效果
                                    mui('#refreshContainer').pullRefresh().refresh(true);
                                })
                            }
                        }
                    })
                }else{
                    //点击了取消 把当前列表滑动回去
                    // 1. 获取当前要滑动回去的li 只能使用dom元素 不能是zpeto对象
                    var li = btn.parentNode.parentNode;
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
    }
}
$(function(){
    // 声明全局变量。方便函数的调用
    var page=1;
    var pageSize=2;

    //1.根据传过来的url，获取search键的值
    var search=getQueryString('search');
    //1.1发起ajax请求
    $.ajax({
        url:'/product/queryProduct',
        data:{proName:search,page:page||1,pageSize:pageSize||2},
        success:function(data){
         console.log(data)
         var html=template('productlistTpl',data);
         $('.product-box').html(html);
        }
    })



    //2.给搜索按钮添加点击事件
    $('.btn-search').on('tap',function(){
    //2.1获取搜索框的内容
    var search=$('.input-search').val();
    console.log(search)
    //2.2进行非空判断 要把空格去掉 trim是去掉输入内容首位的空白
    if(!search.trim()){
        alert("请输入符合要求的内容");
        return false;
    }
    //重新更改路径
    location = 'http://localhost:3000/m/productlist.html?search=' + search;
    //  每次刷新都要先把page重置为1
    page=1;
    $.ajax({
        url:'/product/queryProduct',
        data:{proName:search,page:page||1,pageSize:pageSize||2},
        success:function(data){
         console.log(data)
         var html=template('productlistTpl',data);
         $('.product-box').html(html);
        }
    })
    })


    //3.给商品排序
    //3.1给所有排序的按钮添加点击事件
    $('.productList .title a').on('tap',function(){
        //刷新第一页
        page=1;
        //3.2获取当前点击a的排序类型 要去html那里设置属性
        var sortType=$(this).data('sort-type');
        // console.log(sortType);
        //3.3获取当前a默认的排序的顺序  1是顺序 2是倒序
        var sort=$(this).data('sort');
        //3.4 把排序的顺序改变
        if(sort==1){
            sort=2;
            // 当他的排序是倒序的时候，他的字体符号向下
            $(this).find('i').removeClass('fa-angle-down').addClass('fa-angle-up')
        }else{
            sort=1;
              // 当他的排序是顺序的时候，他的字体符号向上
            $(this).find('i').removeClass('fa-angle-up').addClass('fa-angle-down')
        }
        //3.5改了以后要重新把排序的顺序  更新到标签上
        $(this).data('sort',sort);
        //3.6判断当前的排序方式 
        //3.6.1如果是安排价格排序，要重新刷新页面，用ajax发送请求
        if(sortType=='price'){
            $.ajax({
                url:'/product/queryProduct',
                data:{proName:search,page:page||1,pageSize:pageSize||2,price:sort},
                success:function(data){
                 console.log(data)
                 var html=template('productlistTpl',data);
                 $('.product-box').html(html);
                }
            })  
        } else if(sortType=='num'){
            $.ajax({
                url:'/product/queryProduct',
                data:{proName:search,page:page||1,pageSize:pageSize||2,num:sort},
                success:function(data){
                 console.log(data)
                 var html=template('productlistTpl',data);
                 $('.product-box').html(html);
                }
            })  
        }
    // 3.7 点击了a的父元素div添加active 其他兄弟删除active
    $(this).parent().addClass('active').siblings().removeClass('active');
    })
    //4.商品下拉家族 上拉刷新功能
    //4.1初始化
    mui.init({
        pullRefresh : {
          container:"#refreshContainer",//下拉刷新容器标识，querySelector能定位的css选择器均可，比如：id、.class等
          down : {
            contentdown : "下拉可以刷新",//可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
            contentover : "释放立即刷新",//可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
            contentrefresh : "正在刷新...",//可选，正在刷新状态时，下拉刷新控件上显示的标题内容
            callback :function(){
            //请求数据的  请求渲染完毕后 要结束下拉刷新
            //1. 每次刷新的时候要先把page 重置为1 
            console.log(1)
            page = 1;  
            //2.使用定时器模拟请求延迟 2秒钟
            setTimeout(function(){
                $.ajax({
                    url: '/product/queryProduct',
                    data: { proName: search, page: page || 1, pageSize: pageSize || 2 },
                    success: function(data) {
                        // 4. 拿到数据调用模板生成html
                        var html = template('productlistTpl', data);
                        // 5. 把html渲染到页面
                        $('.product-box').html(html);
                        // 6. 结束下拉刷新
                        mui('#refreshContainer').pullRefresh().endPulldownToRefresh();
                        // 注意要等结束了下拉刷新了后再重置
                        // 7. 把上拉加载的效果也要 不然拉不了了 有时候会自动触发 不是bug希望帮你加载一些
                        mui('#refreshContainer').pullRefresh().refresh(true);
                    }
                });
            },2000) 
            }
          },
          up: {
            contentrefresh: "哥正在拼命加载中...",
            contentnomore: '我是有底线的',
            callback: function() {
                //请求数据的  请求渲染完毕后 要结束下拉刷新
                //1. 使用定时器模拟请求 2秒钟
                setTimeout(function() {
                    // 2. 上拉加载请求下一页的数据 让当前page不是写死的1 而是++后的page
                    page++;
                    // 3. 发送请求 请求请求下一页的数据
                    $.ajax({
                        url: '/product/queryProduct',
                        data: { proName: search, page: page || 1, pageSize: pageSize || 2 },
                        success: function(data) {
                            // 4. 判断数据是否有长度 有长度就追加渲染 没有长度就提示没有数据了
                            if (data.data.length > 0) {
                                // 5. 拿到数据调用模板生成html
                                var html = template('productlistTpl', data);
                                // 6. 把html渲染到页面
                                $('.product-box').append(html);
                                // 7. 只是结束上拉加载
                                mui('#refreshContainer').pullRefresh().endPullupToRefresh();
                            } else {
                                // 9. 不仅结束上拉加载 并提示没数据了
                                mui('#refreshContainer').pullRefresh().endPullupToRefresh(true);
                            }
                        }
                    });
                }, 2000)
            }
        }
        }
      })
    //5.给购买按钮添加点击事件，因为是动态添加 所以用事件委托事件
    $('.product-box').on('tap','.product-buy',function(){
          var id=$(this).data('id');
          console.log(id);
          //开始跳转页面
          location='detail.html?id='+id;
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

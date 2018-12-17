$(function () {
    //获取传递过来的内容
    var search = getQueryString('search');
    //实例化出来的letao对象
    var letao = new Letao(search);
    letao.pullDownUpRefresh();
    letao.queryProduct();
    letao.searchProduct();
    letao.sortProduct();
    letao.toBuy();



})
var Letao = function (search) {
    //公共属性
    this.search = search;

   
}
// 设置当前页码
// Letao.prototype.page=1;
// Letao.prototype.pageSize=2;
Letao.prototype = {
    page:1,
    pageSize:2,
    //查询商品
    queryProduct: function () {
        //获取要查询的内容
        var that = this;
        console.log(that.search);
        //发起ajax请求
        //   $.ajax({
        //       url:'/product/queryProduct',
        //       data:{proName:that.search,page:1,pageSize:2},
        //       success:function(data){
        //         console.log(data)
        //         var html=template('productlistTpl',data);
        //         $('.product-box').html(html);
        //       }

        //   })
        that.page=1;
        mui('#refreshContainer').pullRefresh().refresh(true);
        that.getProductData(function (data) {
            console.log(data)
            var html = template('productlistTpl', data);
            $('.product-box').html(html);
        })

    },

    //搜索商品
    searchProduct: function () {
        var that = this;
        console.log(that.search)
        //搜索按钮添加点击事件
        $('.btn-search').on('tap', function () {
            that.search = $('.input-search').val();
            //进行非空判断
            if (!that.search.trim()) {
                alert("输入正确的商品");
                return false;
            }
            that.page=1;
            mui('#refreshContainer').pullRefresh().refresh(true);
            that.getProductData(function (data) {
                console.log(data)
                var html = template('productlistTpl', data);
                $('.product-box').html(html);
            })
        })
    },

    //排序商品
    sortProduct: function () {
        var that = this;
        // console.log(that.search)
        // 给排序按钮添加点击事件
        $('.productList .title a').on('tap', function () {
            console.log(that.search)
            //获取当前点的按钮的属性
            var sortType = $(this).data('sort-type');
            console.log(sortType);
            var sort = $(this).data('sort');
            console.log(sort);
            //当他获取的时候改变他的值 同时改变他的类型
            if (sort == 1) {
                sort = 2;
                $(this).find('i').removeClass('fa-angle-down').addClass('fa-angle-up');
            } else {
                sort = 1;
                $(this).find('i').removeClass('fa-angle-up').addClass('fa-angle-down');
            }
            //改变他的值后，要重新赋值上去
            $(this).data('sort', sort);
            //根据按照什么分类排序进行判断
            // 每次刷新的时候从头开始都要page重置为1 
            that.page=1;
            // 把上拉加载的效果也要重置 这个文档没错
            mui('#refreshContainer').pullRefresh().refresh(true);
            that.getProductData(function (data) {
                console.log(data)
                var html = template('productlistTpl', data);
                $('.product-box').html(html);
            },sortType,sort)
            // 添加了a元素给他的父元素div添加activ
            $(this).parent().addClass('active').siblings().removeClass('active');
        })
    },

    //封装ajax的
    getProductData: function (callback, sortType, sort) {
        var that = this;
        var data={
            proName:that.search,
            page:that.page,
            pageSize:that.pageSize,
        }
        if(sortType=='price'){
            data.price=sort;
        }else if(sortType=='num'){
            data.num=sort;
        }
        $.ajax({
            url: '/product/queryProduct',
            data: data,
            success: function (data) {
                callback(data);
            }

        })
    },

    //上拉下拉加载刷新
    pullDownUpRefresh: function () {
        var that=this;
        mui.init({
            pullRefresh: {
                container: "#refreshContainer", //下拉刷新容器标识，querySelector能定位的css选择器均可，比如：id、.class等
                down: {
                    auto: false,//可选,默认false.首次加载自动下拉刷新一次
                    contentdown: "下拉可以刷新", //可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
                    contentover: "释放立即刷新", //可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
                    contentrefresh: "正在刷新...", //可选，正在刷新状态时，下拉刷新控件上显示的标题内容
                    callback: function () {
                        that.page=1;
                        setTimeout(function () {
                            that.getProductData(function (data) {
                                console.log(data)
                                var html = template('productlistTpl', data);
                                $('.product-box').html(html);
                                mui('#refreshContainer').pullRefresh().endPulldownToRefresh();
                                mui('#refreshContainer').pullRefresh().refresh(true);
                            })
                        }, 1000)
                    }
                },
                up: {
                    auto: false,//可选,默认false.首次加载自动下拉刷新一次
                    contentdown: "下拉可以刷新", //可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
                    contentover: "释放立即刷新", //可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
                    contentrefresh: "正在刷新...", //可选，正在刷新状态时，下拉刷新控件上显示的标题内容
                    callback: function () {
                        setTimeout(function () {
                            that.page++;
                
                            that.getProductData(function (data) {
                                console.log(data)
                                if(data.data.length>0){
                                    var html = template('productlistTpl', data);
                                    $('.product-box').append(html);
                                    mui('#refreshContainer').pullRefresh().endPullupToRefresh();
                                }else{
                                    mui('#refreshContainer').pullRefresh().endPullupToRefresh(true);
                                }
                                // mui('#refreshContainer').pullRefresh().refresh(true);  
                            })
                        }, 1000)
                    }
                },
            }
        })
    },

    //买东西
    toBuy: function () {
        $('.product-box').on('tap', '.product-buy', function () {
            var id = $(this).data('id');
            console.log(id);
            //开始跳转页面
            location = 'detail.html?id=' + id;
        })
    }
}



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
$(function(){
    //1. 创建 Letao对象的实例 letao
    var letao=new Letao('historyData');
    // 调用对象里面的每个功能   
    // letao.addHistory();
    // letao.queryHistory();
    // letao.deleteHistory();
    // letao.clearHistory();
    // 2. 调用letao实例对象里面的一些函数
    // 因为每个函数里面都返回this对象 letao对象 
    // 当点下一个的时候 把前面当成一个表达式 取表达式的返回值来调用下一个函数 
    // 表达式的返回值就是函数 返回值 就是letao对象
    //调用添加 调用查询 调用删除 调用清空
    letao.addHistory().queryHistory().deleteHistory().clearHistory();




 
})
var Letao=function(key){
    this.key=key
}

Letao.prototype={
      //1.添加历史记录
      addHistory:function(){
        console.log(this);
        //this表示当前调用函数的对象 addHistory是letao对象调用的 所以this就是letao对象
        var that = this; //把 this对象 赋值给 that 变量
           // 1.给搜索按钮添加点击事件
       $('.btn-search').on('tap',function(){
          // 但是事件里面也有this 事件也有函数 只要有函数都会this this就是当前调用这个函数的对象
          // 因为事件函数是当前添加事件的元素调用的 this就是当前元素
          console.log(that); // 指的是letao对象
          console.log(this); // 指定是当前按钮对象
        //1.1获取搜索框的内容
        var search=$('.input-search').val();
        //1.2进行非空判断 搜索框的内容空白去掉 search.trim() 去除首尾空格  
        if(!search.trim()){
            alert('请输入内容');
            return false;
        }
        //1.3先判断本地储存中的值，如果有值，就在这个值的基础上添加，如果没有值，就添加一个空的数组来储存
        //1.3.1如果有数据，就使用JSON.parse把字符串转为js的数组，如果没有就使用后面的空数组，必须是字符串
        // 调用查询数据的函数
        that.getHistoryData();
        console.log(that.historyData);
        //1.4添加数据的时候要去重，避免添加同样的数据，indexOf检测，如果存在就返回当前值的索引，不存在就返回-1；
        if(that.historyData.indexOf(search)!=-1){
            //1.5如果返回索引表示存在，把当前索引值的删掉，splice(),第一个参数：要删除的索引 第二个参数：往后面删除几个
            that.historyData.splice(that.historyData.indexOf(search),1);
        }
        //1.6确保了去重，就开始追加数据，因为他是要最新的数据在前面  unshift() 方法可向数组的开头添加一个或更多元素，并返回新的长度。
        that.historyData.unshift(search);
        console.log(that.historyData);
        //1.7把数组储存到本地储存，设置值，只能使用字符串，把数组转为json字符串
        // 调用设置数据的函数
        that.setHistoryData();
        //1.8输入完把输入框清空
        $('.input-search').val('');
        // 1.9添加完就刷新列表
        that.queryHistory()
        
        //2.0添加完就跳转页面
        location='productlist.html?search='+search;
        })
        return this;
      },
        //2.点击删除历史记录
        deleteHistory:function(){
          var that = this; //把 this对象 赋值给 that 变量
        // 2.1给所有的x添加点击事件，因为是动态添加的，所以要用事件委托
        $('.search-history ul').on('tap','.btn-delete',function(){
            //2.2获取当前点击x按钮要删除的索引
            var index=$(this).data('index');
            //2.3获取本地储存的数组
           // 调用查询数据的函数
            that.getHistoryData();
            //2.4 splice删除该数值
            that.historyData.splice(index,1);
            //2.5删除完重新储存到本地
           // 调用设置数据的函数
           that.setHistoryData();
            //2.6重新渲染页面
            that.queryHistory()
            })
            return this;
        },
        //3.查询历史记录
        queryHistory:function(){
            var that = this; //把 this对象 赋值给 that 变量
            //1.获取本地储存的数组
            // 调用查询数据的函数
            that.getHistoryData();
            // 2.调用引擎模板的方法  因为调用引擎模板需要传入对象参数，数组并不是对象，所以要构造一个空的对象，把数组存进对象
            var html=template('historyListTpl',{list:that.historyData});
            //3.渲染到ul里面
            $('.search-history ul').html(html);
            return this;
        
        },
        //4.清空历史记录
        clearHistory:function(){
            var that = this; //把 this对象 赋值给 that 变量
            //3.清空所有记录
            $('.btn-clear').on('tap',function(){
            // 3.1获取本地存储清空 删除当前的historyData这个键 不要使用clear把所有本地存储记录都清空
             localStorage.removeItem(that.key);
             // 3.2 重新调用查询刷新页面
             that.queryHistory()
        })
        return this;
        },
        
        // 获取本地存储的 历史记录数据
        getHistoryData: function() {
        var that = this;
        // 把从本地存储取值的代码封装成一个函数 大家可以重复使用获取值的代码
        that.historyData = JSON.parse(localStorage.getItem(that.key) || '[]');
        },
        // 设置本地存储的 历史记录数据
        setHistoryData: function() {
            var that = this;
            localStorage.setItem(that.key, JSON.stringify(that.historyData));
        }
      
    
    
    
}




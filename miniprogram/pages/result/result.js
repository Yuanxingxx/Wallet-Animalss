var content=require('../../data/content');
var calculateResult=require('../../utils/score').calculateResult;
Page({
  data:{result:null,info:null,missing:false,busy:false,error:''},
  onLoad:function(){
    try{
      var result=calculateResult(getApp().globalData.answers);
      getApp().globalData.result=result;
      this.setData({result:result,info:content.results[result.primaryType],missing:false});
    }catch(error){this.setData({missing:true});}
  },
  restart:function(){
    if(this.data.busy)return;
    getApp().resetQuiz();this.setData({busy:true,error:''});
    var self=this;
    xhs.redirectTo({url:'/pages/quiz/quiz',fail:function(){self.setData({busy:false,error:'暂时没能打开问卷，请再试一次。'});}});
  }
});
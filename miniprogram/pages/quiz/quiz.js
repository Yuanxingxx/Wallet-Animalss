var content = require('../../data/content');
var calculateResult = require('../../utils/score').calculateResult;
Page({
  data:{index:0,number:1,question:null,selected:'',progress:12.5,busy:false,error:''},
  onLoad:function(){
    var app=getApp();
    if(!Array.isArray(app.globalData.answers) || app.globalData.answers.length!==8)app.resetQuiz();
    this.renderQuestion(0);
  },
  renderQuestion:function(index){
    this.setData({index:index,number:index+1,question:content.questions[index],selected:getApp().globalData.answers[index] || '',progress:(index+1)*12.5,error:'',busy:false});
  },
  choose:function(event){
    if(this.data.busy)return;
    var key=event.currentTarget.dataset.key;
    if(['A','B','C','D'].indexOf(key)<0)return;
    getApp().globalData.answers[this.data.index]=key;
    this.setData({selected:key,error:''});
  },
  previous:function(){if(!this.data.busy && this.data.index>0)this.renderQuestion(this.data.index-1);},
  next:function(){
    if(this.data.busy)return;
    if(!this.data.selected){this.setData({error:'请先选择最接近自己的一项。'});return;}
    if(this.data.index<7){this.renderQuestion(this.data.index+1);return;}
    var app=getApp();
    try {app.globalData.result=calculateResult(app.globalData.answers);}
    catch(error){this.setData({error:error.message});return;}
    this.setData({busy:true,error:''});
    var self=this;
    xhs.redirectTo({url:'/pages/result/result',fail:function(){self.setData({busy:false,error:'结果页暂时没能打开，请再点一次。'});}});
  }
});
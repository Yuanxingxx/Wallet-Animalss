Page({
  data: { busy:false, error:'', showPrivacy:false, animals: [
    {emoji:'🐰',name:'悦己兔兔',tone:'pink'}, {emoji:'🐿️',name:'精打细算松鼠',tone:'green'},
    {emoji:'🐱',name:'品质慢选猫',tone:'blue'}, {emoji:'🦊',name:'灵感探索狐',tone:'yellow'}
  ]},
  onShow: function(){ this.setData({busy:false,error:''}); },
  togglePrivacy: function(){this.setData({showPrivacy:!this.data.showPrivacy});},
  start: function(){
    if(this.data.busy)return;
    getApp().resetQuiz();
    this.setData({busy:true,error:''});
    var self=this;
    xhs.navigateTo({url:'/pages/quiz/quiz',fail:function(){self.setData({busy:false,error:'暂时没能打开问卷，请再试一次。'});}});
  }
});
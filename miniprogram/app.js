App({
  globalData: { answers: null, result: null },
  resetQuiz: function () {
    this.globalData.answers = [null,null,null,null,null,null,null,null];
    this.globalData.result = null;
  }
});

(function(root,factory){if(typeof module!=="undefined" && module.exports){module.exports=factory();}else{root.WalletScore=factory();}})(this,function(){
const TYPE_BY_OPTION = Object.freeze({
  A: 'joy',
  B: 'value',
  C: 'quality',
  D: 'explore'
});

const TYPE_NAMES = Object.freeze({
  joy: '悦己兔兔',
  value: '精打细算松鼠',
  quality: '品质慢选猫',
  explore: '灵感探索狐'
});

function calculateResult(answers) {
  // 使用显式循环，也拒绝带空槽的稀疏数组。
  if (!Array.isArray(answers) || answers.length !== 8) {
    throw new Error('请完成全部 8 道题后再查看结果');
  }
  const scores = { joy: 0, value: 0, quality: 0, explore: 0 };
  for (let i = 0; i < 8; i += 1) {
    const option = answers[i];
    if (!Object.prototype.hasOwnProperty.call(TYPE_BY_OPTION, option)) {
      throw new Error(`第 ${i + 1} 题尚未有效作答`);
    }
    scores[TYPE_BY_OPTION[option]] += 1;
  }

  const maxScore = Math.max(...Object.values(scores));
  const tiedTypes = Object.keys(scores).filter(
    type => scores[type] === maxScore
  );
  let primaryType = tiedTypes[0];
  if (tiedTypes.length > 1) {
    for (let i = answers.length - 1; i >= 0; i -= 1) {
      const type = TYPE_BY_OPTION[answers[i]];
      if (tiedTypes.includes(type)) {
        primaryType = type;
        break;
      }
    }
  }

  const isTie = tiedTypes.length > 1;
  const tieNote = isTie
    ? `你同时带有${tiedTypes.map(type => `「${TYPE_NAMES[type]}」`).join('、')}` +
      `的倾向。本次按靠后题目的选择展示「${TYPE_NAMES[primaryType]}」，` +
      '仅作趣味区分。'
    : '';

  return {
    primaryType,
    primaryName: TYPE_NAMES[primaryType],
    scores,
    maxScore,
    isTie,
    tiedTypes: tiedTypes.slice(),
    tieNote
  };
}

return { calculateResult };

});

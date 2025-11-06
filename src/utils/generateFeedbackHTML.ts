export function generateFeedbackParts(result: any) {
  let summary = "";
  let scoreBreakdown = "";
  let improvementTips = "";

  // 종합 평가
  if (result.finalScore === 100) {
    summary += `<div class="feedback-perfect">🌟 <span>완벽합니다!</span></div>`;
    summary += `<p>모든 발음과 입모양이 정확합니다. 정말 훌륭해요!</p>`;
  } else if (result.finalScore >= 90) {
    summary += `<div class="feedback-excellent">🎉 <span>훌륭합니다!</span></div>`;
    summary += `<p>거의 완벽에 가까워요. 아주 잘하셨어요!</p>`;
  } else if (result.finalScore >= 70) {
    summary += `<div class="feedback-good">👍 <span>잘하셨습니다!</span></div>`;
    summary += `<p>대부분 정확하지만 몇 가지 개선할 부분이 있습니다.</p>`;
  } else if (result.finalScore >= 50) {
    summary += `<div class="feedback-fair">💪 <span>좋은 시도입니다!</span></div>`;
    summary += `<p>더 연습이 필요합니다. 아래 피드백을 참고하세요.</p>`;
  } else {
    summary += `<div class="feedback-poor">📚 <span>더 연습해봅시다!</span></div>`;
    summary += `<p>천천히 따라하면서 입모양에 집중해보세요.</p>`;
  }

  // 세부 점수
  scoreBreakdown += `<div class="score-breakdown">
    <div class="score-item">
      <span class="score-label">음성 정확도</span>
      <div class="score-bar">
        <div class="score-fill" style="width: ${result.speechScore}%"></div>
      </div>
      <span class="score-value">${result.speechScore}%</span>
    </div>
    <div class="score-item">
      <span class="score-label">입모양 정확도</span>
      <div class="score-bar">
        <div class="score-fill" style="width: ${Math.round(
          result.lipSyncScore
        )}%"></div>
      </div>
      <span class="score-value">${Math.round(result.lipSyncScore)}%</span>
    </div>
  </div>`;

  // 개선 사항
  const errors = result.detailedAnalysis.errors;
  if (errors.length > 0) {
    improvementTips += `<div class="improvement-tips"><h4>개선이 필요한 부분:</h4><ul>`;
    const topErrors = errors
      .filter((e) => e.severity === "high" && e.phoneme?.trim())
      .slice(0, 3);
    const mediumErrors = errors
      .filter((e) => e.severity === "medium" && e.phoneme?.trim())
      .slice(0, 3);
    const displayErrors = topErrors.length > 0 ? topErrors : mediumErrors;

    if (displayErrors.length > 0) {
      for (const error of displayErrors) {
        improvementTips += `<li><strong>"${error.phoneme}"</strong> 발음 시: ${error.errorType}</li>`;
      }
    } else {
      improvementTips += `<li>전반적으로 입모양을 더 정확하게 해주세요.</li>`;
    }

    improvementTips += `</ul></div>`;
  }

  return { summary, scoreBreakdown, improvementTips };
}

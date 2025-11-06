import "./Result.style.css";
import { usePracticeStore } from "../../../../store/usePracticeStore";
import { generateFeedbackParts } from "../../../../utils/generateFeedbackHTML";

const Result = () => {
  const { speechResult, analysisResult, currentSentence } = usePracticeStore();
  console.log("result", analysisResult);

  if (!analysisResult) {
    return (
      <div className="analysis-placeholder">
        <div>녹화를 완료하면</div>
        <div>분석 결과가 여기에 표시됩니다.</div>
      </div>
    );
  }

  const { summary, scoreBreakdown, improvementTips } =
    generateFeedbackParts(analysisResult);
  console.log("analysisResult", analysisResult);

  console.log("🧠 종합 평가:", summary);
  console.log("📊 점수 바:", scoreBreakdown);
  console.log("🛠️ 개선 사항:", improvementTips);

  const averageScore = Math.round(
    (analysisResult.speechScore + analysisResult.lipSyncScore) / 2
  );

  return (
    <div>
      <div id="analysisResult" className="analysis-result">
        <h1>분석 결과</h1>
        <div className="result-content">
          <div className="result-details">
            <div className="detail-item">
              <h4>원본 문장</h4>
              <p id="originalText">{currentSentence}</p>
            </div>
            <div className="detail-item">
              <h4>인식된 문장</h4>
              <p id="recognizedText">{speechResult}</p>
            </div>
            <div className="detail-item">
              <div dangerouslySetInnerHTML={{ __html: scoreBreakdown }} />
            </div>
            <div className="detail-item">
              <h4>종합 피드백</h4>
              <div dangerouslySetInnerHTML={{ __html: summary }} />
              <div dangerouslySetInnerHTML={{ __html: improvementTips }} />
            </div>
          </div>
          <div className="accuracy-score">
            <div className="score-circle">
              <span id="accuracyScore">{averageScore}</span>%
            </div>
            <p>종합 정확도</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;

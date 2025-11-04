import "./Main.style.css";
import { useNavigate } from "react-router-dom";

const Main: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/practice");
  };

  return (
    <div>
      {/* <!-- Main Screen --> */}
      <div id="mainScreen" className="screen active">
        <div className="container">
          <h1 className="logo">AI Speak!</h1>
          <p className="subtitle">AI 기반 언어 발음 연습 서비스</p>
          <button className="btn-primary" id="startBtn" onClick={handleStart}>
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Main;

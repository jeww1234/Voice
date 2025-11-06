import "./Recording.style.css";
import { usePracticeStore } from "../../../../store/usePracticeStore";
import { useEffect, useRef, useState } from "react";
import { LipSyncAnalyzer } from "../../../../utils/LipSyncAnalyzer";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: any) => void;
    onend: () => void;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }
}

const Recording = () => {
  const lipSyncAnalyzer = useRef(new LipSyncAnalyzer()).current;

  const {
    setAnalysisResult,
    speechResult,
    currentSentence,
    isRecording,
    setRecording,
    addChunk,
    recordedChunks,
    setSpeechResult,
    setRecordedChunks,
  } = usePracticeStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recordBtnRef = useRef<HTMLButtonElement>(null);
  const stopBtnRef = useRef<HTMLButtonElement>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [lipDetected, setLipDetected] = useState(false);
  const [lipLandmarksHistory, setLipLandmarksHistory] = useState<any[]>([]); // 입술 랜드마크 히스토리 상태 정의

  // 음성 인식 상태 추가
  const [isSpeechRecording, setIsSpeechRecording] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null); // 음성 인식 객체를 ref로 저장

  // 카메라 초기화
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (error) {
      console.error("Camera access error:", error);
      alert("카메라 접근 권한이 필요합니다.");
    }
  };

  // FaceMesh 초기화
  const initializeFaceMesh = async () => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement?.getContext("2d");

    if (!videoElement || !canvasElement || !canvasCtx) return;

    canvasElement.width = 640;
    canvasElement.height = 480;

    const faceMesh = new (window as any).FaceMesh({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    const captureLipData = (landmarks: any) => {
      const upperLip = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291];
      const lowerLip = [146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

      // 입술 좌표 추출
      const lipCoords = [...upperLip, ...lowerLip].map((index) => {
        const landmark = landmarks[index]; // 인덱스에 해당하는 랜드마크
        // landmark가 유효한지 체크하고, 유효하지 않으면 경고 메시지 출력
        if (
          landmark &&
          typeof landmark.x === "number" &&
          typeof landmark.y === "number"
        ) {
          return {
            x: landmark.x * 640, // 화면 너비에 맞게 좌표 비율 조정
            y: landmark.y * 480, // 화면 높이에 맞게 좌표 비율 조정
          };
        } else {
          // 잘못된 인덱스나 랜드마크가 없으면 기본값 (0, 0)으로 처리
          console.warn(`잘못된 랜드마크 인덱스: ${index} 또는 값이 비어있음`);
          return { x: 0, y: 0 };
        }
      });

      // lipLandmarksHistory 배열에 좌표 추가
      setLipLandmarksHistory((prevHistory) => [...prevHistory, lipCoords]);
    };

    //입술 추적
    faceMesh.onResults((results: any) => {
      // 캔버스를 초기화
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0]; // 첫 번째 얼굴의 랜드마크

        // 입술 랜드마크 그리기
        drawLipLandmarks(canvasCtx, landmarks);
        // 입술 좌표를 저장 함수 호출
        captureLipData(landmarks);
        lipSyncAnalyzer.captureLipData(landmarks, "ko");

        setLipDetected(true); // 입술이 인식된 상태로 설정
      } else {
        setLipDetected(false); // 입술이 인식되지 않으면 false
      }
    });

    const extractLipLandmarks = (landmarks: any) => {
      // 상입술, 하입술 랜드마크 인덱스
      const upperLip = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291]; // 상입술 인덱스
      const lowerLip = [146, 91, 181, 84, 17, 314, 405, 321, 375, 291]; // 하입술 인덱스

      // 입술 랜드마크 좌표 추출
      const lipCoords = [...upperLip, ...lowerLip].map((index) => {
        return {
          x: landmarks[index].x * 640, // 화면 너비에 맞게 비율 조정
          y: landmarks[index].y * 480, // 화면 높이에 맞게 비율 조정
        };
      });

      return lipCoords; // 입술 좌표 반환
    };

    const camera = new (window as any).Camera(videoElement, {
      onFrame: async () => {
        await faceMesh.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });
    camera.start();
  };

  // 입술 랜드마크 그리기
  const drawLipLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any) => {
    const upperLip = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291]; // 상입술 인덱스
    const lowerLip = [146, 91, 181, 84, 17, 314, 405, 321, 375, 291]; // 하입술 인덱스

    // 상입술 그리기
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    upperLip.forEach((index, i) => {
      const x = landmarks[index].x * 640;
      const y = landmarks[index].y * 480;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.stroke();

    // 하입술 그리기
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    lowerLip.forEach((index, i) => {
      const x = landmarks[index].x * 640;
      const y = landmarks[index].y * 480;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.stroke();
  };

  // 카메라 & FaceMesh 초기화 useEffect
  useEffect(() => {
    initializeCamera();
    initializeFaceMesh();
  }, []);

  // 음성 인식 초기화 (한 번만)
  const initializeSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true; // interimResults를 true로 설정하면 실시간으로 음성 결과가 표시됩니다.

      recognition.onresult = (event: any) => {
        const transcript =
          event.results[event.results.length - 1][0].transcript;
        setSpeechResult(transcript); // 음성 인식 결과 업데이트
      };

      recognition.onerror = (event: any) => {
        console.error("SpeechRecognition error", event.error);
      };

      recognition.onend = () => {
        setIsSpeechRecording(false); // 음성 인식이 끝나면 자동으로 상태 변경
      };

      recognitionRef.current = recognition; // 음성 인식 객체를 ref로 저장
    } else {
      alert("Speech Recognition API를 지원하지 않는 브라우저입니다.");
    }
  };
  
  
  const startRecording = () => {
    if (!streamRef.current || !recordBtnRef.current || !stopBtnRef.current)
      return;

    setSpeechResult("");
    setRecordedChunks([]);

    // 버튼 상태
    recordBtnRef.current.disabled = true;
    stopBtnRef.current.disabled = false;
    recordBtnRef.current.classList.add("recording");

    setRecording(true);

    // 🎥 영상 녹화 시작
    const recorder = new MediaRecorder(streamRef.current);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) addChunk(event.data);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;

    // 🎤 음성 인식 시작
    startSpeechRecognition();
  };

  const stopRecording = () => {
    console.log("stop");
    if (!recordBtnRef.current || !stopBtnRef.current) return;

    // 버튼 상태
    recordBtnRef.current.classList.remove("recording");
    recordBtnRef.current.disabled = false;
    stopBtnRef.current.disabled = true;

    setRecording(false);

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.onstop = async () => {
        if (speechResult && speechResult.trim().length > 0) {
          const result = await lipSyncAnalyzer.analyzeLipSync(
            currentSentence,
            speechResult,
            "ko"
          );
          console.log("최종 점수:", result.finalScore);
          console.log("상세 분석:", result.detailedAnalysis);
          setAnalysisResult(result);
        } else {
          console.warn("⚠️ 음성 인식 결과가 비어 있음. 분석 생략됨.");
        }
      };
      mediaRecorderRef.current.stop();
    }
    stopSpeechRecognition();
  };

  // 음성 인식 시작
  const startSpeechRecognition = () => {
    if (!recognitionRef.current) {
      initializeSpeechRecognition();
    }
    recognitionRef.current?.start(); // 음성 인식 시작
    setIsSpeechRecording(true);
  };

  // 음성 인식 중지
  const stopSpeechRecognition = () => {
    recognitionRef.current?.stop(); // 음성 인식 중지
  };

  const blob = new Blob(recordedChunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);
  return (
    <div className="">
      <div className="practice-header">
        <h2>발음 연습</h2>
      </div>

      <div className="sentence-display">
        <h3>
          연습할 문장 : <span id="targetSentence">{currentSentence}</span>
        </h3>
      </div>
      <div className="video-container">
        <video id="videoElement" ref={videoRef} autoPlay playsInline></video>
        <canvas id="lipCanvas" ref={canvasRef}></canvas>
        <div
          id="lipIndicator"
          className="lip-indicator"
          style={{
            backgroundColor: lipDetected
              ? "rgba(46, 204, 113, 0.9)" // 초록색 (입술 인식됨)
              : "rgba(102, 126, 234, 0.9)", // 파란색 (인식 중)
          }}
        >
          {lipDetected ? "✓ 입술 인식됨" : "입술 인식 중..."}
        </div>
      </div>

      <div className="control-buttons">
        <button
          className="btn-control"
          id="recordBtn"
          ref={recordBtnRef}
          onClick={startRecording}
        >
          <span className="icon">
            🎙️<span>녹화 시작</span>
          </span>
        </button>
        <button
          className="btn-control"
          id="stopBtn"
          ref={stopBtnRef}
          onClick={stopRecording}
        >
          <span className="icon">
            🟥<span>녹화 중지</span>
          </span>
        </button>
        <label className="btn-control" htmlFor="fileInput">
          <span className="icon">
            📁<span>파일 업로드</span>
          </span>
        </label>
        <input
          type="file"
          id="fileInput"
          accept="video/*"
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

export default Recording;

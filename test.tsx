import "./Recording.style.css";
import { usePracticeStore } from "../../../../store/usePracticeStore";
import { useEffect, useRef, useState } from "react";

const Recording = () => {
  const {
    currentSentence,
    isRecording,
    setRecording,
    addChunk,
    recordedChunks,
  } = usePracticeStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recordBtnRef = useRef<HTMLButtonElement>(null);
  const stopBtnRef = useRef<HTMLButtonElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [lipDetected, setLipDetected] = useState(false);

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

    faceMesh.onResults((results: any) => {
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        drawLipLandmarks(canvasCtx, landmarks);
        setLipDetected(true);
      } else {
        setLipDetected(false);
      }
    });

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

  // 녹화 시작
  const startRecording = () => {
    if (!streamRef.current || !recordBtnRef.current || !stopBtnRef.current)
      return;

    recordBtnRef.current.disabled = true;
    stopBtnRef.current.disabled = false;
    recordBtnRef.current.classList.add("recording");

    setRecording(true);
    const recorder = new MediaRecorder(streamRef.current);
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        addChunk(event.data);
      }
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
  };

  // 녹화 중지
  const stopRecording = () => {
    if (!recordBtnRef.current || !stopBtnRef.current) return;

    recordBtnRef.current.disabled = false;
    stopBtnRef.current.disabled = true;
    recordBtnRef.current.classList.remove("recording");

    setRecording(false);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
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
          <span className="icon">🎙️</span>
          <span>녹화 시작</span>
        </button>
        <button
          className="btn-control"
          id="stopBtn"
          ref={stopBtnRef}
          onClick={stopRecording}
          disabled
        >
          <span className="icon">🟥</span>
          <span>녹화 중지</span>
        </button>
        <label className="btn-control" htmlFor="fileInput">
          <span className="icon">📁</span>
          <span>파일 업로드</span>
        </label>
        <input
          type="file"
          id="fileInput"
          accept="video/*"
          style={{ display: "none" }}
        />
      </div>

      {!isRecording && recordedChunks.length > 0 && (
        <div className="preview-container">
          <h4>녹화된 영상 미리보기</h4>
          <video src={url} controls width="100%" />
          <a href={url} download="recording.webm" className="btn-secondary">
            영상 다운로드
          </a>
        </div>
      )}
    </div>
  );
};

export default Recording;

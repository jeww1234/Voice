import "./App.css";
import Main from "./page/Main/Main";
import Practice from "./page/Practice/Practice";
import Result from "./page/Result/Result";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div id="app">
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </div>
  );
}

export default App;

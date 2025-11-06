import Recording from "./component/Recording/Recording"
import Result from "./component/Result/Result"
import SelectOptions from "./component/SelectOptions/SelectOptions"
import "./Practice.style.css"

const Practice = () => {
  return (
    <div className="Practice">
      <div className="option-area">
        <SelectOptions />
      </div>
      <div className="recorder-area">
        <Recording />
      </div>
      <div className="result-area">
        <Result />
      </div>
    </div>
  )
}

export default Practice

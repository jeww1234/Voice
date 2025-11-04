import Recording from "./component/Recording/Recording"
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
    </div>
  )
}

export default Practice

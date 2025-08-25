import {useEffect, useRef} from "react";
import GuessCardTimeLine from "./GuessCardTimeLine.jsx";


function GuessCardTimeLineGhost(props){

    const timerRef = useRef(null);

    useEffect(() => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (props.reset) {
          props.reset(props.title);
        }
      }, 1800);
    return () => clearTimeout(timerRef.current); // cleanup
  }, []);

    return (
        <div className="guess-card-timeline-ghost"
             style={{
            position: "absolute",
            left: props.position[0],
            top: props.position[1],
                 zIndex : 999999
        }}
        >
            <GuessCardTimeLine
                {...props}
                wrongAnswer={true}
            />
        </div>
    )
}

export default GuessCardTimeLineGhost
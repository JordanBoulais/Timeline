import "../css/TimeLine.css"
import React from "react";
import TimeLineRow from "./TimeLineRow.jsx";

function TimeLine({rows, rowCount}){

    let timelinescale = 1 - (rowCount - 1) * 0.025;
    let translateY = 15 + (rowCount - 1) * 6;

        return (
        <div className="timeline"
        style={{ transform: `translateY(${translateY}vh) scale(${timelinescale})` }}
        >

            {rows.map((row, rowIndex) => (
                <TimeLineRow
                    key={rowIndex}
                    startIndex={rowIndex}
                    cards={row}
                />
            ))}
        </div>
    );
}

export default TimeLine;
import React, { useEffect, useState } from "react";
import PivotTableUI from "react-pivottable/PivotTableUI";
import "react-pivottable/pivottable.css";

export default function PivotTable(props) {
    const [pivotState, setPivotState] = useState({
        data: Array.isArray(props.data) ? props.data : [],
        rows: Array.isArray(props.rows) ? props.rows : [],
        cols: Array.isArray(props.cols) ? props.cols : [],
        vals: Array.isArray(props.vals) ? props.vals : [],
        aggregatorName: props.aggregatorName || "Count",
        rendererName: props.rendererName || "Table"
    });

    useEffect(() => {
        setPivotState((currentState) => ({
            ...currentState,
            data: Array.isArray(props.data) ? props.data : [],
            rows: Array.isArray(props.rows) ? props.rows : [],
            cols: Array.isArray(props.cols) ? props.cols : [],
            vals: Array.isArray(props.vals) ? props.vals : [],
            aggregatorName: props.aggregatorName || "Count",
            rendererName: props.rendererName || "Table"
        }));
    }, [
        props.data,
        props.rows,
        props.cols,
        props.vals,
        props.aggregatorName,
        props.rendererName
    ]);

    return (
        <div id={props.id}>
            <PivotTableUI
                {...pivotState}
                onChange={(state) => setPivotState(state)}
            />
        </div>
    );
}
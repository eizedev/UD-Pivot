import React, { useEffect, useState } from "react";
import PivotTableUI from "react-pivottable/PivotTableUI";
import TableRenderers from "react-pivottable/TableRenderers";
import "react-pivottable/pivottable.css";

/*
 * PivotTable component wrapper for PowerShell Universal.
 *
 * This component receives its configuration from PowerShell props
 * and keeps the interactive pivot state locally in React state.
 *
 * The local state is required because PivotTableUI is a "dumb" component
 * that expects the current state to be passed back into it on every change.
 */
export default function PivotTable(props) {
    /*
     * Initialize the local pivot state with safe defaults.
     *
     * Several react-pivottable UI paths expect objects or arrays to exist.
     * Providing defaults here prevents runtime errors when optional props
     * are not supplied from PowerShell.
     *
     * TableRenderers are assigned explicitly to avoid relying on implicit
     * library defaults during PSU prop roundtrips and state updates.
     */
    const [pivotState, setPivotState] = useState({
        data: Array.isArray(props.data) ? props.data : [],
        rows: Array.isArray(props.rows) ? props.rows : [],
        cols: Array.isArray(props.cols) ? props.cols : [],
        vals: Array.isArray(props.vals) ? props.vals : [],
        aggregatorName: props.aggregatorName || "Count",
        rendererName: props.rendererName || "Table",
        renderers: props.renderers || TableRenderers,
        valueFilter: props.valueFilter || {},
        hiddenAttributes: Array.isArray(props.hiddenAttributes) ? props.hiddenAttributes : [],
        hiddenFromAggregators: Array.isArray(props.hiddenFromAggregators) ? props.hiddenFromAggregators : [],
        hiddenFromDragDrop: Array.isArray(props.hiddenFromDragDrop) ? props.hiddenFromDragDrop : [],
        rowOrder: props.rowOrder || "key_a_to_z",
        colOrder: props.colOrder || "key_a_to_z",
        menuLimit: Number.isInteger(props.menuLimit) ? props.menuLimit : 500,
        unusedOrientationCutoff: Number.isInteger(props.unusedOrientationCutoff) ? props.unusedOrientationCutoff : 85
    });

    /*
     * Synchronize incoming PowerShell props with the local React state.
     *
     * This keeps the component responsive to updated server-side props
     * while preserving client-side UI state managed by PivotTableUI.
     *
     * Existing state is preserved first and then selectively overwritten
     * with normalized incoming values.
     */
    useEffect(() => {
        setPivotState((currentState) => ({
            ...currentState,
            data: Array.isArray(props.data) ? props.data : [],
            rows: Array.isArray(props.rows) ? props.rows : [],
            cols: Array.isArray(props.cols) ? props.cols : [],
            vals: Array.isArray(props.vals) ? props.vals : [],
            aggregatorName: props.aggregatorName || "Count",
            rendererName: props.rendererName || "Table",
            renderers: props.renderers || currentState.renderers || TableRenderers,
            valueFilter: props.valueFilter || currentState.valueFilter || {},
            hiddenAttributes: Array.isArray(props.hiddenAttributes) ? props.hiddenAttributes : [],
            hiddenFromAggregators: Array.isArray(props.hiddenFromAggregators) ? props.hiddenFromAggregators : [],
            hiddenFromDragDrop: Array.isArray(props.hiddenFromDragDrop) ? props.hiddenFromDragDrop : [],
            rowOrder: props.rowOrder || "key_a_to_z",
            colOrder: props.colOrder || "key_a_to_z",
            menuLimit: Number.isInteger(props.menuLimit) ? props.menuLimit : 500,
            unusedOrientationCutoff: Number.isInteger(props.unusedOrientationCutoff) ? props.unusedOrientationCutoff : 85
        }));
    }, [
        props.data,
        props.rows,
        props.cols,
        props.vals,
        props.aggregatorName,
        props.rendererName,
        props.renderers,
        props.valueFilter,
        props.hiddenAttributes,
        props.hiddenFromAggregators,
        props.hiddenFromDragDrop,
        props.rowOrder,
        props.colOrder,
        props.menuLimit,
        props.unusedOrientationCutoff
    ]);

    /*
     * Render the PivotTableUI component.
     *
     * The current pivot state is passed into the component and every UI change
     * is written back to local state so the drag-and-drop experience remains interactive.
     */
    return (
        <div id={props.id}>
            <PivotTableUI
                {...pivotState}
                onChange={(state) => setPivotState(state)}
            />
        </div>
    );
}
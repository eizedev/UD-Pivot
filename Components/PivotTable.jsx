import React, { useEffect, useMemo, useState } from "react";
import PivotTableUI from "react-pivottable/PivotTableUI";
import TableRenderers from "react-pivottable/TableRenderers";
import createPlotlyRenderers from "react-pivottable/PlotlyRenderers";
import Plot from "react-plotly.js";
import "react-pivottable/pivottable.css";

/*
 * Combine default table renderers with Plotly-based renderers.
 *
 * This enables additional visualizations such as bar charts, line charts,
 * pie charts and other Plotly-based renderers on top of the default table output.
 */
const PlotlyRenderers = createPlotlyRenderers(Plot);
const DefaultRenderers = Object.assign({}, TableRenderers, PlotlyRenderers);

/*
 * Normalize arrays that should contain attribute names.
 */
function normalizeStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((item) => item !== null && item !== undefined)
        .map((item) => String(item));
}

/*
 * Build a lookup from lower-case attribute names to the real attribute names
 * found in the dataset.
 */
function buildAttributeMap(data) {
    const attributeMap = {};

    if (!Array.isArray(data)) {
        return attributeMap;
    }

    data.forEach((row) => {
        if (!row || typeof row !== "object" || Array.isArray(row)) {
            return;
        }

        Object.keys(row).forEach((key) => {
            const lowerKey = String(key).toLowerCase();

            if (!attributeMap[lowerKey]) {
                attributeMap[lowerKey] = String(key);
            }
        });
    });

    return attributeMap;
}

/*
 * Resolve attribute names against the actual dataset keys.
 *
 * This allows PowerShell presets such as "Team" or "Status" to map correctly
 * to serialized data keys such as "team" or "status".
 */
function resolveAttributeNames(values, attributeMap) {
    return normalizeStringArray(values).map((value) => {
        const mappedValue = attributeMap[String(value).toLowerCase()];
        return mappedValue || String(value);
    });
}

/*
 * Normalize the value filter object and resolve its keys against the actual dataset keys.
 */
function normalizeValueFilter(value, attributeMap) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }

    const normalizedFilter = {};

    Object.keys(value).forEach((attributeName) => {
        const attributeFilter = value[attributeName];

        if (!attributeFilter || typeof attributeFilter !== "object" || Array.isArray(attributeFilter)) {
            return;
        }

        const resolvedAttributeName = attributeMap[String(attributeName).toLowerCase()] || String(attributeName);

        normalizedFilter[resolvedAttributeName] = {};

        Object.keys(attributeFilter).forEach((attributeValue) => {
            normalizedFilter[resolvedAttributeName][String(attributeValue)] = Boolean(attributeFilter[attributeValue]);
        });
    });

    return normalizedFilter;
}

export default function PivotTable(props) {
    /*
     * Normalize stable input properties.
     */
    const safeData = Array.isArray(props.data) ? props.data : [];
    const safeRenderers = props.renderers || DefaultRenderers;
    const safeMenuLimit = Number.isInteger(props.menuLimit) ? props.menuLimit : 500;
    const safeUnusedOrientationCutoff = Number.isInteger(props.unusedOrientationCutoff) ? props.unusedOrientationCutoff : 85;

    /*
     * Build a case-insensitive attribute lookup based on the incoming dataset.
     */
    const attributeMap = useMemo(() => buildAttributeMap(safeData), [safeData]);

    /*
     * Resolve attribute-based props against the actual dataset keys.
     */
    const safeHiddenAttributes = useMemo(
        () => resolveAttributeNames(props.hiddenAttributes, attributeMap),
        [props.hiddenAttributes, attributeMap]
    );

    const safeHiddenFromAggregators = useMemo(
        () => resolveAttributeNames(props.hiddenFromAggregators, attributeMap),
        [props.hiddenFromAggregators, attributeMap]
    );

    const safeHiddenFromDragDrop = useMemo(
        () => resolveAttributeNames(props.hiddenFromDragDrop, attributeMap),
        [props.hiddenFromDragDrop, attributeMap]
    );

    /*
     * Normalize preset state using the actual dataset keys.
     */
    const normalizedPresetState = useMemo(() => ({
        rows: resolveAttributeNames(props.rows, attributeMap),
        cols: resolveAttributeNames(props.cols, attributeMap),
        vals: resolveAttributeNames(props.vals, attributeMap),
        aggregatorName: props.aggregatorName ? String(props.aggregatorName) : "Count",
        rendererName: props.rendererName ? String(props.rendererName) : "Table",
        valueFilter: normalizeValueFilter(props.valueFilter, attributeMap),
        rowOrder: props.rowOrder ? String(props.rowOrder) : "key_a_to_z",
        colOrder: props.colOrder ? String(props.colOrder) : "key_a_to_z"
    }), [
        props.rows,
        props.cols,
        props.vals,
        props.aggregatorName,
        props.rendererName,
        props.valueFilter,
        props.rowOrder,
        props.colOrder,
        attributeMap
    ]);

    /*
     * Keep the interactive pivot state locally.
     */
    const [pivotState, setPivotState] = useState(normalizedPresetState);

    /*
     * Reset the local state whenever a new preset arrives from PowerShell.
     */
    useEffect(() => {
        setPivotState(normalizedPresetState);
    }, [normalizedPresetState]);

    /*
     * Render PivotTableUI.
     */
    console.log("[UDPivot] props", props);
    console.log("[UDPivot] pivotState", pivotState);
    return (
        <div id={props.id}>
            <PivotTableUI
                data={safeData}
                renderers={safeRenderers}
                hiddenAttributes={safeHiddenAttributes}
                hiddenFromAggregators={safeHiddenFromAggregators}
                hiddenFromDragDrop={safeHiddenFromDragDrop}
                menuLimit={safeMenuLimit}
                unusedOrientationCutoff={safeUnusedOrientationCutoff}
                {...pivotState}
                onChange={(state) => {
                    console.log("[UDPivot] onChange", state);
                    if (state && typeof state === "object") {
                        setPivotState((currentState) => ({
                            ...currentState,
                            ...state,
                            rows: resolveAttributeNames(state.rows, attributeMap),
                            cols: resolveAttributeNames(state.cols, attributeMap),
                            vals: resolveAttributeNames(state.vals, attributeMap),
                            aggregatorName: state.aggregatorName ? String(state.aggregatorName) : currentState.aggregatorName,
                            rendererName: state.rendererName ? String(state.rendererName) : currentState.rendererName,
                            valueFilter: normalizeValueFilter(state.valueFilter, attributeMap),
                            rowOrder: state.rowOrder ? String(state.rowOrder) : currentState.rowOrder,
                            colOrder: state.colOrder ? String(state.colOrder) : currentState.colOrder
                        }));
                    }
                }}
            />
        </div>
    );
}
import React, { useEffect, useMemo, useState } from "react";
import PivotTableUI from "react-pivottable/PivotTableUI";
import TableRenderers from "react-pivottable/TableRenderers";
import createPlotlyRenderers from "react-pivottable/PlotlyRenderers";
import Plot from "react-plotly.js";
import "react-pivottable/pivottable.css";

/*
 * Combine default table renderers with Plotly-based renderers.
 *
 * This keeps the standard table-based output available while also enabling
 * the additional Plotly chart renderers in the renderer dropdown.
 */
const PlotlyRenderers = createPlotlyRenderers(Plot);
const DefaultRenderers = Object.assign({}, TableRenderers, PlotlyRenderers);

/*
 * Normalize arrays that should contain attribute names.
 *
 * PowerShell input may contain null values, duplicates or values that are not
 * plain JavaScript strings. PivotTableUI compares attribute names directly,
 * therefore this normalization ensures stable and predictable matching.
 */
function normalizeStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return [...new Set(
        value
            .filter((item) => item !== null && item !== undefined)
            .map((item) => String(item))
    )];
}

/*
 * Build a case-insensitive lookup from dataset keys to their actual names.
 *
 * PowerShell presets may use attribute names with different casing than the
 * serialized dataset. This lookup allows preset values such as "Team" to map
 * correctly to data keys such as "team".
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
 * Build a case-insensitive lookup of attribute values based on the dataset.
 *
 * ValueFilter must match the actual string values used in the dataset.
 * This lookup allows PowerShell filters such as "open" to resolve to "Open"
 * when the dataset contains capitalized values.
 */
function buildAttributeValueMap(data) {
    const attributeValueMap = {};

    if (!Array.isArray(data)) {
        return attributeValueMap;
    }

    data.forEach((row) => {
        if (!row || typeof row !== "object" || Array.isArray(row)) {
            return;
        }

        Object.keys(row).forEach((key) => {
            const attributeKey = String(key).toLowerCase();
            const rawValue = row[key];

            if (rawValue === null || rawValue === undefined) {
                return;
            }

            const valueKey = String(rawValue).toLowerCase();

            if (!attributeValueMap[attributeKey]) {
                attributeValueMap[attributeKey] = {};
            }

            if (!attributeValueMap[attributeKey][valueKey]) {
                attributeValueMap[attributeKey][valueKey] = String(rawValue);
            }
        });
    });

    return attributeValueMap;
}

/*
 * Resolve attribute names against the actual dataset keys.
 *
 * This ensures that preset properties and interactive changes always reference
 * the same attribute names that exist in the dataset used by PivotTableUI.
 */
function resolveAttributeNames(values, attributeMap) {
    return normalizeStringArray(values).map((value) => {
        const mappedValue = attributeMap[String(value).toLowerCase()];
        return mappedValue || String(value);
    });
}

/*
 * Normalize the valueFilter object and resolve both attribute names and attribute values
 * against the actual dataset content.
 *
 * PivotTableUI expects a plain object keyed by attribute names and value names
 * exactly as they exist in the dataset. If casing differs, the filter state may
 * appear in the UI but will not affect computation and rendering correctly.
 */
function normalizeValueFilter(value, attributeMap, attributeValueMap) {
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
        const attributeKey = String(resolvedAttributeName).toLowerCase();

        normalizedFilter[resolvedAttributeName] = {};

        Object.keys(attributeFilter).forEach((attributeValue) => {
            const resolvedAttributeValue =
                attributeValueMap[attributeKey]?.[String(attributeValue).toLowerCase()] || String(attributeValue);

            normalizedFilter[resolvedAttributeName][resolvedAttributeValue] = Boolean(attributeFilter[attributeValue]);
        });
    });

    return normalizedFilter;
}

export default function PivotTable(props) {
    /*
     * Normalize stable input properties.
     *
     * These properties are not part of the interactive pivot state returned by
     * PivotTableUI and should therefore be derived directly from the incoming props.
     */
    const safeData = Array.isArray(props.data) ? props.data : [];
    const safeRenderers = props.renderers || DefaultRenderers;
    const safeMenuLimit = Number.isInteger(props.menuLimit) ? props.menuLimit : 500;
    const safeUnusedOrientationCutoff = Number.isInteger(props.unusedOrientationCutoff) ? props.unusedOrientationCutoff : 85;

    /*
     * Build case-insensitive lookups based on the current dataset.
     *
     * These lookups are reused for attribute-based configuration and filters
     * so that all preset values resolve against the same dataset structure.
     */
    const attributeMap = useMemo(() => buildAttributeMap(safeData), [safeData]);
    const attributeValueMap = useMemo(() => buildAttributeValueMap(safeData), [safeData]);

    /*
     * Resolve attribute-based UI settings against the actual dataset keys.
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
     * Normalize the preset state received from PowerShell.
     *
     * Only interactive pivot configuration is stored in local React state.
     * Stable inputs such as data and renderer collections are passed directly.
     */
    const normalizedPresetState = useMemo(() => ({
        rows: resolveAttributeNames(props.rows, attributeMap),
        cols: resolveAttributeNames(props.cols, attributeMap),
        vals: resolveAttributeNames(props.vals, attributeMap),
        aggregatorName: props.aggregatorName ? String(props.aggregatorName) : "Count",
        rendererName: props.rendererName ? String(props.rendererName) : "Table",
        valueFilter: normalizeValueFilter(props.valueFilter, attributeMap, attributeValueMap),
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
        attributeMap,
        attributeValueMap
    ]);

    /*
     * Keep the interactive pivot state locally.
     *
     * PivotTableUI is controlled through the current state and returns updated
     * configuration through onChange. The local state preserves the interactive
     * layout after drag and drop, filtering and renderer changes.
     */
    const [pivotState, setPivotState] = useState(normalizedPresetState);

    /*
     * Reset the local state whenever a new preset arrives from PowerShell.
     *
     * This ensures that server-side preset changes are reflected in the UI and
     * do not remain mixed with a previously edited client-side state.
     */
    useEffect(() => {
        setPivotState(normalizedPresetState);
    }, [normalizedPresetState]);

    /*
     * Render PivotTableUI with normalized stable props and interactive state.
     *
     * onChange normalizes attribute-based values again so that interactive
     * changes continue to match the resolved dataset keys and values.
     */
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
                    if (state && typeof state === "object") {
                        setPivotState((currentState) => ({
                            ...currentState,
                            ...state,
                            rows: resolveAttributeNames(state.rows, attributeMap),
                            cols: resolveAttributeNames(state.cols, attributeMap),
                            vals: resolveAttributeNames(state.vals, attributeMap),
                            aggregatorName: state.aggregatorName ? String(state.aggregatorName) : currentState.aggregatorName,
                            rendererName: state.rendererName ? String(state.rendererName) : currentState.rendererName,
                            valueFilter: normalizeValueFilter(state.valueFilter, attributeMap, attributeValueMap),
                            rowOrder: state.rowOrder ? String(state.rowOrder) : currentState.rowOrder,
                            colOrder: state.colOrder ? String(state.colOrder) : currentState.colOrder
                        }));
                    }
                }}
            />
        </div>
    );
}
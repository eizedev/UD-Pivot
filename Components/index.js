const { withComponentFeatures } = require("universal-dashboard");
const PivotTable = require("./PivotTable").default;

const UDPivotTable = withComponentFeatures(PivotTable);

UniversalDashboard.register("ud-pivot", UDPivotTable);
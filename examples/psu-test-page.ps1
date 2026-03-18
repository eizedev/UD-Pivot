$Parameters = @{

    Name        = 'Test Pivot'
    Url         = '/test/pivot'
    Description = 'Test Pivot design and usability (features)'
    Content     = {

        #region Page Header
        New-UdHeading -Text 'Pivot Test Setup and Examples' -Size 1
        #endregion

        #region Minimal Example
        # This is the baseline test.
        # No preset configuration is applied.
        # Expected: Fully working drag & drop, aggregators and renderers without any errors.

        New-UdHeading -Text 'Minimal' -Size 2

        $Data = @(
            @{ Team = 'OPS'; Status = 'Open'; Priority = 'High'; Count = 5 }
            @{ Team = 'OPS'; Status = 'Closed'; Priority = 'Low'; Count = 2 }
            @{ Team = 'DEV'; Status = 'Open'; Priority = 'High'; Count = 8 }
            @{ Team = 'DEV'; Status = 'Closed'; Priority = 'Medium'; Count = 3 }
        )

        New-UDPivot -Id 'pivot-minimal' -Data $Data
        #endregion

        #region Rows + Cols + Count Aggregator
        # This test applies preset rows and columns.
        # Expected: Pivot should render with Team as rows and Status as columns using Count.wns).

        New-UdHeading -Text 'Rows + Cols + Count Aggregator' -Size 2

        $Data = @(
            @{ Team = 'OPS'; Status = 'Open'; Priority = 'High' }
            @{ Team = 'OPS'; Status = 'Closed'; Priority = 'Low' }
            @{ Team = 'DEV'; Status = 'Open'; Priority = 'High' }
            @{ Team = 'DEV'; Status = 'Closed'; Priority = 'Medium' }
        )

        New-UDPivot `
            -Id 'pivot-count' `
            -Data $Data `
            -Rows @('Team') `
            -Cols @('Status') `
            -AggregatorName 'Count' `
            -RendererName 'Table'
        #endregion

        #region Sum Aggregator with Value Field
        # This test validates numeric aggregation.
        # Expected: Sum of Count grouped by Team and Status.

        New-UdHeading -Text 'Sum Aggregator with Value Field' -Size 2

        $Data = @(
            @{ Team = 'OPS'; Status = 'Open'; Count = 5 }
            @{ Team = 'OPS'; Status = 'Closed'; Count = 2 }
            @{ Team = 'DEV'; Status = 'Open'; Count = 8 }
            @{ Team = 'DEV'; Status = 'Closed'; Count = 3 }
        )

        New-UDPivot `
            -Id 'pivot-sum' `
            -Data $Data `
            -Rows @('Team') `
            -Cols @('Status') `
            -Vals @('Count') `
            -AggregatorName 'Sum' `
            -RendererName 'Table'
        #endregion

        #region Hidden Attributes
        # InternalId should not appear in the attribute list.
        # Expected: Attribute completely hidden from UI.

        New-UdHeading -Text 'Hidden Attributes' -Size 2

        $Data = @(
            @{ Team = 'OPS'; Status = 'Open'; Priority = 'High'; InternalId = 1001; Count = 5 }
            @{ Team = 'OPS'; Status = 'Closed'; Priority = 'Low'; InternalId = 1002; Count = 2 }
            @{ Team = 'DEV'; Status = 'Open'; Priority = 'High'; InternalId = 1003; Count = 8 }
            @{ Team = 'DEV'; Status = 'Closed'; Priority = 'Medium'; InternalId = 1004; Count = 3 }
        )

        New-UDPivot `
            -Id 'pivot-hidden' `
            -Data $Data `
            -HiddenAttributes @('InternalId') `
            -Rows @('Team') `
            -Cols @('Status')
        #endregion

        #region Hidden From Aggregators / DragDrop
        # InternalId should not be available in aggregators or drag & drop.
        # Expected: Field exists in dataset but is not selectable in UI.

        New-UdHeading -Text 'Hidden From Aggregators / DragDrop' -Size 2

        New-UDPivot `
            -Id 'pivot-hidden-ui' `
            -Data $Data `
            -HiddenFromAggregators @('InternalId') `
            -HiddenFromDragDrop @('InternalId')
        #endregion

        #region Ordering
        # Tests ordering behavior of rows and columns.
        # Expected: Rows sorted by value descending, columns alphabetically.

        New-UdHeading -Text 'Ordering' -Size 2

        $Data = @(
            @{ Team = 'OPS'; Status = 'Open'; Count = 5 }
            @{ Team = 'OPS'; Status = 'Closed'; Count = 2 }
            @{ Team = 'DEV'; Status = 'Open'; Count = 8 }
            @{ Team = 'DEV'; Status = 'Closed'; Count = 3 }
        )

        New-UDPivot `
            -Id 'pivot-order' `
            -Data $Data `
            -Rows @('Team') `
            -Cols @('Status') `
            -Vals @('Count') `
            -AggregatorName 'Sum' `
            -RowOrder 'value_z_to_a' `
            -ColOrder 'key_a_to_z'
        #endregion

        #region Menu Limit
        # Limits number of values shown in dropdown menus.
        # Expected: Only 2 values visible before scrolling.

        New-UdHeading -Text 'Menu Limit' -Size 2

        $Data = @(
            @{ Team = 'OPS'; Status = 'Open'; Priority = 'High'; Count = 5 }
            @{ Team = 'OPS'; Status = 'Closed'; Priority = 'Low'; Count = 2 }
            @{ Team = 'DEV'; Status = 'Open'; Priority = 'High'; Count = 8 }
            @{ Team = 'DEV'; Status = 'Closed'; Priority = 'Medium'; Count = 3 }
        )

        New-UDPivot `
            -Id 'pivot-menu-limit' `
            -Data $Data `
            -MenuLimit 2
        #endregion

        #region Predefined Value Filter
        # Applies a filter before rendering.
        # Expected: Only "Closed" values should be included.

        New-UdHeading -Text 'Predefined Value Filter' -Size 2

        $Data = @(
            @{ Team = 'OPS'; Status = 'Open'; Count = 5 }
            @{ Team = 'OPS'; Status = 'Closed'; Count = 2 }
            @{ Team = 'DEV'; Status = 'Open'; Count = 8 }
            @{ Team = 'DEV'; Status = 'Closed'; Count = 3 }
        )

        $ValueFilter = @{
            Status = @{
                Open = $true
            }
        }

        New-UDPivot `
            -Id 'pivot-filter' `
            -Data $Data `
            -Rows @('Team') `
            -Cols @('Status') `
            -ValueFilter $ValueFilter
        #endregion

        #region Plotly Renderer
        # Tests chart rendering using Plotly.
        # Expected: Grouped column chart showing sums per Team and Status.

        New-UdHeading -Text 'Plotly Renderer' -Size 2

        $Data = @(
            @{ Team = 'OPS'; Status = 'Open'; Count = 5 }
            @{ Team = 'OPS'; Status = 'Closed'; Count = 2 }
            @{ Team = 'DEV'; Status = 'Open'; Count = 8 }
            @{ Team = 'DEV'; Status = 'Closed'; Count = 3 }
        )

        New-UDPivot `
            -Id 'pivot-plotly' `
            -Data $Data `
            -Rows @('Team') `
            -Cols @('Status') `
            -Vals @('Count') `
            -AggregatorName 'Sum' `
            -RendererName 'Grouped Column Chart'
        #endregion
    }
}

New-UDPage @Parameters
/**
 * General data munging functionality
 */

import * as d3 from "d3";
import loadData from "@financial-times/load-data";

/**
 * Parses data file and returns structured data
 * @param  {String} url Path to CSV/TSV/JSON file
 * @return {Object}     Object containing series names, value extent and raw data object
 */
export function load(url, options) {
    const { showHierarchy, rootName, attrToShow } = options;
    // eslint-disable-line
    return loadData(url).then(result => {
        const data = result.data ? result.data : result;

        const seriesNames = getSeriesNames(data.columns);

        const valueExtent = d3.extent(data, d => d[attrToShow]);

        const groupNames = data
            .map(d => d.group)
            .filter((el, i, ar) => ar.indexOf(el) === i);

        // Should check that no root exists first
        data.push({
            name: rootName,
            group: ""
        });

        // Add all nodes with no parent as chilren of root object
        data.forEach(d => {
            if (d.name !== rootName && d.group === "") {
                d.group = rootName;
            }
        });

        // Add group objects
        groupNames.forEach(g => {
            if (g !== "") {
                data.push({
                    name: g,
                    group: rootName
                });
            }
        });

        const root = d3
            .stratify()
            .id(d => d.name)
            .parentId(d => d.group)(data)
            .sum(d => d[attrToShow])
            .sort((a, b) => a[attrToShow] - a[attrToShow]);

        const plotData = root;

        return {
            data,
            plotData,
            valueExtent
        };
    });
}

// a function that returns the columns headers from the top of the dataset, excluding specified
function getSeriesNames(columns) {
    const exclude = ["name", "group"]; // adjust column headings to match your dataset
    return columns.filter(d => exclude.indexOf(d) === -1);
}

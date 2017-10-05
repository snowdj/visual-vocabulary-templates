/**
 * General data munging functionality
 */

import * as d3 from 'd3';

/**
 * Parses CSV file and returns structured data
 * @param  {String} url Path to CSV file
 * @return {Object}     Object containing series names, value extent and raw data object
 */
export function fromCSV(url, dateStructure, options) {
    return new Promise((resolve, reject) => {
        d3.csv(url, (error, data) => {
            if (error) reject(error);
            else {
                const {yMin, joinPoints, highlightNames } = options;
                // make sure all the dates in the date column are a date object
                const parseDate = d3.timeParse(dateStructure);
                data.forEach((d) => {
                    d.date = parseDate(d.date);
                });

                // Automatically calculate the seriesnames excluding the "marker" and "annotate column"
                const seriesNames = getSeriesNames(data.columns);

                // Use the seriesNames array to calculate the minimum and max values in the dataset
                const valueExtent = extentMulti(data, seriesNames, yMin);

                // Format the dataset that is used to draw the lines
                const plotData = seriesNames.map(d => ({
                    name: d,
                    lineData: getlines(data, d),
                }));

                // Sort the data so that the labeled items are drawn on top
                const dataSorter = function dataSorter(a, b) {
                    if (highlightNames.indexOf(a.name) > highlightNames.indexOf(b.name)) {
                        return 1;
                    } else if (highlightNames.indexOf(a.name) === highlightNames.indexOf(b.name)) {
                        return 0;
                    }
                    return -1;
                };
                if (highlightNames) { plotData.sort(dataSorter); }

                 // Filter data for annotations
                const annos = data.filter(d => (d.annotate !== '' && d.annotate !== undefined));

                // Format the data that is used to draw highlight tonal bands
                const boundaries = data.filter(d => (d.highlight === 'begin' || d.highlight === 'end'));
                const highlights = [];

                boundaries.forEach((d, i) => {
                    if (d.highlight === 'begin') {
                        highlights.push({ begin: d.date, end: boundaries[i + 1].date });
                    }
                });

                resolve({
                    seriesNames,
                    plotData,
                    data,
                    valueExtent,
                    highlights,
                    annos
                });
            }
        });
    });
}


/**
 * Returns the columns headers from the top of the dataset, excluding specified
 * @param  {[type]} columns [description]
 * @return {[type]}         [description]
 */
export function getSeriesNames(columns) {
    const exclude = ['date', 'annotate', 'highlight'];
    return columns.filter(d => (exclude.indexOf(d) === -1));
}

/**
 * Calculates the extent of multiple columns
 * @param  {[type]} d       [description]
 * @param  {[type]} columns [description]
 * @param  {[type]} yMin    [description]
 * @return {[type]}         [description]
 */
export function extentMulti(d, columns, yMin) {
    const ext = d.reduce((acc, row) => {
        let values = columns.map(key => row[key])
        .map((item) => {
            if (!item || item === '*') {
                return yMin;
            }
            return Number(item);
        });
        const rowExtent = d3.extent(values);
        if (!acc.max) {
            acc.max = rowExtent[1];
            acc.min = rowExtent[0];
        } else {
            acc.max = Math.max(acc.max, rowExtent[1]);
            acc.min = Math.min(acc.min, rowExtent[0]);
        }
        return acc;
    }, {});
    return [ext.min, ext.max];
}

/**
 * Sorts the column information in the dataset into groups according to the column
 * head, so that the line path can be passed as one object to the drawing function
 */
export function getlines(d, group, joinPoints) {
    let lineData=[]
    d.forEach(function(el,i){
        //console.log(el,i)
        let column=new Object();
        column.name = group
        column.date = el.date
        column.value = +el[group]
        column.highlight = el.highlight
        column.annotate = el.annotate
        if(el[group]) {
            lineData.push(column)
        }

        // if(el[group] == false) {
        //     lineData.push(null)
        // }
        if(el[group] == false && joinPoints == false) {
            lineData.push(null)
        }

    });
    return lineData
    // return d.map((el) => {
    //     if (el[group]) {
    //         return {
    //             name: group,
    //             date: el.date,
    //             value: +el[group],
    //             highlight: el.highlight,
    //             annotate: el.annotate,
    //         };
    //     }

    //     return null;
    // }).filter(i => i);
}

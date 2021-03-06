import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

export function draw() {
    let rem = 10;
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let seriesNames = [];
    let highlightNames = [];
    let yAxisAlign = 'right';
    let markers = false;
    let interpolation = d3.curveMonotoneX;
    let mutedColour = '#999999';
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);

    function chart(parent) {
        const lineData = d3.line()
            .defined(d => d)
            .curve(interpolation)
            .x(d => xScale(d.group) + (xScale.bandwidth() / 2))
            .y(d => yScale(d.pos) + (yScale.bandwidth() / 2));

        parent.attr('opacity', (d) => {
            if (highlightNames.length > 0 && d.highlightLine === false) {
                return 0.5;
            } return 1;
        });

        parent.append('path')
            .attr('stroke', (d) => {
                if (d.highlightLine === false) {
                    d.strokeColour = mutedColour;
                    return d.strokeColour;
                }
                if (d.highlightLine === true) {
                    d.strokeColour = colourScale(d.item);
                    return d.strokeColour;
                }
                d.strokeColour = colourScale(d.item);
                return d.strokeColour;
            })
            .attr('d', d => lineData(d.pathData));

        if (markers) {
            // This is used to place markers
            const dates = xScale.domain();

            parent.append('circle')
                .attr('r', rem / 6)
                .attr('cx', (d) => {
                    const x = dates[d.indexStart];
                    return xScale(x) + (xScale.bandwidth() / 2);
                })
                .attr('cy', (d) => {
                    const y = d.pos;
                    return yScale(y) + (yScale.bandwidth() / 2);
                })
                .attr('fill', d => d.strokeColour);
            parent.append('circle')
                .attr('r', rem / 6)
                .attr('cx', (d) => {
                    const x = dates[d.indexEnd];
                    return xScale(x) + (xScale.bandwidth() / 2);
                })
                .attr('cy', (d) => {
                    const y = d.posEnd;
                    return yScale(y) + (yScale.bandwidth() / 2);
                })
                .attr('fill', d => d.strokeColour);
        }
    }

    chart.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return chart;
    };

    chart.yAxisAlign = (d) => {
        if (!d) return yAxisAlign;
        yAxisAlign = d;
        return chart;
    };

    chart.highlightNames = (d) => {
        if (!d) return highlightNames;
        highlightNames = d;
        return chart;
    };

    chart.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return chart;
    };

    chart.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return chart;
    };

    chart.plotDim = (d) => {
        if (!d) return window.plotDim;
        window.plotDim = d;
        return chart;
    };

    chart.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return chart;
    };

    chart.markers = (d) => {
        if (typeof d === 'undefined') return markers;
        markers = d;
        return chart;
    };

    chart.interpolation = (d) => {
        if (!d) return interpolation;
        interpolation = d;
        return chart;
    };

    chart.mutedColour = (d) => {
        if (!d) return mutedColour;
        mutedColour = d;
        return chart;
    };

    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
            mutedColour = gChartcolour.mutedFirstLineSocial[0];
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.lineWeb);
            mutedColour = gChartcolour.mutedFirstLineWeb[0];
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
            mutedColour = gChartcolour.mutedFirstLinePrint[0];
        }
        return chart;
    };

    return chart;
}

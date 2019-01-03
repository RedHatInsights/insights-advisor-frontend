import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { ChartDonut, ChartLabel, ChartLegend, ChartTheme } from '@patternfly/react-charts';
import { Grid, GridItem } from '@patternfly/react-core';

class AdvisorOverviewDonut extends React.Component {
    getChart = (theme, typeNames) => (
        <ChartDonut
            data={ this.props.category.map((value, key) => ({ x: typeNames[key], y: value, label: `${typeNames[key]}: ${value}` })) }
            theme={ theme }
            height={ 200 }
            width={ 200 }
            events={ [{
                target: 'data',
                eventHandlers: {
                    onClick: () => {
                        return [
                            {
                                target: 'data',
                                mutation: (props) => {
                                    this.props.history.push(`/actions/${props.datum.xName.toLowerCase()}`);
                                }
                            }
                        ];
                    },
                    onMouseOver: () => {
                        return [{
                            mutation: (props) => {
                                return {
                                    style: Object.assign({}, props.style, { fill: 'tomato', cursor: 'pointer' })
                                };
                            }
                        }, {
                            target: 'labels',
                            mutation: () => ({ active: true })
                        }];
                    },
                    onMouseOut: () => {
                        return [{
                            mutation: () => {
                                return null;
                            }
                        }, {
                            target: 'labels',
                            mutation: () => ({ active: false })
                        }];
                    }
                }
            }] }
        />
    );

    getLegend = (theme, typeNames) => (
        <ChartLegend
            data={ this.props.category.map((value, key) => ({ name: `${typeNames[key]} (${value})` })) }
            itemsPerRow={ 2 }
            events={ [
                {
                    target: 'labels', eventHandlers: {
                        onClick: this.legendClick,
                        onMouseOver: () => {
                            return [{
                                mutation: (props) => {
                                    return {
                                        style: Object.assign({}, props.style, { cursor: 'pointer' })
                                    };
                                }
                            }];
                        }
                    }
                }] }
            theme={ theme }
        />
    );

    legendClick = () => {
        return [{
            target: 'labels',
            mutation: (props) => {
                this.props.history.push(`/actions/${props.datum.name.split(' ')[0].toLowerCase()}`);
            }
        }];
    };

    render () {
        const label = (
            <div
                className="chart-label"
            >
                <ChartLabel
                    style={ { fontSize: 20 } }
                    text={ this.props.category.length ? `${this.props.category.reduce((sum, curr) => sum + curr)} Issues` : '' }
                    textAnchor="middle"
                    verticalAnchor="middle"
                />

            </div>
        );
        const typeNames = [ 'Availability', 'Security', 'Stability', 'Performance' ];

        return (
            <Grid gutter="lg">
                <GridItem lg={ 1 }/>
                <GridItem lg={ 10 }>
                    <div className="chart-inline">
                        <div className="chart-container" key='advisor-donut'>
                            { label }
                            { this.getChart(ChartTheme.light.blue, typeNames) }
                        </div>
                        { this.getLegend(ChartTheme.light.blue, typeNames) }
                    </div>
                </GridItem>
                <GridItem lg={ 1 }/>
            </Grid>
        );
    }
}

AdvisorOverviewDonut.propTypes = {
    category: PropTypes.array,
    history: PropTypes.object

};

AdvisorOverviewDonut.defaultProps = {
    category: []
};

export default withRouter(AdvisorOverviewDonut);

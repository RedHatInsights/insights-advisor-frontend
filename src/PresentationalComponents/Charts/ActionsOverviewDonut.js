import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { ChartDonut, ChartLabel, ChartLegend } from '@patternfly/react-charts';
import { Grid, GridItem } from '@patternfly/react-core';
import AdvisorDonutTheme from './ActionsOverviewDonutTheme.js';

import './ActionsOverviewDonut.scss';

class AdvisorOverviewDonut extends React.Component {
    getChart = (theme, typeNames) => <ChartDonut
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
    />;

    getLegend = (theme, typeNames) => <ChartLegend
        data={ this.props.category.map((value, key) => ({ name: `${typeNames[key]} (${value})` })) }
        itemsPerRow={ 1 }
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
        gutter={ 0 }
        width={ 60 }
        height={ 60 }
        y={ 30 }
    />;

    legendClick = () => {
        return [{
            target: 'labels',
            mutation: (props) => {
                this.props.history.push(`/actions/${props.datum.name.split(' ')[0].toLowerCase()}`);
            }
        }];
    };

    render () {
        const { className } = this.props;
        const label = <svg
            className="chart-label"
            height={ 1 }
        >
            <ChartLabel
                style={ { fontSize: 25 } }
                text={ this.props.category.length ? `${this.props.category.reduce((sum, curr) => sum + curr)}` : '' }
                textAnchor="middle"
                verticalAnchor="middle"
                x={ 88 }
                y={ 66 }
            />
            <ChartLabel
                style={ { fill: '#bbbbbb' } }
                text='Total hits'
                textAnchor='middle'
                verticalAnchor='middle'
                x={ 88 }
                y={ 89 }
            />

        </svg>;
        const typeNames = [ 'Availability', 'Stability', 'Performance', 'Security' ];

        return (
            <div className={ `chart-inline ${className}` }>
                <Grid>
                    <GridItem span={ 6 }>
                        <div className="chart-container">
                            { label }
                            { this.getChart(AdvisorDonutTheme, typeNames) }
                        </div>
                    </GridItem>
                    <GridItem span={ 6 }>
                        { this.getLegend(AdvisorDonutTheme, typeNames) }
                    </GridItem>
                </Grid>
            </div>
        );
    }
}

AdvisorOverviewDonut.propTypes = {
    className: PropTypes.string,
    category: PropTypes.array,
    history: PropTypes.object

};

AdvisorOverviewDonut.defaultProps = {
    category: []
};

export default withRouter(AdvisorOverviewDonut);

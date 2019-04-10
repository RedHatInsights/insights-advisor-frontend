import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { ChartDonut, ChartLabel, ChartLegend, ChartTheme } from '@patternfly/react-charts';
import { Grid, GridItem } from '@patternfly/react-core';

import './OverviewDonut.scss';

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
                                this.props.history.push(`/overview/${props.datum.xName.toLowerCase()}`);
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
                this.props.history.push(`/overview/${props.datum.name.split(' ')[0].toLowerCase()}`);
            }
        }];
    };

    render () {
        const { className, category } = this.props;
        const totalHits = category.length ? category.reduce((sum, curr) => sum + curr) : 0;
        const label = <svg className="chart-label" height={ 1 }>
            <ChartLabel
                style={ { fontSize: 20 } }
                text={ totalHits }
                textAnchor="middle"
                verticalAnchor="middle"
                x={ 88 }
                y={ 66 }
            />
            <ChartLabel
                style={ { fill: '#bbb' } }
                text='Total hits'
                textAnchor='middle'
                verticalAnchor='middle'
                x={ 88 }
                y={ 89 }
            />
        </svg>;
        const typeNames = [ 'Availability', 'Stability', 'Performance', 'Security' ];

        return <>{ totalHits ? <div className={ `chart-inline ${className}` }>
            <Grid>
                <GridItem span={ 6 }>
                    <div className="chart-container">
                        { label }
                        { this.getChart(ChartTheme.light.multi, typeNames) }
                    </div>
                </GridItem>
                <GridItem aria-label="Chart legend" span={ 6 }>
                    { this.getLegend(ChartTheme.light.multi, typeNames) }
                </GridItem>
            </Grid>
        </div>
            : <p style={ { marginTop: 18 } }>{ `Your connected systems have no categorized rule hits.` }</p>
        }</>;
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

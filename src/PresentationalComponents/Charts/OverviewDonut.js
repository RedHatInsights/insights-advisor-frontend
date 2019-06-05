import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { ChartDonut, ChartLegend, ChartThemeColor, ChartThemeVariant } from '@patternfly/react-charts';

import './OverviewDonut.scss';

class AdvisorOverviewDonut extends React.Component {
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
        const typeNames = [ 'Availability', 'Stability', 'Performance', 'Security' ];

        return <>{ totalHits ?
            <div className={ `donut-chart-inline ${className}` }>
                <div className="donut-chart-container">
                    <ChartDonut
                        data={ this.props.category.map((value, key) => ({ x: typeNames[key], y: value, label: `${typeNames[key]}: ${value}` })) }
                        labels={ datum => `${datum.x}: ${datum.y}` }
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
                                }
                            }
                        }] }
                        title={ `${totalHits}` }
                        subTitle="Total Hits"
                        themeColor={ ChartThemeColor.multi }
                        themeVariant={ ChartThemeVariant.light }
                    />
                </div>
                <ChartLegend
                    data={ this.props.category.map((value, key) => ({ name: `${typeNames[key]} (${value})` })) }
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
                    orientation="vertical"
                    height={ 200 }
                    y={ 40 }
                    responsive={ false }
                    themeColor={ ChartThemeColor.multi }
                    themeVariant={ ChartThemeVariant.light }
                />
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

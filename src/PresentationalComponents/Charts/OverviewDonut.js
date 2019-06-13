/* eslint camelcase: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { ChartDonut, ChartLegend, ChartThemeColor, ChartThemeVariant } from '@patternfly/react-charts';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { connect } from 'react-redux';

import './OverviewDonut.scss';
import * as AppActions from '../../AppActions';
import { RULE_CATEGORIES } from '../../AppConstants';

class OverviewDonut extends React.Component {
    setFilters = category => {
        const categoryNum = `${RULE_CATEGORIES[category]}`;
        this.props.setFilters({ category: categoryNum, reports_shown: true, impacting: true });
    };

    legendClick = () => {
        return [{
            target: 'labels',
            mutation: (props) => {
                const category = props.datum.name.split(' ')[0].toLowerCase();
                this.setFilters(category);
                this.props.history.push(`/overview/${category}`);
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
                                            mutation: props => {
                                                const category = props.datum.xName.toLowerCase();
                                                this.setFilters(category);
                                                this.props.history.push(`/overview/${category}`);
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

OverviewDonut.propTypes = {
    className: PropTypes.string,
    category: PropTypes.array,
    history: PropTypes.object,
    setFilters: PropTypes.func

};

OverviewDonut.defaultProps = {
    category: []
};

const mapDispatchToProps = dispatch => ({
    setFilters: (filters) => dispatch(AppActions.setFilters(filters))
});

export default routerParams(connect(
    null,
    mapDispatchToProps
)(OverviewDonut));

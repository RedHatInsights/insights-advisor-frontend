/* eslint camelcase: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { ChartDonut, ChartLegend, ChartThemeColor, ChartThemeVariant } from '@patternfly/react-charts';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

import './OverviewDonut.scss';
import * as AppActions from '../../AppActions';
import { RULE_CATEGORIES } from '../../AppConstants';
import messages from '../../Messages';

const OverviewDonut = ({ className, category, setFilters, history, intl }) => {
    const setDonutFilters = category => {
        const categoryNum = `${RULE_CATEGORIES[category]}`;
        setFilters({ category: categoryNum, reports_shown: true, impacting: true });
    };

    const legendClick = () => {
        return [{
            target: 'labels',
            mutation: (data) => {
                const category = data.datum.name.split(' ')[0].toLowerCase();
                setDonutFilters(category);
                history.push(`/rules`);
            }
        }];
    };

    const totalHits = category.length ? category.reduce((sum, curr) => sum + curr) : 0;
    const typeNames = ['Availability', 'Stability', 'Performance', 'Security'];

    return <>{ totalHits ?
        <div className={ `donut-chart-inline ${className}` }>
            <div className="donut-chart-container">
                <ChartDonut
                    data={ category.map((value, key) => ({ x: typeNames[key], y: value, label: `${typeNames[key]}: ${value}` })) }
                    labels={ datum => `${datum.x}: ${datum.y}` }
                    events={ [{
                        target: 'data',
                        eventHandlers: {
                            onClick: () => {
                                return [
                                    {
                                        target: 'data',
                                        mutation: data => {
                                            const category = data.datum.xName.toLowerCase();
                                            setDonutFilters(category);
                                            history.push(`/rules`);
                                        }
                                    }
                                ];
                            }
                        }
                    }] }
                    title={ `${totalHits}` }
                    subTitle={intl.formatMessage(messages.overviewChartTotalHits)}
                    themeColor={ ChartThemeColor.multiOrdered }
                    themeVariant={ ChartThemeVariant.light }
                />
            </div>
            <ChartLegend
                data={ category.map((value, key) => ({ name: `${typeNames[key]} (${value})` })) }
                events={ [
                    {
                        target: 'labels', eventHandlers: {
                            onClick: legendClick,
                            onMouseOver: () => {
                                return [{
                                    mutation: (data) => {
                                        return {
                                            style: Object.assign({}, data.style, { cursor: 'pointer' })
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
                themeColor={ ChartThemeColor.multiOrdered }
                themeVariant={ ChartThemeVariant.light }
            />
        </div>
        : <p style={ { marginTop: 18 } }>{ intl.formatMessage(messages.overviewChartNoHits) }</p>
    }</>;
};

OverviewDonut.propTypes = {
    className: PropTypes.string,
    category: PropTypes.array,
    history: PropTypes.object,
    setFilters: PropTypes.func,
    intl: PropTypes.any

};

OverviewDonut.defaultProps = {
    category: []
};

const mapDispatchToProps = dispatch => ({
    setFilters: (filters) => dispatch(AppActions.setFilters(filters))
});

export default injectIntl(routerParams(connect(
    null,
    mapDispatchToProps
)(OverviewDonut)));

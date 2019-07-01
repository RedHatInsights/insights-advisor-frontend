import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import * as AppActions from '../../AppActions';
import './_breadcrumbs.scss';

const Breadcrumbs = (props) => {
    const [ items, setItems ] = useState([]);
    const [ ruleDescriptionLoaded, setRuleDescription ] = useState(false);
    const { breadcrumbs, current, fetchRule, match, ruleFetchStatus, rule } = props;
    const buildBreadcrumbs = useCallback(() => {
        let crumbs = [];

        // add rules base breadcrumb
        if (breadcrumbs[0] !== undefined) {
            crumbs.push(breadcrumbs[0]);
        } else {
            const title = match.url.split('/')[1];
            crumbs.push({ title, navigate: `/${title}` });
        }

        // add :id breadcrumb
        if (match.params.id !== undefined && match.params.inventoryId !== undefined) {
            const title = rule.description;
            crumbs.push({
                title,
                navigate: `/${match.url.split('/')[1]}/${match.params.id}`
            });
        }

        setItems(crumbs);
    }, [ breadcrumbs, match.params.id, match.params.inventoryId, match.url, rule.description ]);

    useEffect(() => {
        if (match.params.inventoryId !== undefined) {
            fetchRule({ rule_id: match.params.id }); // eslint-disable-line camelcase
        } else {
            buildBreadcrumbs();
        }
    }, [ buildBreadcrumbs, fetchRule, match.params.id, match.params.inventoryId ]);

    useEffect(() => {
        if (ruleFetchStatus === 'fulfilled' && !ruleDescriptionLoaded) {
            setRuleDescription(true);
            buildBreadcrumbs();
        }
    }, [ buildBreadcrumbs, ruleFetchStatus, ruleDescriptionLoaded ]);

    return (
        <React.Fragment>
            { (ruleFetchStatus === 'fulfilled' || items.length > 0) && (
                <Breadcrumb>
                    { items.map((oneLink, key) => (
                        <BreadcrumbItem key={ key }>
                            <Link to={ oneLink.navigate }>{ oneLink.title }</Link>
                        </BreadcrumbItem>
                    )) }
                    <BreadcrumbItem isActive>{ current }</BreadcrumbItem>
                </Breadcrumb>
            ) }
            { ruleFetchStatus === 'pending' && ('Loading...') }
        </React.Fragment>
    );
};

Breadcrumbs.propTypes = {
    breadcrumbs: PropTypes.arrayOf(Object),
    current: PropTypes.string,
    fetchRule: PropTypes.func,
    match: PropTypes.object,
    rule: PropTypes.object,
    ruleFetchStatus: PropTypes.string
};

const mapStateToProps = (state, ownProps) => ({
    breadcrumbs: state.AdvisorStore.breadcrumbs,
    rule: state.AdvisorStore.rule,
    ruleFetchStatus: state.AdvisorStore.ruleFetchStatus,
    ...state,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchRule: (url) => dispatch(AppActions.fetchRule(url))
});

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(Breadcrumbs));

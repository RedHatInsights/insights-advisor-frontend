/* eslint-disable react-hooks/exhaustive-deps */
import * as AppActions from '../../AppActions';

import React, { useCallback, useEffect, useState } from 'react';

import { Breadcrumb } from '@patternfly/react-core/dist/js/components/Breadcrumb/Breadcrumb';
import { BreadcrumbItem } from '@patternfly/react-core/dist/js/components/Breadcrumb/BreadcrumbItem';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

const Breadcrumbs = ({ current, fetchRule, match, ruleFetchStatus, rule, intl }) => {
    const [items, setItems] = useState([]);
    const [ruleDescriptionLoaded, setRuleDescription] = useState(false);
    const buildBreadcrumbs = useCallback(() => {
        const crumbs = [];
        const splitUrl = match.url.split('/');

        // add base
        crumbs.push({ title: `${intl.formatMessage(messages.insightsHeader)} ${splitUrl[1]}`, navigate: `/${splitUrl[1]}` });

        // if applicable, add :id breadcrumb
        if (match.params.id !== undefined && match.params.inventoryId !== undefined) {
            crumbs.push({
                title: rule.description,
                navigate: `/${match.url.split('/')[1]}/${match.params.id}`
            });
        }

        setItems(crumbs);
    }, [intl, match.params.id, match.params.inventoryId, match.url, rule.description]);

    useEffect(() => {
        const splitUrl = match.url.split('/');
        match.params.inventoryId !== undefined && splitUrl[1] !== 'systems' ?
            fetchRule({ rule_id: match.params.id })
            : buildBreadcrumbs();
    }, [buildBreadcrumbs, fetchRule, match.params.id, match.params.inventoryId, match.url]);

    useEffect(() => {
        if (ruleFetchStatus === 'fulfilled' && !ruleDescriptionLoaded) {
            setRuleDescription(true);
            buildBreadcrumbs();
        }
    }, [buildBreadcrumbs, ruleFetchStatus, ruleDescriptionLoaded]);

    return (
        <React.Fragment>
            {(ruleFetchStatus === 'fulfilled' || items.length > 0) && (
                <Breadcrumb>
                    {items.map((oneLink, key) => (
                        <BreadcrumbItem key={key}>
                            <Link to={oneLink.navigate}>{oneLink.title}</Link>
                        </BreadcrumbItem>
                    ))}
                    <BreadcrumbItem isActive>{current}</BreadcrumbItem>
                </Breadcrumb>
            )}
            {ruleFetchStatus === 'pending' && intl.formatMessage(messages.loading)}
        </React.Fragment>
    );
};

Breadcrumbs.propTypes = {
    current: PropTypes.string,
    fetchRule: PropTypes.func,
    match: PropTypes.object,
    rule: PropTypes.object,
    ruleFetchStatus: PropTypes.string,
    intl: PropTypes.any
};

const mapStateToProps = (state, ownProps) => ({
    rule: state.AdvisorStore.rule,
    ruleFetchStatus: state.AdvisorStore.ruleFetchStatus,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchRule: (url) => dispatch(AppActions.fetchRule(url))
});

export default injectIntl(routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(Breadcrumbs)));

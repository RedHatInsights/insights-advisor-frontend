import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { routerParams } from '@red-hat-insights/insights-frontend-components';
import { connect } from 'react-redux';
import * as AppActions from '../../AppActions';
import PropTypes from 'prop-types';
import './_breadcrumbs.scss';

class Breadcrumbs extends React.Component {
    state = {
        items: [],
        ruleDescriptionLoaded: false
    };

    componentDidMount () {
        if (this.props.match.params.inventoryId !== undefined) {
            this.props.fetchRule({ rule_id: this.props.match.params.id }); // eslint-disable-line camelcase
        } else {
            this.buildBreadcrumbs();
        }
    }

    componentDidUpdate () {
        if (this.props.ruleFetchStatus === 'fulfilled' && !this.state.ruleDescriptionLoaded) {
            this.setState({ ruleDescriptionLoaded: true });
            this.buildBreadcrumbs();
        }
    }

    getReadableType = (type) => (
        type.indexOf('-') > -1 ? `${type.replace('-', ' ')} Actions` : type
    );

    buildBreadcrumbs () {
        const { breadcrumbs, match } = this.props;
        let crumbs = [];

        // add actions/rules base breadcrumb
        if (match.params.type !== undefined) {
            if (breadcrumbs[0] !== undefined) {
                crumbs.push(breadcrumbs[0]);
            } else {
                const title = match.url.split('/')[1];
                crumbs.push({ title, navigate: `/${title}` });
            }
        }

        // add :type breadcrumb (exception: Rules based breadcrumbs)
        if (match.params.type !== undefined && match.params.id !== undefined && crumbs[0].title !== 'Rules') {
            const title = this.getReadableType(match.params.type);
            crumbs.push({
                title,
                navigate: `${crumbs[0].navigate}/${match.params.type}`
            });
        }

        // add :id breadcrumb
        if (match.params.id !== undefined && match.params.inventoryId !== undefined) {
            const title = this.props.rule.description;
            if (crumbs[1] !== undefined) {
                crumbs.push({
                    title,
                    navigate: `${crumbs[1].navigate}/${match.params.id}`
                });
            } else {
                // build breadcrumb from beginning if Rule-based
                crumbs.push({
                    title,
                    navigate: `/${match.url.split('/')[1]}/${match.params.type}/${match.params.id}`
                });
            }
        }

        this.setState({ items: crumbs });
    }

    render () {
        const { ruleFetchStatus } = this.props;
        const { items } = this.state;
        return (
            <React.Fragment>
                { (ruleFetchStatus === 'fulfilled' || items.length > 0) && (
                    <Breadcrumb>
                        { items.map((oneLink, key) => (
                            <BreadcrumbItem key={ key }>
                                <Link to={ oneLink.navigate }>{ oneLink.title }</Link>
                            </BreadcrumbItem>
                        )) }
                        <BreadcrumbItem isActive>{ this.props.current }</BreadcrumbItem>
                    </Breadcrumb>
                ) }
                { ruleFetchStatus === 'pending' && ('Loading...') }
            </React.Fragment>
        );
    }
}

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

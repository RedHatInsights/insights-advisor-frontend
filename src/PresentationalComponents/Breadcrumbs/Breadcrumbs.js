import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import './_breadcrumbs.scss';

export function buildBreadcrumbs(match, options) {
    let crumbs = [];

    // add actions/rules base breadcrumb
    if (match.params.type !== undefined) {
        if (options.breadcrumbs[0].navigate !== undefined) {
            crumbs.push(options.breadcrumbs[0]);
        } else {
            crumbs.push({ title: 'Actions', navigate: '/actions' });
        }
    }

    // add :type breadcrumb (exception: Rules based breadcrumbs)
    if (match.params.id !== undefined && crumbs[0].title !== 'Rules') {
        crumbs.push({
            title: match.params.type.replace('-', ' '),
            navigate: crumbs[0].navigate + '/' + match.params.type
        });
    }

    return crumbs;
}

const Breadcrumbs = ({ items, current }) => (
    <Breadcrumb>
        { items.map((oneLink, key) => (
            <BreadcrumbItem key={ key }>
                <Link to={ oneLink.navigate }>{ oneLink.title }</Link>
            </BreadcrumbItem>
        )) }
        <BreadcrumbItem to='' isActive>{ current }</BreadcrumbItem>
    </Breadcrumb>
);

Breadcrumbs.propTypes = {
    items: PropTypes.array,
    current: PropTypes.string
};

export default Breadcrumbs;

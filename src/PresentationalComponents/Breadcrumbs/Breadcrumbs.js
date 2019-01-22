import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import './_breadcrumbs.scss';

export function buildBreadcrumbs(match, options) {
    let crumbs = [];

    // add actions/rules base breadcrumb
    if (options === undefined || options.breadcrummbs === undefined || options.breadcrumbs[0] === undefined) {
        crumbs.push({ title: 'Actions', navigate: '/actions' });
    } else {
        crumbs.push(options.breadcrumbs[0]);
    }

    // add :type breadcrumb (exception: Rules based breadcrumbs)
    if (match.params.id !== undefined && crumbs[0].title !== 'Rules') {
        const title = match.params.type.indexOf('-') > -1 ? `${match.params.type.replace('-', ' ')} Actions` : match.params.type ;
        crumbs.push({
            title,
            navigate: crumbs[0].navigate + '/' + match.params.type
        });
    }

    if (match.params.inventoryId !== undefined) {
        crumbs.push({
            title: match.params.id,
            navigate: crumbs[0].navigate + '/' + crumbs[1].navigate + '/' + match.params.id
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

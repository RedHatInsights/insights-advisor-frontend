import React from 'react';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { BASE_URL_PATH } from '../../AppConstants';
import './_breadcrumbs.scss';

export function buildBreadcrumbs(match, hops) {
    let breadcrumbs = [];
    breadcrumbs.push({
        title: match.path.split('/')[1],
        navigate: '/' + match.path.split('/')[1]
    });
    return parseBreadcrumbs(breadcrumbs, match.params, hops);
}

export function parseBreadcrumbs(breadcrumbs, params, hops) {
    if (breadcrumbs[0].navigate === '/rules') {
        return breadcrumbs;
    } else {
        let crumbs = [];
        if (hops >= 1) {
            crumbs.push({
                title: breadcrumbs[0].title,
                navigate: breadcrumbs[0].navigate
            });
        }

        if (hops === 2) {
            crumbs.push({
                title: params.type.replace('-', ' '),
                navigate: breadcrumbs[0].navigate + '/' + params.type
            });
        }

        return crumbs;
    }
}

const Breadcrumbs = ({ items, current }) => (
    <Breadcrumb>
        { items.map((oneLink, key) => (
            <BreadcrumbItem key={ key } to={ `${BASE_URL_PATH}${oneLink.navigate}` }>{ oneLink.title }</BreadcrumbItem>
        )) }
        <BreadcrumbItem to='#' isActive>{ current }</BreadcrumbItem>
    </Breadcrumb>
);

Breadcrumbs.propTypes = {
    items: PropTypes.arrayOf(PropTypes.any),
    current: PropTypes.string
};

export default Breadcrumbs;

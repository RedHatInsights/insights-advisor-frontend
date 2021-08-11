import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Breadcrumb } from '@patternfly/react-core/dist/js/components/Breadcrumb/Breadcrumb';
import { BreadcrumbItem } from '@patternfly/react-core/dist/js/components/Breadcrumb/BreadcrumbItem';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { fetchRule } from '../../Store/AppActions';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';

const Breadcrumbs = ({ current }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const rule = useSelector(({ AdvisorStore }) => AdvisorStore.rule);
  const ruleFetchStatus = useSelector(
    ({ AdvisorStore }) => AdvisorStore.ruleFetchStatus
  );
  const location = useLocation().pathname?.split('/');
  const [items, setItems] = useState([]);

  const buildBreadcrumbs = useCallback(() => {
    const crumbs = [];
    // add base
    crumbs.push({
      title: `${intl.formatMessage(messages.insightsHeader)} ${location[1]}`,
      navigate: `/${location[1]}`,
    });

    // if applicable, add :id breadcrumb
    if (location[1] === 'recommendations' && location.length === 4) {
      crumbs.push({
        title: rule.description,
        navigate: `/${location[1]}/${location[2]}`,
      });
    }

    setItems(crumbs);
  }, [intl, location, rule.description]);

  useEffect(() => {
    const getRuleName = (id) => dispatch(fetchRule(id));

    location[1] === 'recommendations' && location.length === 4
      ? getRuleName({ rule_id: location[2] })
      : buildBreadcrumbs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ruleFetchStatus === 'fulfilled') {
      buildBreadcrumbs();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruleFetchStatus]);

  return (
    <React.Fragment>
      {(ruleFetchStatus === 'fulfilled' || items.length > 0) && (
        <Breadcrumb ouiaId="detail">
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
};

export default Breadcrumbs;

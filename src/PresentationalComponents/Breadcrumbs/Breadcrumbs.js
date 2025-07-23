import React, { useContext, useEffect, useState } from 'react';

import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import messages from '../../Messages';
import { useGetRecQuery } from '../../Services/Recs';
import { Link, useLocation } from 'react-router-dom';
import { EnvironmentContext } from '../../App';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import { buildBreadcrumbs } from './helpers';

const Breadcrumbs = ({ current }) => {
  const location = useLocation().pathname?.split('/');
  const [items, setItems] = useState([]);
  const envContext = useContext(EnvironmentContext);
  const skip =
    !(location[1] === 'recommendations' && location.length === 4) ||
    location[2] === 'pathways';
  const { data, isFetching } = useGetRecQuery(
    { ruleId: location[2], customBasePath: envContext.BASE_URL },
    { skip },
  );

  useEffect(() => {
    setItems(buildBreadcrumbs(location, skip));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <React.Fragment>
      {!isFetching && items.length > 0 ? (
        <Breadcrumb ouiaId="detail">
          {items.map((oneLink, key) => (
            <BreadcrumbItem key={key}>
              {envContext.loadChromeless ? (
                <Link to={oneLink.navigate}>{oneLink.title}</Link>
              ) : (
                <InsightsLink to={oneLink.navigate}>
                  {oneLink.title}
                </InsightsLink>
              )}
            </BreadcrumbItem>
          ))}
          <BreadcrumbItem isActive>{current}</BreadcrumbItem>
        </Breadcrumb>
      ) : (
        messages.loading.defaultMessage
      )}
    </React.Fragment>
  );
};

Breadcrumbs.propTypes = {
  current: PropTypes.string,
};

export default Breadcrumbs;

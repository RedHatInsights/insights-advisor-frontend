import React, { useEffect, useState } from 'react';

import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import messages from '../../Messages';
import { useGetRecQuery } from '../../Services/Recs';
import { useLocation } from 'react-router-dom';
import Link from '@redhat-cloud-services/frontend-components/InsightsLink';

const Breadcrumbs = ({ current }) => {
  const location = useLocation().pathname?.split('/');
  const [items, setItems] = useState([]);
  const skip =
    !(location[1] === 'recommendations' && location.length === 4) ||
    location[2] === 'pathways';
  const { data, isFetching } = useGetRecQuery(
    { ruleId: location[2] },
    { skip }
  );

  useEffect(() => {
    const buildBreadcrumbs = () => {
      let crumbs = [];

      // add base
      if (location[3]) {
        const baseNameWithCapitalLetter =
          location[3].slice(0, 1).toUpperCase() + location[3].slice(1);
        crumbs.push({
          title: `${baseNameWithCapitalLetter}`,
          navigate: `/${location[3]}`,
        });
      }

      // if applicable, add :id breadcrumb
      if (!skip) {
        crumbs.push({
          title: data?.description,
          navigate: `/${location[1]}/${location[2]}`,
        });
      }

      if (location[4] === 'pathways') {
        crumbs = [
          {
            title: 'Pathways',
            navigate: '/recommendations/pathways',
          },
        ];
      }

      setItems(crumbs);
    };

    buildBreadcrumbs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <React.Fragment>
      {!isFetching && items.length > 0 ? (
        <Breadcrumb ouiaId="detail">
          {items.map((oneLink, key) => (
            <BreadcrumbItem key={key}>
              <Link to={oneLink.navigate}>{oneLink.title}</Link>
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

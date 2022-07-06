import React, { useEffect, useState } from 'react';

import { Breadcrumb } from '@patternfly/react-core/dist/js/components/Breadcrumb/Breadcrumb';
import { BreadcrumbItem } from '@patternfly/react-core/dist/js/components/Breadcrumb/BreadcrumbItem';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import messages from '../../Messages';
import { useGetRecQuery } from '../../Services/Recs';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';

const Breadcrumbs = ({ current }) => {
  const intl = useIntl();
  const location = useLocation().pathname?.split('/');
  const [items, setItems] = useState([]);
  const skip =
    !(location[1] === 'recommendations' && location.length === 4) ||
    location[2] === 'pathways';
  // "Presentational components" shouldn't query data
  // We should look into how the Breadcrumbs are built
  const { data, isFetching } = useGetRecQuery(
    { ruleId: location[2] },
    { skip }
  );

  useEffect(() => {
    const buildBreadcrumbs = () => {
      let crumbs = [];
      // add base
      crumbs.push({
        title: `${intl.formatMessage(messages.insightsHeader)} ${location[1]}`,
        navigate: `/${location[1]}`,
      });

      // if applicable, add :id breadcrumb
      if (!skip) {
        crumbs.push({
          title: data?.description,
          navigate: `/${location[1]}/${location[2]}`,
        });
      }

      if (location[2] === 'pathways') {
        crumbs = [
          {
            title: 'Advisor pathways',
            navigate: '/recommendations/pathways',
          },
        ];
      }

      setItems(crumbs);
    };

    buildBreadcrumbs();
    // We should also remove all of these eslint-disables and actually follow the recommendations.
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
        intl.formatMessage(messages.loading)
      )}
    </React.Fragment>
  );
};

Breadcrumbs.propTypes = {
  current: PropTypes.string,
};

export default Breadcrumbs;

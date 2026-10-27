import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { ReportDetails } from '@redhat-cloud-services/frontend-components-advisor-components/ReportDetails';
import { EnvironmentContext } from '../../App';

/**
 * Expandable row component for SystemAdvisor TableTools table.
 * Renders ReportDetails including rule explanation, resolution, and KBA article links.
 */
const SystemAdvisorReportDetails = ({
  item,
  kbaDetails = [],
  kbaLoading = false,
}) => {
  const envContext = useContext(EnvironmentContext);

  if (!item?.resolution) {
    return null;
  }

  const isProd =
    typeof envContext?.isProd === 'function'
      ? envContext.isProd()
      : Boolean(envContext?.isProd);

  const matchedArticle =
    Array.isArray(kbaDetails) && kbaDetails.length
      ? kbaDetails.find(
          (article) => String(article.id) === String(item.rule?.node_id),
        )
      : null;

  const kbaDetail = {
    publishedTitle: matchedArticle?.publishedTitle || 'Knowledgebase article',
    id: item.rule?.node_id || '',
    view_uri:
      matchedArticle?.view_uri ||
      (item.rule?.node_id
        ? `https://access.redhat.com/solutions/${item.rule.node_id}`
        : ''),
  };

  return (
    <ReportDetails
      report={{
        ...item,
        resolution: item.resolution.resolution,
      }}
      kbaDetail={kbaDetail}
      kbaLoading={kbaLoading}
      isProd={isProd}
    />
  );
};

SystemAdvisorReportDetails.propTypes = {
  item: PropTypes.object.isRequired,
  kbaDetails: PropTypes.array,
  kbaLoading: PropTypes.bool,
};

export default SystemAdvisorReportDetails;

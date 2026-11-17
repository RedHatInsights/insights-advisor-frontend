import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnvironmentContext } from '../../App';
import SystemAdvisorReportDetails from './SystemAdvisorReportDetails';

jest.mock(
  '@redhat-cloud-services/frontend-components-advisor-components/ReportDetails',
  () => {
    const React = require('react');
    const PropTypes = require('prop-types');
    const MockReportDetails = ({ report, kbaDetail, isProd, kbaLoading }) => (
      <div data-testid="report-details">
        <span data-testid="kba-title">{kbaDetail?.publishedTitle}</span>
        <span data-testid="kba-uri">{kbaDetail?.view_uri}</span>
        <span data-testid="is-prod">{String(isProd)}</span>
        <span data-testid="kba-loading">{String(kbaLoading)}</span>
        <span data-testid="resolution-text">{report?.resolution}</span>
      </div>
    );

    MockReportDetails.propTypes = {
      report: PropTypes.shape({
        resolution: PropTypes.string,
      }),
      kbaDetail: PropTypes.shape({
        publishedTitle: PropTypes.string,
        view_uri: PropTypes.string,
      }),
      isProd: PropTypes.bool,
      kbaLoading: PropTypes.bool,
    };

    return {
      ReportDetails: MockReportDetails,
    };
  },
);

const renderDetails = (props, envContext = {}) => {
  return render(
    <EnvironmentContext.Provider value={envContext}>
      <SystemAdvisorReportDetails {...props} />
    </EnvironmentContext.Provider>,
  );
};

describe('SystemAdvisorReportDetails', () => {
  it('returns null when item or item.resolution is missing', () => {
    const { container: c1 } = renderDetails({ item: {} });
    expect(c1).toBeEmptyDOMElement();

    const { container: c2 } = renderDetails({ item: null });
    expect(c2).toBeEmptyDOMElement();
  });

  it('renders report details with matched KBA article and function isProd', () => {
    const item = {
      rule: { node_id: '123' },
      resolution: { resolution: 'Apply fix now' },
    };
    const kbaDetails = [
      {
        id: '123',
        publishedTitle: 'Fix title',
        view_uri: 'https://kba.example.com/123',
      },
    ];

    renderDetails(
      { item, kbaDetails, kbaLoading: false },
      { isProd: () => true },
    );

    expect(screen.getByTestId('report-details')).toBeInTheDocument();
    expect(screen.getByTestId('kba-title')).toHaveTextContent('Fix title');
    expect(screen.getByTestId('kba-uri')).toHaveTextContent(
      'https://kba.example.com/123',
    );
    expect(screen.getByTestId('is-prod')).toHaveTextContent('true');
    expect(screen.getByTestId('resolution-text')).toHaveTextContent(
      'Apply fix now',
    );
  });

  it('falls back to default KBA uri and boolean isProd when no matching article is found', () => {
    const item = {
      rule: { node_id: '456' },
      resolution: { resolution: 'Manual remediation' },
    };

    renderDetails(
      { item, kbaDetails: [], kbaLoading: true },
      { isProd: false },
    );

    expect(screen.getByTestId('kba-title')).toHaveTextContent(
      'Knowledgebase article',
    );
    expect(screen.getByTestId('kba-uri')).toHaveTextContent(
      'https://access.redhat.com/solutions/456',
    );
    expect(screen.getByTestId('is-prod')).toHaveTextContent('false');
    expect(screen.getByTestId('kba-loading')).toHaveTextContent('true');
  });

  it('handles item without node_id cleanly', () => {
    const item = {
      rule: {},
      resolution: { resolution: 'No node id' },
    };

    renderDetails({ item });

    expect(screen.getByTestId('kba-title')).toHaveTextContent(
      'Knowledgebase article',
    );
    expect(screen.getByTestId('kba-uri')).toHaveTextContent('');
  });
});

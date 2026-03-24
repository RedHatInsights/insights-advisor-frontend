import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@patternfly/react-icons/dist/esm/icons/chart-spike-icon', () => ({
  __esModule: true,
  default: () => <svg data-testid="chart-spike-icon" />,
}));

jest.mock('@patternfly/react-icons/dist/esm/icons/check-icon', () => ({
  __esModule: true,
  default: () => <svg data-testid="check-icon" />,
}));

jest.mock('@patternfly/react-icons/dist/esm/icons/times-circle-icon', () => ({
  __esModule: true,
  default: () => <svg data-testid="times-circle-icon" />,
}));

import {
  NoMatchingRecommendations,
  NoRecommendations,
  InsightsNotEnabled,
  InventoryReportFetchFailed,
} from './EmptyStates';

describe('EmptyStates', () => {
  describe('NoMatchingRecommendations', () => {
    it('renders no matching recommendations message', () => {
      render(<NoMatchingRecommendations />);
      expect(
        screen.getByText('No matching recommendations found'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'To continue, edit your filter settings and search again.',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('NoRecommendations', () => {
    it('renders no recommendations message', () => {
      render(<NoRecommendations />);
      expect(screen.getByText('No recommendations')).toBeInTheDocument();
      expect(
        screen.getByText('No known recommendations affect this system'),
      ).toBeInTheDocument();
    });
  });

  describe('InsightsNotEnabled', () => {
    it('renders Red Hat Lightspeed getting started message', () => {
      render(<InsightsNotEnabled />);
      expect(
        screen.getByText('Get started with Red Hat Lightspeed'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('1. Install the client on the RHEL system.'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('2. Register the system to Red Hat Lightspeed.'),
      ).toBeInTheDocument();
    });

    it('renders getting started documentation link', () => {
      render(<InsightsNotEnabled />);
      const link = screen.getByRole('link', {
        name: 'Getting started documentation',
      });
      expect(link).toHaveAttribute(
        'href',
        'https://access.redhat.com/products/red-hat-lightspeed#getstarted',
      );
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('renders install and register commands', () => {
      render(<InsightsNotEnabled />);
      expect(
        screen.getByDisplayValue('yum install insights-client'),
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('insights-client --register'),
      ).toBeInTheDocument();
    });
  });

  describe('InventoryReportFetchFailed', () => {
    it('renders error message when entity exists', () => {
      render(<InventoryReportFetchFailed entity={{ id: '123' }} />);
      expect(
        screen.getByText('Error getting recommendations'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'There was an error fetching recommendations for this entity. Refresh your page to try again.',
        ),
      ).toBeInTheDocument();
    });

    it('renders Red Hat Lightspeed message when entity does not exist', () => {
      render(<InventoryReportFetchFailed entity={null} />);
      expect(
        screen.getByText('Error getting recommendations'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'This entity can not be found or might no longer be registered to Red Hat Lightspeed.',
        ),
      ).toBeInTheDocument();
    });

    it('renders Red Hat Lightspeed message when entity is undefined', () => {
      render(<InventoryReportFetchFailed />);
      expect(
        screen.getByText(
          'This entity can not be found or might no longer be registered to Red Hat Lightspeed.',
        ),
      ).toBeInTheDocument();
    });
  });
});

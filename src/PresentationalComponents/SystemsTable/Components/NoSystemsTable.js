import React from 'react';
import {
  EmptyStateBody,
  EmptyState,
  EmptyStateVariant,
  Content,
  ContentVariants,
  Bullseye,
} from '@patternfly/react-core';
import propTypes from 'prop-types';
import { SearchIcon } from '@patternfly/react-icons';
import { NO_SYSTEMS_MAP, NO_SYSTEMS_REASONS } from '../../../AppConstants';

const NoSystemsTable = ({ reason = NO_SYSTEMS_REASONS.NO_MATCH }) => (
  <Bullseye>
    <EmptyState
      variant={EmptyStateVariant.sm}
      icon={NO_SYSTEMS_MAP[reason]?.icon || SearchIcon}
      titleText={
        NO_SYSTEMS_MAP[reason]?.titleText || 'No matching systems found'
      }
    >
      <EmptyStateBody>
        <Content>
          <Content component={ContentVariants.p}>
            {NO_SYSTEMS_MAP[reason]?.bodyText ||
              'To continue, edit your filter settings and search again.'}
          </Content>
        </Content>
      </EmptyStateBody>
    </EmptyState>
  </Bullseye>
);

NoSystemsTable.propTypes = {
  reason: propTypes.oneOf(Object.values(NO_SYSTEMS_REASONS)),
};

export default NoSystemsTable;

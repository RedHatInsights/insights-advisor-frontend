import React from 'react';
import { Icon, Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

const LastSeenColumnHeader = () => {
  return (
    <span>
      Last seen{' '}
      <Tooltip
        content="Last seen represents the most recent time
          a system uploaded an archive for analysis."
      >
        <Icon>
          <OutlinedQuestionCircleIcon
            className="pf-v6-u-ml-sm"
            color="var(--pf-t--global--icon--color--subtle)"
          />
        </Icon>
      </Tooltip>
    </span>
  );
};

export default LastSeenColumnHeader;

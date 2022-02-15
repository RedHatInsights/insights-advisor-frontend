import React from 'react';
import {
  Button,
  Label,
  Popover,
  PopoverPosition,
} from '@patternfly/react-core';
import IntroBody from './IntroBody';
import messages from '../../Messages';
import { useIntl } from 'react-intl';

const AppIntro = () => {
  const intl = useIntl();
  const [show, setShow] = React.useState(false);

  const HeaderContent = () => (
    <div>{intl.formatMessage(messages.introExploreInsights)}</div>
  );

  return (
    <Popover
      aria-label="Advisor intro wizard"
      position={PopoverPosition.bottomEnd}
      hideOnOutsideClick={false}
      isVisible={show}
      shouldClose={setShow}
      shouldOpen={setShow}
      enableFlip={true}
      appendTo={() => document.body}
      headerContent={<HeaderContent />}
      bodyContent={<IntroBody isPreProduction />}
    >
      <Button variant="link">
        <Label color="blue">{intl.formatMessage(messages.introTakeTour)}</Label>
      </Button>
    </Popover>
  );
};

export default AppIntro;

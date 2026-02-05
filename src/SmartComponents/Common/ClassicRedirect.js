import React, { useEffect, useState } from 'react';

import instance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import { Redirect } from 'react-router-dom';
import TimesCircleIcon from '@patternfly/react-icons/dist/esm/icons/times-circle-icon';
import messages from '../../Messages';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { useIntl } from 'react-intl';

const ClassicRedirect = () => {
  const [fetchStatus, setFetchStatus] = useState('pending');
  const [redirect, setRedirect] = useState();
  const intl = useIntl();
  const addNotification = useAddNotification();

  const getData = (pathname) => {
    const patharray = pathname.split('/');
    const start = patharray.some((val) => val === 'beta') ? 6 : 5;
    switch (patharray?.[3]) {
      case 'systems':
        return [patharray?.[start], `/systems`];
      case 'recommendations':
        return [
          patharray?.[start + 1],
          `/recommendations/${patharray?.[start]}`,
        ];
      default:
        throw new Error(intl.formatMessage(messages.invalidPathname));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [classicId, redirectBase] = getData(window.location.pathname);
        const inventoryId = (
          await instance.get(`/api/inventory/v1/hosts?insights_id=${classicId}`)
        ).data.results[0].id;
        setRedirect(`${redirectBase}/${inventoryId}`);
        setFetchStatus('fulfilled');
      } catch (error) {
        addNotification({
          variant: 'danger',
          dismissable: true,
          title: intl.formatMessage(messages.error),
          description: `${error}`,
        });
        setFetchStatus('rejected');
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRedirect, setFetchStatus, intl]);

  return (
    <React.Fragment>
      {fetchStatus === 'pending' && <Loading />}
      {fetchStatus === 'fulfilled' && <Redirect to={redirect} />}
      {fetchStatus === 'rejected' && (
        <MessageState
          icon={TimesCircleIcon}
          title={intl.formatMessage(messages.inventoryIdNotFound)}
        />
      )}
    </React.Fragment>
  );
};

export default ClassicRedirect;

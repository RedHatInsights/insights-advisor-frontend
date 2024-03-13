import React, { useEffect, useState } from 'react';

import { Get } from '../../Utilities/Api';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import { Redirect } from 'react-router-dom';
import { TimesCircleIcon } from '@patternfly/react-icons';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/';
import messages from '../../Messages';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

const ClassicRedirect = () => {
  const [fetchStatus, setFetchStatus] = useState('pending');
  const [redirect, setRedirect] = useState();
  const intl = useIntl();
  const dispatch = useDispatch();

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
          await Get(`/api/inventory/v1/hosts?insights_id=${classicId}`)
        ).data.results[0].id;
        setRedirect(`${redirectBase}/${inventoryId}`);
        setFetchStatus('fulfilled');
      } catch (error) {
        dispatch(
          addNotification({
            variant: 'danger',
            dismissable: true,
            title: intl.formatMessage(messages.error),
            description: `${error}`,
          })
        );
        setFetchStatus('rejected');
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRedirect, setFetchStatus, intl, dispatch]);

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

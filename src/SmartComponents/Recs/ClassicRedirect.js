import React, { useEffect, useState } from 'react';

import Api from '../../Utilities/Api';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import { Redirect } from 'react-router-dom';
import TimesCircleIcon from '@patternfly/react-icons/dist/js/icons/times-circle-icon';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import messages from '../../Messages';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

const ClassicRedirect = () => {
    const [fetchStatus, setFetchStatus] = useState('pending');
    const [inventoryId, setInventoryId] = useState();
    const intl = useIntl();
    const dispatch = useDispatch();
    const pathname = window.location.pathname.split('/');
    const starting_index = pathname.some(val => val === 'beta') ? 6 : 5;
    const id = pathname?.[starting_index];
    const classicId = pathname?.[starting_index + 1];

    useEffect(() => {
        (async () => {
            try {
                setInventoryId((await Api.get(`/api/inventory/v1/hosts?insights_id=${classicId}`)).data.results[0].id);
                setFetchStatus('fulfilled');
            } catch (error) {
                dispatch(addNotification({
                    variant: 'danger', dismissable: true, title: intl.formatMessage(messages.error), description: `${error}` }));
                setFetchStatus('rejected');
            }
        })();
    }, [setInventoryId, setFetchStatus, classicId, intl, dispatch]);

    return <React.Fragment>
        {fetchStatus === 'pending' && <Loading/>}
        {fetchStatus === 'fulfilled' && <Redirect to={`/recommendations/${id}/${inventoryId}/`}/>}
        {fetchStatus === 'rejected' && <MessageState
            icon={TimesCircleIcon} title={intl.formatMessage(messages.inventoryIdNotFound)}/>}
    </React.Fragment>;
};

export default ClassicRedirect;

import './_Export.scss';

import React, { useState } from 'react';
import { Button } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { workloadQueryBuilder } from '../Common/Tables';
import { exportNotifications } from '../../AppConstants';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useDispatch } from 'react-redux';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux/actions/notifications';

const NewSystemsPdf = ({ filters }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const selectedTags = useSelector(
    ({ AdvisorStore }) => AdvisorStore?.selectedTags
  );
  const workloads = useSelector(({ AdvisorStore }) => AdvisorStore?.workloads);
  const SID = useSelector(({ AdvisorStore }) => AdvisorStore?.SID);
  const { requestPdf } = useChrome();

  const dataFetch = async () => {
    setLoading(true);
    dispatch(addNotification(exportNotifications.pending));

    let options = selectedTags?.length && { tags: selectedTags };
    workloads &&
      (options = { ...options, ...workloadQueryBuilder(workloads, SID) });
    try {
      await requestPdf({
        filename: `Advisor_systems--${new Date()
          .toUTCString()
          .replace(/ /g, '-')}.pdf`,
        payload: {
          manifestLocation: '/apps/advisor/fed-mods.json',
          scope: 'advisor',
          module: './NewSystemsPdfBuild',
          fetchDataParams: {
            filters,
            options,
            selectedTags,
          },
        },
      });

      setLoading(false);
      dispatch(addNotification(exportNotifications.success));
    } catch (e) {
      setLoading(false);
      dispatch(addNotification(exportNotifications.error));
    }
  };

  return (
    <Button
      onClick={dataFetch}
      variant="button"
      isDisabled={loading ? true : false}
      className="pf-v5-c-menu__item adv-c-dropdown-systems-pdf__menu-item"
    >
      Export to PDF
    </Button>
  );
};

NewSystemsPdf.propTypes = {
  filters: PropTypes.object,
  systemsCount: PropTypes.number,
};

export default NewSystemsPdf;

import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@patternfly/react-table';
import { Pagination } from '@patternfly/react-core';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import Loading from '../../../PresentationalComponents/Loading/Loading';
import { EnvironmentContext } from '../../../App';
import { Get } from '../../../Utilities/Api';

const PAGE_SIZE = 20;

const ForemanPathwaySystems = ({ pathwayName }) => {
  const envContext = useContext(EnvironmentContext);
  const [systems, setSystems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!envContext.SYSTEMS_FETCH_URL || !pathwayName) return;
    setIsLoading(true);
    setIsError(false);
    Get(
      envContext.SYSTEMS_FETCH_URL,
      {},
      {
        pathway: pathwayName,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        sort: '-last_seen',
      },
    )
      .then((resp) => {
        setSystems(resp?.data?.data || []);
        setTotal(resp?.data?.meta?.count || 0);
        setIsLoading(false);
      })
      .catch(() => {
        setIsError(true);
        setIsLoading(false);
      });
  }, [pathwayName, page, envContext.SYSTEMS_FETCH_URL]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <p>Failed to load systems.</p>;
  }

  if (!systems.length) {
    return <p>No systems found for this pathway.</p>;
  }

  return (
    <React.Fragment>
      <Table variant="compact" aria-label="Pathway systems">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Last seen</Th>
          </Tr>
        </Thead>
        <Tbody>
          {systems.map((system) => (
            <Tr key={system.system_uuid}>
              <Td dataLabel="Name">{system.display_name}</Td>
              <Td dataLabel="Last seen">
                {system.last_seen ? (
                  <DateFormat date={new Date(system.last_seen)} type="relative" />
                ) : (
                  'Never'
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {total > PAGE_SIZE && (
        <Pagination
          itemCount={total}
          perPage={PAGE_SIZE}
          page={page}
          onSetPage={(_e, p) => setPage(p)}
          variant="bottom"
        />
      )}
    </React.Fragment>
  );
};

ForemanPathwaySystems.propTypes = {
  pathwayName: PropTypes.string.isRequired,
};

export default ForemanPathwaySystems;

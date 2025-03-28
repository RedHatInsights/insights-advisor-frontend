import PropTypes from 'prop-types';
import React from 'react';
import { POUND_OF_RECS } from '../../AppConstants';
import { Text } from '@react-pdf/renderer';
import { ChartPie } from '@patternfly/react-charts';
import { Flex, FlexItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import chart_color_red_100 from '@patternfly/react-tokens/dist/js/chart_color_red_100';
import global_BackgroundColor_150 from '@patternfly/react-tokens/dist/js/global_BackgroundColor_150';

const RecommendationCharts = ({
  columnHeader,
  header,
  pieChart,
  pieLegend,
  rows,
}) => {
  return (
    <React.Fragment>
      <Text style={{ color: chart_color_red_100.value }}>{header}</Text>
      <Flex defaultspaceItems={{ default: 'spaceItemsLg' }}>
        <FlexItem style={{ width: '40%' }}>
          <Table variant="compact">
            <Thead>
              <Tr>
                <Th>{columnHeader}</Th>
                <Th>{POUND_OF_RECS}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((item, index) => (
                <Tr
                  key={`${columnHeader}-row-${index}`}
                  style={{
                    backgroundColor:
                      (index + 1) % 2 && global_BackgroundColor_150.var,
                    fontSize: '12px',
                  }}
                >
                  <Td style={{ fontSize: '12px' }}>{item[0]}</Td>
                  <Td style={{ fontSize: '12px' }}>{item[1]}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </FlexItem>
        <FlexItem
          alignSelf={{ default: 'alignSelfStretch' }}
          align={{ default: 'alignRight' }}
        >
          <ChartPie
            colorScale={['#C9190B', '#EC7A08', '#F0AB00', '#06C']}
            data={pieChart}
            legendData={pieLegend}
            legendOrientation="vertical"
            legendPosition="right"
            height={200}
            width={350}
            padding={{
              bottom: 20,
              left: 20,
              right: 140, // Adjusted to accommodate legend
              top: 20,
            }}
          />
        </FlexItem>
      </Flex>
    </React.Fragment>
  );
};

RecommendationCharts.propTypes = {
  columnHeader: PropTypes.string,
  header: PropTypes.string,
  pieChart: PropTypes.array,
  pieLegend: PropTypes.array,
  rows: PropTypes.array,
};

export default RecommendationCharts;

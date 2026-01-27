import PropTypes from 'prop-types';
import React from 'react';
import { POUND_OF_RECS } from '../../AppConstants';
import { Text } from '@react-pdf/renderer';
import { ChartPie } from '@patternfly/react-charts/victory';
import { Flex, FlexItem } from '@patternfly/react-core';
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  TableVariant,
} from '@patternfly/react-table';
import {
  t_global_text_color_status_danger_default,
  t_global_background_color_200,
  chart_color_red_orange_400,
  chart_color_orange_300,
  chart_color_yellow_300,
  chart_color_blue_300,
} from '@patternfly/react-tokens';

const RecommendationCharts = ({
  columnHeader,
  header,
  pieChart,
  pieLegend,
  rows,
}) => {
  return (
    <React.Fragment>
      <Text style={{ color: t_global_text_color_status_danger_default.value }}>
        {header}
      </Text>
      <Flex defaultspaceItems={{ default: 'spaceItemsLg' }}>
        <FlexItem style={{ width: '40%' }}>
          <Table
            aria-label={'recommendation-chart-table'}
            ouiaId={'recommendation-chart-table'}
            variant={TableVariant.compact}
          >
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
                      (index + 1) % 2 && t_global_background_color_200.value,
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
            colorScale={[
              chart_color_red_orange_400.value,
              chart_color_orange_300.value,
              chart_color_yellow_300.value,
              chart_color_blue_300.value,
            ]}
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

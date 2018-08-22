import React from 'react';
import { withRouter } from 'react-router-dom';
import './_actions.scss';
import PropTypes from 'prop-types';

import {
    Section,
    PageHeader,
    PageHeaderTitle,
    Battery,
    Ansible
} from '@red-hat-insights/insights-frontend-components';

import {
    Grid,
    GridItem,
    Title
} from '@patternfly/react-core';

import mockData from '../../../mockData/medium-risk.json';

const ListActions = ({ match }) => {

    const response = JSON.parse(JSON.stringify(mockData));

    let rule = response.rules.find(obj => {
        return obj.rule_id === match.params.id;
    });

    return (
        <React.Fragment>
            <PageHeader>
                <PageHeaderTitle title= 'Actions' />
            </PageHeader>
            <Section type='content' className='actions__list'>
                <Grid gutter='md'>
                    <GridItem md={8} sm={12}>
                        <Title size='xl'>
                            { rule.description }
                        </Title>
                        <div className='actions__description' dangerouslySetInnerHTML={{ __html: rule.summary_html }}/>
                    </GridItem>
                    <GridItem md={4} sm={12}>
                        <Grid gutter='sm' className='actions__detail'>
                            <GridItem sm={12} md={12}> <Ansible unsupported = { rule.ansible }/> </GridItem>
                            <GridItem sm={8} md={12}>
                                <Grid className='ins-l-icon-group__vertical' sm={4} md={12}>
                                    <GridItem> <Battery label='Impact' severity={ rule.rec_impact }/> </GridItem>
                                    <GridItem> <Battery label='Likelihood' severity={ rule.rec_likelihood }/> </GridItem>
                                    <GridItem> <Battery label='Total Risk' severity={ rule.resolution_risk }/> </GridItem>
                                </Grid>
                            </GridItem>
                            <GridItem sm={4} md={12}>
                                <Battery label='Risk Of Change' severity={ 3 }/>
                            </GridItem>
                        </Grid>
                    </GridItem>
                </Grid>
            </Section>
        </React.Fragment>
    );
};

ListActions.propTypes = {
    match: PropTypes.any
};

export default withRouter(ListActions);

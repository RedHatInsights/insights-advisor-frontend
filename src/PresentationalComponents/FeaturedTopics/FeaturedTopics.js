import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as AppActions from '../../AppActions';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardFooter, CardHeader, Grid, GridItem, Stack, StackItem, Title } from '@patternfly/react-core';
import { routerParams } from '@red-hat-insights/insights-frontend-components';
import { connect } from 'react-redux';

class FeaturedTopics extends Component {
    state = {
        cards: []
    };

    componentDidMount () {
        this.setState({ cards: [
            {
                title: 'Kernel Panic',
                description: 'Actions related to kernel panics that are typically caused by hardware issues, kernel bugs, and configuration issues.',
                systemsAffected: 128,
                link: '#',
                ruleCount: 13
            }
        ]});
    }

    render () {
        const { cards } = this.state;
        return (
            <Stack className='pf-u-mt-xl'>
                <StackItem className='pf-u-mb-md'>
                    <Title size='lg' headingLevel='h2' className='pf-m-xl'>Featured Topics</Title>
                </StackItem>
                <StackItem>
                    <Grid gutter='lg'>
                        { cards.map((card, key) => (
                            <GridItem span={ 3 } key={ key }>
                                <Card>
                                    <CardHeader>
                                        <Title size='md' headingLevel='h3' className='pf-m-lg'>{ card.title }</Title>
                                    </CardHeader>
                                    <CardBody>{ card.description }</CardBody>
                                    <CardFooter>
                                        <div className='pf-u-display-block'><b>{ card.systemsAffected } Systems affected</b></div>
                                        <br />
                                        <Link to='#'>View { card.ruleCount } Rules</Link>
                                    </CardFooter>
                                </Card>
                            </GridItem>
                        )) }
                    </Grid>
                </StackItem>
            </Stack>
        );
    }
}

FeaturedTopics.propTypes = {
    fetchStats: PropTypes.func,
    statsFetchStatus: PropTypes.string,
    stats: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
    stats: state.AdvisorStore.stats,
    statsFetchStatus: state.AdvisorStore.statsFetchStatus,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchStats: (url) => dispatch(AppActions.fetchStats(url))
});

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(FeaturedTopics));

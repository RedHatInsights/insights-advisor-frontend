import React from 'react';
import propTypes from 'prop-types';
import classNames from 'classnames';
import * as Icons from '@patternfly/react-icons';

import { Ansible, Battery } from '@red-hat-insights/insights-frontend-components';
import { Card, CardBody, CardHeader, Grid, GridItem, List, ListItem, Split, SplitItem } from '@patternfly/react-core';
import './_RulesCard.scss';

class ExpandableRulesCard extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            expanded: true
        };
        this.toggleExpanded = this.toggleExpanded.bind(this);
    }

    componentDidUpdate (prevProps) {
        if (this.props.isExpanded !== prevProps.isExpanded) {
            this.setState({ expanded: this.props.isExpanded });
        }
    }

    toggleExpanded () {
        this.setState({ expanded: !this.state.expanded });
    }

    render () {
        const rule = this.props.report.rule;
        const report = this.props.report;
        const {
            expanded
        } = this.state;

        let rulesCardClasses = classNames(
            'ins-c-rules-card',
            'pf-t-light',
            'pf-m-opaque-100'
        );
        return (
            <Card className={ rulesCardClasses } widget-type='InsightsRulesCard'>
                <CardHeader>
                    <Split onClick={ this.toggleExpanded }>
                        <SplitItem>
                            { !expanded && <Icons.ChevronRightIcon/> } { expanded && <Icons.ChevronDownIcon/> }
                        </SplitItem>
                        <SplitItem> { rule.category.name } &gt; </SplitItem>
                        <SplitItem isMain> { rule.description } </SplitItem>
                        <SplitItem>
                            <Ansible unsupported={ !rule.has_playbook }/>
                        </SplitItem>
                    </Split>
                    <Split>
                        <SplitItem> <Battery label='Impact' severity={ rule.impact.impact }/> </SplitItem>
                        <SplitItem> <Battery label='Likelihood' severity={ rule.likelihood }/> </SplitItem>
                        <SplitItem> <Battery label='Total Risk' severity={ rule.severity }/> </SplitItem>
                        <SplitItem><Battery label='Risk Of Change' severity={ rule.resolution_risk }/></SplitItem>
                    </Split>
                </CardHeader>
                { expanded && (<CardBody>
                    <Grid gutter='md' sm={ 12 }>
                        <GridItem>
                            <Card className='pf-t-light  pf-m-opaque-100'>
                                <CardHeader> <Icons.ThumbsUpIcon/> Detected Issues</CardHeader>
                                <CardBody>
                                    <div dangerouslySetInnerHTML={ { __html: rule.reason_html } }/>
                                </CardBody>
                            </Card>
                        </GridItem>
                        <GridItem>
                            <Card className='pf-t-light  pf-m-opaque-100'>
                                <CardHeader> <Icons.BullseyeIcon/> Steps to resolve</CardHeader>
                                <CardBody>
                                    { report.resolution && (<div dangerouslySetInnerHTML={ { __html: report.resolution.resolution } }/>) }
                                </CardBody>
                            </Card>
                        </GridItem>
                        <GridItem>
                            <Icons.LightbulbIcon/><strong>Related Knowledgebase articles: </strong>
                            <a href={ `https://access.redhat.com/solutions/${rule.node_id}` } rel="noopener">Add article name here!</a>
                        </GridItem>
                        <div>
                            <List>
                                { rule.more_info_html && (
                                    <ListItem>
                                        <div dangerouslySetInnerHTML={ { __html: rule.more_info_html } }/>
                                    </ListItem>
                                ) }
                                <ListItem>
                                    { `To learn how to upgrade packages, see "` }
                                    <a href="https://access.redhat.com/solutions/9934" rel="noopener">What is yum and how do I use it?</a>
                                    { `."` }
                                </ListItem>
                                <ListItem>{ `The Customer Portal page for the ` }
                                    <a href="https://access.redhat.com/security/" rel="noopener">Red Hat Security Team</a>
                                    { ` contains more information about policies, procedures, and alerts for Red Hat Products.` }
                                </ListItem>
                                <ListItem>{ `The Security Team also maintains a frequently updated blog at ` }
                                    <a href="https://securityblog.redhat.com" rel="noopener">securityblog.redhat.com</a>.
                                </ListItem>
                            </List>
                        </div>
                    </Grid>

                </CardBody>)
                }
            </Card>
        );
    }
}

export default ExpandableRulesCard;

ExpandableRulesCard.defaultProps = {
    report: {},
    isExpanded: true
};

ExpandableRulesCard.propTypes = {
    report: propTypes.object,
    isExpanded: propTypes.bool
};

import React, { Component } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@patternfly/react-core';

import '../_Skeleton.scss';
import '../../RulesCard/_RulesCard.scss';

/**
 * This is the async skeleton loader for the rules card
 * When this is used, it will generate a fake rules card with blocks of highlighted
 * CSS to show information is loading.
 */

export default function RulesCardSkeleton(importComponent) {
    class RulesCardSkeleton extends Component {
        constructor(props) {
            super(props);

            this.state = {
                component: null
            };
        }

        async componentDidMount() {
            const { default: component } = await importComponent();

            this.setState({
                component
            });
        }

        render() {
            const C = this.state.component;

            return C ? <C {...this.props} /> :
                <Card className='ins-c-rules-card ins-c-card__skeleton'>
                    <CardHeader>
                        <div className='skeleton skeleton-md'>&nbsp;</div>
                    </CardHeader>
                    <CardBody>
                        <div className='skeleton skeleton-lg'>&nbsp;</div>
                    </CardBody>
                    <CardFooter>
                        <div className='skeleton skeleton-sm'>&nbsp;</div>
                    </CardFooter>
                </Card>;
        }
    }

    return RulesCardSkeleton;
}

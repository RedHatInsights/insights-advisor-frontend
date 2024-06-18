import React from 'react';
import logger from 'redux-logger';
import AppEntry from './AppEntry';

const DevAppEntry = () => <AppEntry logger={logger} />;

export default DevAppEntry;

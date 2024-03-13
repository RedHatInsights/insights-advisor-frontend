import React from 'react';
import AppEntry from './AppEntry';

import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container);

root.render(<AppEntry />);

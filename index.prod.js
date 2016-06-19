import React from 'react';
import { render } from 'react-dom';
import Root from './containers/Root';
import 'polyfills/passive-scroll.js';

render(
    <Root/>,
    document.body
);

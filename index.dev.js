import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import FileSystem from 'systems/FileSystem.js';
import 'polyfills/passive-scroll.js';

window.fs = FileSystem;

render(
    <AppContainer>
        <Root/>
    </AppContainer>,
    document.body
);


if(module.hot)
{
    module.hot.accept('./containers/Root', () => {
        var NewRoot = require('./containers/Root').default;
        render(
            <AppContainer>
                <NewRoot/>
            </AppContainer>,
            document.body
        );
    });
}

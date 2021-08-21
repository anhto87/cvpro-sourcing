import React from 'react';
import { GlobalProvider } from './global/context';
import Routers from './global/routes';
import './global/styles/App.less';
import './themes/candy/custom.less';
import './global/i18n';

function App() {
    return (
        <GlobalProvider>
            <Routers />
        </GlobalProvider>
    );
}

export default App;

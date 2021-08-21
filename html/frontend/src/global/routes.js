import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

import { Dashboard } from '../Modules/Dashboard/index';
import CandidateRoutes from '../Modules/Candidates/CandidateRoutes';
import { Login } from '../Modules/Login/index';
import { GlobalContext } from './context';
import { AppLayout } from './layouts/app.layout';
import { isTokenLogged } from './utils';
import { RELOAD_LOGGED } from './reducer/auth.actions';

export const ProtectedRouter = ({ component: Component, ...rest }) => {
    const { stateAuth, dispatchAuth } = useContext(GlobalContext);
    let isAuthenticated = stateAuth.authenticated;

    if (isTokenLogged()) {
        if (!isAuthenticated) {
            dispatchAuth({ type: RELOAD_LOGGED });
        }
        isAuthenticated = true;
    }

    return (
        <Route
            {...rest}
            render={(props) => {
                if (isAuthenticated) {
                    return <Component {...props} />;
                } else {
                    return <Redirect to="/login" />;
                }
            }}
        />
    );
};

const AppRouter = () => {
    return (
        <Router>
            <AppLayout>
                <Route exact path="/login" component={Login} />
                <ProtectedRouter exact path="/" component={Dashboard} />
                <ProtectedRouter
                    exact
                    path="/dashboard/:id"
                    component={Dashboard}
                />
                {CandidateRoutes.map((props) => (
                    <ProtectedRouter exact key={props.path} exact {...props} />
                ))}
            </AppLayout>
        </Router>
    );
};

export default AppRouter;
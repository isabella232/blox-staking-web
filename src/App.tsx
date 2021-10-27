import styled from 'styled-components';
import {observer} from 'mobx-react-lite';
import React, {useContext, useEffect} from "react";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import {AppStoreContext} from './common/stores/AppStore';
import {Header, Authentication, StakingDeposit, UploadDepositFile} from './components';

const Wrapper = styled.div`
  height: 100vh;
`;

const App = observer(() => {
    const appStore = useContext(AppStoreContext)

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        if (!localStorage.getItem('reloaded') && window.location.pathname !== '/auth' && window['ethereum'] && !window['ethereum'].networkVersion) {
            localStorage.setItem('reloaded', 'true');
            location.reload();
        }
    }, []);

    appStore.setQueryParams();

    return (
        <Router>
            <Wrapper>
                <Header/>
                <Switch>
                    <Route path="/auth" component={Authentication}/>
                    {appStore.allMandatoryParamsExist &&
                    <>
                        <Route path="/staking-deposit" component={StakingDeposit}/>
                        <Route path="/upload_deposit_file" component={UploadDepositFile}/>
                    </>
                    }
                </Switch>
            </Wrapper>
        </Router>
    );
})

export default App;

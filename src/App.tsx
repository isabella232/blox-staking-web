import React, {useContext, useEffect} from "react";
import {observer} from 'mobx-react-lite';
import styled from 'styled-components';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Header, Authentication, StakingDeposit, UploadDepositFile } from './components';
import {AppStoreContext} from './common/stores/AppStore';

const Wrapper = styled.div`
  height:100vh;
`;

const App = observer(() => {
  const appStore = useContext(AppStoreContext)

  useEffect(() => {
    appStore.setQueryParams();
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      if(window['ethereum'] && !window['ethereum'].networkVersion){
        location.reload();
      }
  },[]);

  return (
    <Router>
      <Wrapper>
        <Header />
        {appStore.allMandatoryParamsExist && <Switch>
          <Route path="/auth" component={Authentication}/>
          <Route path="/staking-deposit" component={StakingDeposit}/>
          <Route path="/upload_deposit_file" component={UploadDepositFile}/>
        </Switch>}
      </Wrapper>
    </Router>
  );
})

export default App;

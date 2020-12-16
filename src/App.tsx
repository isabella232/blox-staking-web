import React from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { Header, Authentication, StakingDeposit } from './components';
import DepositFinished from "./components/StakingDeposit/components/DepositFinished";

const Wrapper = styled.div`
  height:100vh;
`;

function App() {
  return (
    <Router>
      <Wrapper>
        <Header />
        <Switch>
          <Route path="/auth" component={Authentication} />
          <Route path="/staking-deposit" component={StakingDeposit} />
            <Route path="/test" component={DepositFinished} />
        </Switch>
      </Wrapper>
    </Router>
  );
}

export default App;

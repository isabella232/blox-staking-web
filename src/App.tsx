import {useState} from "react";
import styled from 'styled-components';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Header, Authentication, StakingDeposit, UploadDepositFile } from './components';

const Wrapper = styled.div`
  height:100vh;
`;

function App() {
  const [validatorsDepositData, setValidatorsDepositData] = useState('');
  return (
    <Router>
      <Wrapper>
        <Header />
        <Switch>
          <Route path="/auth" component={Authentication} />
          <Route  path="/staking-deposit" component={()=> <StakingDeposit validatorsDepositData={validatorsDepositData}/>}/>
          <Route path="/upload_deposit_file" component={() => <UploadDepositFile setValidatorsDepositData={setValidatorsDepositData}/>}/>
        </Switch>
      </Wrapper>
    </Router>
  );
}

export default App;

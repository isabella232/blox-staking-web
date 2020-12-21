import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ConnectingTo, BackToDesktop } from './components';

import Auth from 'service/Auth';
import parsedQueryString from 'common/helpers/getParsedQueryString';

const auth = new Auth.AuthClass();

const Wrapper = styled.div`
  width:100%;
  height:calc(100% - 70px);
`;

const Authentication = () => {
  const [provider, setProvider] = useState<string>('');
  const [isLoading, setLoadingStatus] = useState<boolean> (false);
  const [tokenData, setTokenData] = useState<Record<string, any> | null> (null);

  useEffect(() => {
    const asyncFunc = () => {
      const qsObject: Record<string, any> = parsedQueryString(location.search);
      setProvider(qsObject.provider);
      if(Auth.constants[qsObject.provider]) {
        auth.loginWithSocialApp(qsObject.provider);
      }
    };
    asyncFunc();
  }, []);

  useEffect(() => {
    const asyncFunc = async () => {
      const queryStrings = /code|error/;
      if (queryStrings.test(location.search)) {
        setLoadingStatus(true);
        const qsObject: Record<string, any> = parsedQueryString(location.search);
        const responseData = await auth.loadAuthToken(qsObject.code);
        await setTokenData(responseData);
      }
    }
    asyncFunc();
  }, [location.search])

  return (
    <Wrapper>
      {isLoading && <BackToDesktop />}
      {provider && !isLoading && <ConnectingTo provider={provider} />}
      {tokenData && (
        <iframe allow={'web-share document-domain sync-xhr'} title={'callApp'}
                width={'0px'} height={'0px'} src={`blox-live://token_id=${tokenData.id_token}`}
        />
      )}
    </Wrapper>
  );
}

export default Authentication;

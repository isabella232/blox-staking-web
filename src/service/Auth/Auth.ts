import axios from 'axios';
import SOCIAL_APPS from './constants';

export default class Auth {
  idToken: string;
  userProfile: Profile;
  auth: Auth0ConfigObject;

  constructor() {
    this.idToken = '';
    this.userProfile = null;
    this.auth = {
      domain: process.env.REACT_APP_AUTH0_DOMAIN || '',
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID || '',
      clientSecret: process.env.REACT_APP_AUTH0_CLIENT_SECRET || '',
      redirectUri: process.env.REACT_APP_AUTH0_CALLBACK_URL || '',
      responseType: 'code',
      scope: 'openid profile email'
    };
  }

  loginWithSocialApp = async (socialAppName: string) => {
    console.log('name', socialAppName);
    console.log('this.auth', this.auth);

    const authUrl = this.getAuthenticationURL(socialAppName);
    window.open(authUrl, '_self');
  };

  getAuthenticationURL = (socialAppName: string) => {
    const { domain, clientID, redirectUri, responseType, scope } = this.auth;
    let authUrl = `https://${domain}/`;
    authUrl += `authorize?scope=${scope}&`;
    authUrl += `response_type=${responseType}&`;
    authUrl += `client_id=${clientID}&`;
    authUrl += `connection=${SOCIAL_APPS[socialAppName].connection}&`;
    authUrl += `&redirect_uri=${redirectUri}&`;
    authUrl += 'prompt=login';
    return authUrl;
  };

  loadAuthToken = async (code: string) => {
    const { clientID, clientSecret, redirectUri, domain } = this.auth;
    
    const exchangeOptions = {
      grant_type: 'authorization_code',
      client_id: clientID,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri
    };

    try {
      const response: Auth0Response = await axios({
        url: `https://${domain}/oauth/token`,
        method: 'post',
        data: exchangeOptions,
        responseType: 'json',
      });
      return response.data;
    } catch (error) {
      return Error(error);
    }
  };
}

interface Auth0ConfigObject {
  domain: string;
  clientID: string;
  clientSecret: string;
  redirectUri: string;
  responseType: string;
  scope: string;
}

interface Auth0Response {
  status: number;
  data: Auth0ResponseData
}

interface Auth0ResponseData {
    id_token: string;
}

type Profile = Record<string, any> | null;

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
      redirectUri: process.env.REACT_APP_AUTH0_CALLBACK_URL || '',
      responseType: 'code',
      scope: 'openid profile email offline_access'
    };
  }

  loginWithSocialApp = async (socialAppName: string) => {
    window.open(this.getAuthenticationURL(socialAppName), '_self');
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
    try {
      const response: Auth0Response = await axios({
        url: '/api/token',
        method: 'get',
        params: { code },
        responseType: 'json',
      });
      console.warn('Client side token data: ', response.data);
      return response.data;
    } catch (error) {
      return Error(error);
    }
  };
}

interface Auth0ConfigObject {
  domain: string;
  clientID: string;
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
  access_token: string;
  refresh_token: string;
}

type Profile = Record<string, any> | null;

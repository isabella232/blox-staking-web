const SOCIAL_APPS: SocialApps = {
  google: { label: 'Google', connection: 'google-oauth2' },
  microsoft: { label: 'Microsoft', connection: 'windowslive' },
  github: { label: 'Github', connection: 'github' },
};

interface SocialApps {
  [google: string]: Record<string, any>;
  microsoft: Record<string, any>;
  github: Record<string, any>;
}

export default SOCIAL_APPS;
import axios from 'axios';

export default function bloxAnalyticsPlugin(token, pluginConfig = {}) {
  return {
    /* All plugins require a name */
    name: 'blox-analytics-plugin',
    /* Everything else below this is optional depending on your plugin requirements */
    config: {
      ...pluginConfig
    },
    initialize: async ({ config }) => {
      // load provider script to page
    },
    page: async ({ payload }) => {
      // call provider specific page tracking
      await axios({
        url: `${process.env.REACT_APP_API_URL}/analytics/page`,
        method: 'put',
        data: payload,
        responseType: 'json',
        headers: {Authorization: `Bearer ${token}`},
      });
    },
    track: async ({ payload }) => {
      await axios({
        url: `${process.env.REACT_APP_API_URL}/analytics/track`,
        method: 'put',
        data: payload,
        responseType: 'json',
        headers: {Authorization: `Bearer ${token}`},
      });
      // call provider specific event tracking
    },
    identify: async ({ payload }) => {
      await axios({
        url: `${process.env.REACT_APP_API_URL}/analytics/identify`,
        method: 'put',
        data: payload,
        responseType: 'json',
        headers: {Authorization: `Bearer ${token}`},
      });
      // call provider specific user identify method
    },
    loaded: () => {
      // return boolean so analytics knows when it can send data to third party
      return true;
    }
  };
}

import queryString from 'query-string';

const getParsedQueryString = (location: string) => queryString.parse(location);

export default getParsedQueryString;
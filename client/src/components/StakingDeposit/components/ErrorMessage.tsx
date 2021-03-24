import styled from 'styled-components';

const ErrorMessage = styled.div`
  width: 320px;
  height: 16px;
  margin: 8px 0px 0px 3px;
  font-size: 11px;
  font-weight: 900;
  color:${({theme}) => theme.destructive600};
`;

export default ErrorMessage;
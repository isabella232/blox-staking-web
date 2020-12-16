import styled from 'styled-components';

const NeedGoETH = styled.a`
  width: 81px;
  height: 16px;
  margin-left:15px;
  font-size: 12px;
  font-weight: 900;
  color:${({theme}) => theme.primary900};
  text-decoration:none;
`;

export default NeedGoETH;
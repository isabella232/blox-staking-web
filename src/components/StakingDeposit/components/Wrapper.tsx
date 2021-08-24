import styled from 'styled-components';

const Wrapper = styled.div`
  width:100%;
  height: 100vh;
  padding:45px 115px 45px 115px;
  position:relative;
  background-color:${({theme}) => theme.gray100};
`;

export default Wrapper;
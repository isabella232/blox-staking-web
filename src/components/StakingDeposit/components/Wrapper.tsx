import styled from 'styled-components';

const Wrapper = styled.div`
  width:100%;
  height:calc(100% - 70px);
  padding:35px 115px 0px 115px;
  position:relative;
  background-color:${({theme}) => theme.gray100};
`;

export default Wrapper;
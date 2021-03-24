import styled from 'styled-components';

const Link = styled.a`
  color: ${({theme}) => theme.primary600};
  &:hover {
    color: ${({theme}) => theme.primary900};
  }
`;

export default Link;

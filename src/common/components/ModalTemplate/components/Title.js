import styled from 'styled-components';

const Title = styled.h1`
  font-size: ${({ fontSize }) => fontSize || '26px'};
  color: ${({ theme, color }) => theme[color] || theme.gray800};
  font-weight: 400;
`;

export default Title;

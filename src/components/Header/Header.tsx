import React from 'react';
import styled from 'styled-components';

import logoImage from '../../assets/images/infra-logo.svg';
import discordImage from '../../assets/images/discord-symbol.svg';

const Wrapper = styled.div`
  width: 100%;
  height: 70px;
  padding: 0px 2.5vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.primary900};
  background-size: cover;
  background-position: center;
`;

const Image = styled.img``;

const ClickableImage = styled(Image)`
  cursor:pointer;
`;

const onDiscordClick = () => window.open('https://discord.com/invite/VgHDdAP','_blank');

const Header = () => (
  <Wrapper>
    <Image src={logoImage} />
    <ClickableImage src={discordImage} onClick={onDiscordClick}/>
  </Wrapper>
);

export default Header;
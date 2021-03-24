import { useState } from 'react';
import styled from 'styled-components';
import { Icon, Link } from 'common/components';
import { getFaqContent } from './service';

const Wrapper = styled.div<{ isOpen: boolean }>`
  width:405px;
  height:100%;
  padding:24px;
  background-color:#ffffff;
  position:fixed;
  top:0px;
  right:${({isOpen}) => isOpen ? '0px' : '-405px'};
  font-size:11px;
  font-weight:500;
  display:flex;
  flex-direction:column;
  box-shadow:-1px 0px 3px 0px rgba(0,0,0,0.05);
  transition:all 0.5s;
  margin-top: 70px;
`;

const ToggleButton = styled.div`
  width:60px;
  height:70px;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.75;
  color:${({theme}) => theme.gray600};
  position:absolute;
  top:50px;
  left:-60px;
  background-color:#ffffff;
  display:flex;
  align-items:center;
  justify-content:center;
  border-top-left-radius:5px;
  border-bottom-left-radius:5px;
  box-shadow:-1px 0px 3px 0px rgba(0,0,0,0.05);
  cursor:pointer;

`;

const CloseButton = styled.div`
  display:flex;
  justify-content:flex-end;
  cursor:pointer;
`;

const Content = styled.div`
  width:100%;
  height:80%;
  display:flex;
  flex-direction:column;
  margin-top:45px;
`;

const Question = styled.div<{ color: string }>`
  margin-bottom:12px;
  color:${({theme, color}) => theme[color]};
`;

const TitleWrapper = styled.div`
  display:flex;
  align-items:center;
  cursor:pointer;
`;

const IconWrapper = styled.div<{ isActive: boolean }>`
  transform:${({isActive}) => isActive ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition:all 0.5s;
`;

const Title = styled.span`
  margin-left:17px;
`;

const Answer = styled.div<{ isActive: boolean }>`
  height:${({isActive}) => isActive ? 'auto' : '0px'};
  overflow:hidden;
  margin-top:12px;
  margin-bottom:${({isActive}) => isActive ? '12px' : '0px'};
  margin-left:33px;
  padding-right:14px;
  transition:all 0.5s;
`;

const LearnMore = styled.div`
  color:${({theme}) => theme.gray600};
`;

const Faq = ({networkId}: Props) => {
  const content = getFaqContent(networkId);
  const [ isOpen, setOpenStatus ] = useState(false);
  const [ active, setActive ] = useState(-1);

  const onQuestionClick = (index) => active === index ? setActive(-1) : setActive(index);

  return (
    <Wrapper isOpen={isOpen}>
      <ToggleButton onClick={() => setOpenStatus(!isOpen)}>FAQ</ToggleButton>
        <CloseButton onClick={() => setOpenStatus(false)}>
          <Icon name={'close'} color={'gray800'} fontSize={'24px'} />
        </CloseButton>
      <Content>
        {content.map((question, index) => {
          const { title, answer } = question;
          const isActive = index === active;
          const color = isActive ? 'gray800' : 'gray600';
          return (
            <Question key={index} color={color} onClick={() => onQuestionClick(index)}>
              <TitleWrapper>
                <IconWrapper isActive={isActive}>
                  <Icon name={'expand-less'} color={color} fontSize={'16px'} />
                </IconWrapper>
                <Title>{title}</Title>
              </TitleWrapper>
              <Answer isActive={isActive}>{answer}</Answer>
            </Question>
          )
        })}
        <LearnMore>
          Want to learn more? Join our <Link href={'http://bit.ly/30HwvsC'} target={'_blank'}>Discord</Link>&nbsp;
          or visit our <Link href={'https://www.bloxstaking.com/frequently-asked-questions/'} target={'_blank'}>FAQ page</Link>
        </LearnMore>
      </Content>
    </Wrapper>
  )
};

type Props = {
  networkId: string;
};

export default Faq;

import styled from 'styled-components';
import Icon from '../Icon';
import CopyToClipboardIcon from '../CopyToClipboardIcon';

const Wrapper = styled.div`
  width: 319px;
  height: 28px;
  padding: 4px 12px 4px 11px;
  border-radius: 14px;
  background-color:${({theme}) => theme.gray200};
  font-size: 12px;
  font-weight: 500;
  display:flex;
  align-items:center;
  justify-content:space-between;
`;

const Text = styled.div`
  width:87%;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
`;

const HttpText = styled.span`
    color:${({theme}) => theme.plgreen};
`;

const UniqueUrl = ({ url }: Props) => {
  const indexOfColon = url.indexOf('://');
  const httpStrings = url.substr(0, indexOfColon + 3);
  const urlStrings = url.slice(indexOfColon + 3, url.length);
  return (
  <Wrapper>
    <Icon name={'lock'} color={'plgreen'} fontSize={'16px'} />
    <Text>
      <HttpText>{httpStrings}</HttpText>
      {urlStrings}
    </Text>
    <CopyToClipboardIcon text={url} fontSize={'16px'} />
  </Wrapper>
  );
}

type Props = {
  url: string;
};

export default UniqueUrl;

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Icon from '../Icon';

const IconWrapper = styled.div`
  width: ${({size}) => size};
  height: ${({size}) => size};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CopyToClipboardIcon = (props) => {
  const { onCopy, text, fontSize } = props;
  const [clicked, setClicked] = useState(false);

  const onCopyClick = () => {
    onCopy && onCopy();
    setClicked(true);
  };

  return (
    <CopyToClipboard text={text} onCopy={onCopyClick}>
      <IconWrapper size={fontSize}>
        <Icon
          name="copy"
          color={clicked ? 'gray400' : 'primary900'}
          fontSize={fontSize}
          onClick={() => false}
        />
      </IconWrapper>
    </CopyToClipboard>
  );
};

CopyToClipboardIcon.defaultProps = {
  fontSize: '16px',
};

CopyToClipboardIcon.propTypes = {
  onCopy: PropTypes.func,
  text: PropTypes.string,
  fontSize: PropTypes.string,
};

export default CopyToClipboardIcon;

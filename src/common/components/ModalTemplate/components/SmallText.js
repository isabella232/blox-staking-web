import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Wrapper = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${({theme}) => theme.gray600};
`;

const Warning = styled.div`
  color: ${({theme}) => theme.warning900};
`;

const SmallText = ({withWarning}) => {
  return (
    <Wrapper>
      This process is automated and only takes a few minutes. <br />
      {withWarning && <Warning>Please don’t close the app until the process is completed.</Warning>}
    </Wrapper>
  );
};

SmallText.propTypes = {
  withWarning: PropTypes.bool,
};

export default SmallText;

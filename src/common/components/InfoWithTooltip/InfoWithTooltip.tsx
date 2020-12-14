import React from 'react';
import styled from 'styled-components';
import Tooltip from '../Tooltip';

import imageSrc from 'assets/images/info.svg';

const Image = styled.img<{ margin?: string, verticalAlign?: string }>`
  width: 13px;
  height: 13px;
  margin: ${({margin}) => margin || '0px 6px 2px 2px'};
  vertical-align:${({verticalAlign}) => verticalAlign};
`;

const InfoWithTooltip = ({ title, placement, margin, verticalAlign }: Props) => (
  <Tooltip title={title} placement={placement}>
    <Image src={imageSrc} margin={margin} verticalAlign={verticalAlign} />
  </Tooltip>
);

type Props = {
  title: string;
  placement: string;
  margin?: string;
  verticalAlign?: string;
};

export default InfoWithTooltip;

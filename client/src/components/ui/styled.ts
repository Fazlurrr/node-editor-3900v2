import ReactFlow, { MiniMap } from 'reactflow';
import styled from 'styled-components';

export const ReactFlowStyled = styled(ReactFlow)`
  background-color: ${props => props.theme.bg};
`;

export const MiniMapStyled = styled(MiniMap)`
  background-color: ${props => props.theme.bg};
`;

export const lightTheme = {
  bg: '#fff',
  primary: '#ff0072',

  nodeBg: '#f2f2f5',
  nodeColor: '#222',
  nodeBorder: '#222',

  minimapMaskBg: '#f2f2f5',

  controlsBg: '#fefefe',
  controlsBgHover: '#eee',
  controlsColor: '#222',
  controlsBorder: '#9facbc',
};

export const darkTheme = {
  bg: '#232528',
  primary: '#ff0072',

  nodeBg: '#343435',
  nodeColor: '#f9f9f9',
  nodeBorder: '#888',

  minimapMaskBg: '#343435',

  controlsBg: '#232528',
  controlsBgHover: '#676768',
  controlsColor: '#dddddd',
  controlsBorder: '#aeb2b7',
};

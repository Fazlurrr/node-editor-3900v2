import ReactFlow, { Controls, MiniMap } from 'reactflow';
import styled from 'styled-components';

export const ReactFlowStyled = styled(ReactFlow)`
  background-color: ${props => props.theme.bg};
`;

export const MiniMapStyled = styled(MiniMap)`
  background-color: ${props => props.theme.bg};

  .react-flow__minimap-mask {
    fill: ${props => props.theme.minimapMaskBg};
  }

  .react-flow__minimap-node {
    fill: ${props => props.theme.nodeBg};
    stroke: none;
  }

  /* Position the minimap 3/4 from the left at the bottom */
  position: absolute;
  bottom: 10px; /* Distance from the bottom */
  left: 75%; /* Start at 75% from the left */
  transform: translateX(-75%); /* Center-align based on the left position */
  width: 200px; /* Adjust width */
  height: 120px; /* Adjust height */
  z-index: 1000; /* Ensure it's above other elements */
  border: 1px solid ${props => props.theme.controlsBorder}; /* Optional border */
`;

export const ControlsStyled = styled(Controls)`
  button {
    background-color: ${props => props.theme.controlsBg};
    color: ${props => props.theme.controlsColor};
    border-bottom: 1px solid ${props => props.theme.controlsBorder};

    &:hover {
      background-color: ${props => props.theme.controlsBgHover};
    }

    path {
      fill: currentColor;
    }
  }
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
  controlsBorder: '#ddd',
};

export const darkTheme = {
  bg: '#232528',
  primary: '#ff0072',

  nodeBg: '#343435',
  nodeColor: '#f9f9f9',
  nodeBorder: '#888',

  minimapMaskBg: '#343435',

  controlsBg: '#555',
  controlsBgHover: '#676768',
  controlsColor: '#dddddd',
  controlsBorder: '#676768',
};

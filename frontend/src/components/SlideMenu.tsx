import React, { ReactNode } from 'react';
import { Box, Slide } from '@mui/material';
import theme from 'MUIConfig';
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from 'body-scroll-lock';

interface SliderProps {
  show: boolean;
  children: ReactNode;
  direction: 'left' | 'right';
  gap?: number;
  gapChildren?: ReactNode;
}

export class SlideMenu extends React.Component {
  props: SliderProps;
  body: HTMLBodyElement | null;

  constructor(p: SliderProps) {
    super(p);
    this.props = p;
    this.body = document.querySelector('body');
  }

  componentDidMount() {
    this.body = document.querySelector('body');
  }

  componentDidUpdate() {
    if (!this.body) return;
    if (this.props.show) {
      disableBodyScroll(this.body);
    } else {
      enableBodyScroll(this.body);
    }
  }

  componentWillUnmount() {
    clearAllBodyScrollLocks();
  }

  render() {
    const { props } = this;
    return (
      <Slide
        direction={props.direction}
        in={props.show}
        mountOnEnter
        unmountOnExit
      >
        <Box
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: `${theme.palette.primary.dark}BB`,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Box display="sticky" height={props.gap}>
            {props.gapChildren}
          </Box>
          <Box
            style={{
              height: props.gap ? `calc(100vh - ${props.gap}px)` : '100vh',
              overflowY: 'auto',
            }}
          >
            {props.children}
          </Box>
        </Box>
      </Slide>
    );
  }
}

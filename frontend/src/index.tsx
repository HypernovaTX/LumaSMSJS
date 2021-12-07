import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from '@emotion/react';

import theme from 'MUIConfig';
import 'index.css';
import Navigation from 'Global/Navigation';
import reportWebVitals from 'reportWebVitals';
import image from 'psyw_screen_mfgg.png';
import 'languages';

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Navigation />
      <div
        style={{
          background: `linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.5) 100%), url(${image})`,
          backgroundSize: 'cover',
          imageRendering: 'pixelated',
          height: '200vh',
        }}
      ></div>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {Provider} from "react-redux";
import {store} from "./store";
import {CssBaseline, StyledEngineProvider, ThemeProvider} from "@mui/material";
import {theme} from "./GlobalStyles";

// set up sentry only if in a production mode
// TODO insert sentry
// if (process.env.NODE_ENV === "production") {
//   let sentryErrorCache = [];
//   Sentry.init({
//     dsn: "https://238a2a93bd804a8ab2e704845dabb150@o904010.ingest.sentry.io/5843261",
//     integrations: [new Integrations.BrowserTracing()],
//     beforeSend(event: Event, hint?: EventHint): PromiseLike<Event | null> | Event | null {
//       if (event.exception.values && event.exception.values.length>0) {
//         let errValue = event.exception.values[0].value;
//         if (sentryErrorCache.indexOf(errValue) === -1) {
//           sentryErrorCache.push(errValue);
//           return event;
//         } else return ;
//       } else return event;
//     },
//     tracesSampleRate: 0.0,
//   });
// }

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </StyledEngineProvider>
    </Provider>
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

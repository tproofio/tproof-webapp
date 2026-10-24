import React from 'react';
import {BrowserRouter} from "react-router-dom";
import {Route, Routes} from "react-router";
import {routes} from "./App.Routes";

/**
 * Arweave path gateways serve the app under /<manifestId>/.
 * Without this basename React Router sees "/<manifestId>/" and matches no
 * route, leaving the page blank. On a normal domain it returns undefined.
 * @returns the gateway prefix (e.g. "/<id>"), or undefined
 */
const getBasename = (): string | undefined => {
  // A leading 43-char base64url id is the Arweave manifest id.
  const match = window.location.pathname.match(/^\/([A-Za-z0-9_-]{43})(\/|$)/);
  return match ? "/" + match[1] : undefined;
};

function App(): JSX.Element {

  return (
    <BrowserRouter basename={getBasename()}>
      <Routes>
        {
          routes.map(r => {
            if(r.protected)
              return <Route path={r.path} key={r.path} element={r.component} />
            else return <Route path={r.path} key={r.path} element={r.component} />
          })
        }
      </Routes>
    </BrowserRouter>
  );

}

export default App;

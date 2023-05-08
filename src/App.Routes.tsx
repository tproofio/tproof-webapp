import React from "react";
import Home from "./ui/pages/Home/Home";
import DApp from "./ui/pages/dApp/dApp";

export enum RouteKey {
  Home = "/",
  dApp = "/dApp",
  dAppPrivate = "/dApp/:projectId",
}
// list of all the routes of the App
export const routes = [ {
  key: RouteKey.Home,
  protected: false,
  path: RouteKey.Home,
  component: <Home/>,
}, {
  key: RouteKey.dAppPrivate,
  protected: false,
  path: RouteKey.dAppPrivate,
  component: <DApp/>,
}, {
  key: RouteKey.dApp,
  protected: false,
  path: RouteKey.dApp,
  component: <DApp/>,
}]

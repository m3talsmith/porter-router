
import {Channel}              from "porter-client";

import {queryStringToObject}  from "../utilities/helpers";
import RoutePath              from "./RoutePath";


class Router {
  // Broadcasts {path, search, hash, error, query, tokens}
  constructor(channel) {
    if (!(channel instanceof Channel)) throw "Router: a valid channel is required.";
    this.channel        = channel;
    this.routes         = [];
    this.changeRoute    = "changeRoute";
    this.defaultRoute   = null;
    window.onload       = e => this.connect();
  }

  addDefaultRoute(action) {
    this.defaultRoute = new RoutePath(/([\s\S])+/, action); // matches anything
  }

  addRoute(pattern, action) {
    this.routes.push(new RoutePath(pattern, action));
  }

  parseHash(hash) {
    let parts = hash.split("?");
    return {
      path:   parts[0],
      search: parts[1] || null,
      hash:   hash,
    };
  }

  firstMatchingRoute(parts) {
    let matchingRoutes = this.routes.filter(route => {
      return parts.path.match(route.pattern);
    });
    return matchingRoutes[0];
  }

  match(hash) {
    let parts = this.parseHash(hash);
    let route = this.firstMatchingRoute(parts)
    let error = null;
    if (!route) {
      error = "NotFound";
      route = this.defaultRoute;
    }
    return this.parseMessage(route, parts, error);
  }

  parseMessage(route, parts, error) {
    if (!route) {
      console.warn("Router: unmatched route and no default", hash);
      return null;
    }
    return {
      ...parts,
      error: error,
      query: queryStringToObject(parts.search),
      tokens: route.parseTokens(parts.path),
      action: route.action,
    };
  }

  updateRoute() {
    console.log("updating route");
    let match = this.match(window.location.hash);
    console.log("match is", match);
    if (match) {
      console.log("route Matched", match);
      this.channel.publish(this.changeRoute, match);
    }
  }

  connect(){
    window.addEventListener("hashchange", event => {
      console.info("hashchange", event);
      this.updateRoute();
    });
    this.updateRoute();
  }
}

export default Router;

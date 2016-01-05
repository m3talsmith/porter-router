
import * as queryString       from "query-string";
import {Channel}              from "porter-client";

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
    this.middlewares    = {};
  }


  addDefaultRoute(action) {
    this.defaultRoute = new RoutePath(/([\s\S])+/, action); // matches anything
  }

  addRoute(pattern, action, options) {
    this.routes.push(new RoutePath(pattern, action, options || {}));
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

  pipeThroughMiddleWare(route) {
    let pipes = route.options.middlewares;
    if (pipes) {
      for(var index in pipes) {
        let callback = pipes[index];
        route = callback(this, route);
      }
    }
    return route;
  }

  match(hash) {
    let parts = this.parseHash(hash);
    let route = this.firstMatchingRoute(parts);
    if (!route) {
      return this.parseMessage(this.defaultRoute, parts, "NotFound");
    }
    let ok = this.pipeThroughMiddleWare(route);
    if (!ok) return;
    return this.parseMessage(route, parts);
  }

  parseMessage(route, parts, error) {
    if (!route) {
      console.warn("Router: unmatched route and no default", parts[1]);
      return null;
    }
    return {
      ...parts,
      error: error,
      query: queryString.parse(parts.search),
      tokens: route.parseTokens(parts.path),
      action: route.action,
    };
  }

  goTo(location) {
    window.location.hash = location;
  }

  updateRoute() {
    if (window.location.hash == "" || window.location.hash == "#") {
      this.goTo("#/");
      return;
    }
    let match = this.match(window.location.hash);
    if (match) {
      this.channel.publish(this.changeRoute, match);
    }
  }

  connect(){
    window.addEventListener("hashchange", event => {
      this.updateRoute();
    });
    this.updateRoute();
  }
}

export default Router;

import { Router }   from './Router';
import {RoutePath } from './RoutePath';

if (typeof module != 'undefined') {
  module.exports = {
    Router: Router,
    RoutePath:  RoutePath
  };
}

export { default as Router }      from './Router';
export { default as RoutePath }   from './RoutePath';


/* The map2() function supports the following easing types */
let LINEAR = 0;
let QUADRATIC = 1;
let CUBIC = 2;
let QUARTIC = 3;
let QUINTIC = 4;
let SINUSOIDAL = 5;
let EXPONENTIAL = 6;
let CIRCULAR = 7;
let SQRT = 8;
let ELASTIC = 9;

/* When the easing is applied (in, out, or both) */
let EASE_IN = 0;
let EASE_OUT = 1;
let EASE_IN_OUT = 2;

/*
 * A map() replacement that allows for specifying easing curves
 * with arbitrary exponents.
 *
 * value :   The value to map
 * start1:   The lower limit of the input range
 * stop1 :   The upper limit of the input range
 * start2:   The lower limit of the output range
 * stop2 :   The upper limit of the output range
 * type  :   The type of easing (see above)
 * when  :   One of EASE_IN, EASE_OUT, or EASE_IN_OUT
 */
function map2(value, start1, stop1, start2, stop2, type, when) {
  let b = start2;
  let c = stop2 - start2;
  let t = value - start1;
  let d = stop1 - start1;
  let p = 0.5;
  switch (type) {
    case LINEAR:
      return c * t / d + b;
    case SQRT:     
      if (when == EASE_IN) {
        t /= d;
        return c * pow(t, p) + b;
      } else if (when == EASE_OUT) {
        t /= d;
        return c * (1 - pow(1 - t, p)) + b;
      } else if (when == EASE_IN_OUT) {
        t /= d / 2;
        if (t < 1) return c / 2 * pow(t, p) + b;
        return c / 2 * (2 - pow(2 - t, p)) + b;
      }
      break;
    case QUADRATIC:
      if (when == EASE_IN) {
        t /= d;
        return c * t * t + b;
      } else if (when == EASE_OUT) {
        t /= d;
        return -c * t * (t - 2) + b;
      } else if (when == EASE_IN_OUT) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      }
      break;
    case CUBIC:
      if (when == EASE_IN) {
        t /= d;
        return c * t * t * t + b;
      } else if (when == EASE_OUT) {
        t /= d;
        t--;
        return c * (t * t * t + 1) + b;
      } else if (when == EASE_IN_OUT) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
      }
      break;
    case QUARTIC:
      if (when == EASE_IN) {
        t /= d;
        return c * t * t * t * t + b;
      } else if (when == EASE_OUT) {
        t /= d;
        t--;
        return -c * (t * t * t * t - 1) + b;
      } else if (when == EASE_IN_OUT) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t * t + b;
        t -= 2;
        return -c / 2 * (t * t * t * t - 2) + b;
      }
      break;
    case QUINTIC:
      if (when == EASE_IN) {
        t /= d;
        return c * t * t * t * t * t + b;
      } else if (when == EASE_OUT) {
        t /= d;
        t--;
        return c * (t * t * t * t * t + 1) + b;
      } else if (when == EASE_IN_OUT) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t * t * t + 2) + b;
      }
      break;
    case SINUSOIDAL:
      if (when == EASE_IN) {
        return -c * cos(t / d * (PI / 2)) + c + b;
      } else if (when == EASE_OUT) {
        return c * sin(t / d * (PI / 2)) + b;
      } else if (when == EASE_IN_OUT) {
        return -c / 2 * (cos(PI * t / d) - 1) + b;
      }
      break;
    case EXPONENTIAL:
      if (when == EASE_IN) {
        return c * pow(2, 10 * (t / d - 1)) + b;
      } else if (when == EASE_OUT) {
        return c * (-pow(2, -10 * t / d) + 1) + b;
      } else if (when == EASE_IN_OUT) {
        t /= d / 2;
        if (t < 1) return c / 2 * pow(2, 10 * (t - 1)) + b;
        t--;
        return c / 2 * (-pow(2, -10 * t) + 2) + b;
      }
      break;
    case CIRCULAR:
      if (when == EASE_IN) {
        t /= d;
        return -c * (sqrt(1 - t * t) - 1) + b;
      } else if (when == EASE_OUT) {
        t /= d;
        t--;
        return c * sqrt(1 - t * t) + b;
      } else if (when == EASE_IN_OUT) {
        t /= d / 2;
        if (t < 1) return -c / 2 * (sqrt(1 - t * t) - 1) + b;
        t -= 2;
        return c / 2 * (sqrt(1 - t * t) + 1) + b;
      }
      break;
    case ELASTIC:
      let s = 1.70158;
      p = 0;
      let a = c;
      if (when == EASE_IN) {
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
          a = c;
          s = p / 4;
        }
        else s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
      } else if (when == EASE_OUT) {
        let s = 1.70158;
        p = 0;
        let a = c;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
          a = c;
          s = p / 4;
        }
        else s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
      } else if (when == EASE_IN_OUT) {
        let s = 1.70158;
        p = 0;
        let a = c;
        if (t == 0) return b;
        if ((t /= d / 2) == 2) return b + c;
        if (!p) p = d * (.3 * 1.5);
        if (a < Math.abs(c)) {
          a = c;
          s = p / 4;
        }
        else s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
      }
      break;
  };
  return 0;
}

/*
 * A map() replacement that allows for specifying easing curves
 * with arbitrary exponents.
 *
 * value :   The value to map
 * start1:   The lower limit of the input range
 * stop1 :   The upper limit of the input range
 * start2:   The lower limit of the output range
 * stop2 :   The upper limit of the output range
 * v     :   The exponent value (e.g., 0.5, 0.1, 0.3)
 * when  :   One of EASE_IN, EASE_OUT, or EASE_IN_OUT
 */
function map3(value, start1, stop1, start2, stop2, v, when) {
  let b = start2;
  let c = stop2 - start2;
  let t = value - start1;
  let d = stop1 - start1;
  let p = v;
  let out = 0;
  if (when == EASE_IN) {
    t /= d;
    out = c * pow(t, p) + b;
  } else if (when == EASE_OUT) {
    t /= d;
    out = c * (1 - pow(1 - t, p)) + b;
  } else if (when == EASE_IN_OUT) {
    t /= d / 2;
    if (t < 1) return c / 2 * pow(t, p) + b;
    out = c / 2 * (2 - pow(2 - t, p)) + b;
  }
  return out;
}

export {map2 , map3};
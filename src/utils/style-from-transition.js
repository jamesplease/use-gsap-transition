import warning from './warning';

function isNil(val) {
  return typeof val === 'undefined' || val === null;
}

const scalarAttrs = ['opacity', 'pointerEvents', 'z', 'transformOrigin'];
const distanceAttrs = [
  'left',
  'right',
  'top',
  'bottom',
  'width',
  'height',
  'x',
  'y',
];

function styleFromTo(to = {}, index) {
  const result = {};

  const toIsFunction = typeof to === 'function';
  const toToUse = toIsFunction ? to(index) : to;

  // Note: the arrays specified in here are only used for debugging purposes, so they should not be
  // hoisted up above.
  if (process.env.NODE_ENV !== 'production') {
    // These are the "special attributes" of the `vars` argument to TweenMax. They are completely
    // ignored by this library.
    const specialAttrs = [
      'autoCSS',
      'callbackScope',
      'delay',
      'ease',
      'immediateRender',
      'lazy',
      'onComplete',
      'onCompleteParams',
      'onCompleteScope',
      'onStart',
      'onStartParams',
      'onStartScope',
      'onOverwrite',
      'onRepeat',
      'onRepeatScope',
      'onReverseComplete',
      'onReverseCompleteParams',
      'onReverseCompleteScope',
      'onUpdate',
      'onUpdateParams',
      'onUpdateScope',
      'overwrite',
      'paused',
      'repeat',
      'repeatDelay',
      'startAt',
      'useFrames',
      'yoyo',

      // CSS Plugin special props
      'clearProps',
      'autoRound',
      'bezier',
      'autoAlpha',
      'force3D',
    ];
    const customHandlers = ['scale'];
    const percentageAttrs = ['xPosition', 'yPosition'];

    const validKeys = [
      ...scalarAttrs,
      ...distanceAttrs,
      ...customHandlers,
      ...specialAttrs,
    ];

    Object.keys(toToUse).forEach(toKey => {
      if (validKeys.indexOf(toKey) === -1) {
        if (percentageAttrs.indexOf(toKey)) {
          warning(
            `You attempted to tween ${toKey}. Percentage-based translations aren't supported at this time.`,
            'UNSUPPORTED_PERCENTAGE_TWEEN_VALUE'
          );
        } else {
          warning(
            `A unsupported attribute was tweened, ${toKey}. styleFromTo must be updated to support this attribute.`,
            'UNSUPPORTED_TWEEN_VALUE'
          );
        }
      }
    });
  }

  scalarAttrs.forEach(attrName => {
    if (!isNil(toToUse[attrName])) {
      result[attrName] = toToUse[attrName];
    }
  });

  distanceAttrs.forEach(attrName => {
    if (!isNil(toToUse[attrName])) {
      const attrValue = toToUse[attrName];

      let value;
      let unit;
      if (typeof attrValue === 'number') {
        value = attrValue;
        unit = 'px';
      } else if (typeof attrValue === 'string') {
        const split = attrValue.split(/(\d+)/);
        value = split[1];
        unit = split[2];
      }

      result[attrName] = `${value}${unit}`;
    }
  });

  if (!isNil(toToUse.scale)) {
    result.transform = `scale(${toToUse.scale})`;
  }

  return result;
}

export default function styleFromTransition(transition, index) {
  if (Array.isArray(transition)) {
    return (
      transition
        .map(t => {
          const duration = typeof t.duration === 'undefined' ? 0 : t.duration;
          const startTime =
            typeof t.startTime === 'undefined' ? 0 : t.startTime;
          const endTime = startTime + duration;

          return {
            ...t,
            endTime,
          };
        })
        // Sort endTime ascending, so that the last transition
        // has its styles applied over top of earlier transitions
        .sort((a, b) => {
          return a.endTime - b.endTime;
        })
        .reduce((result, t) => {
          return {
            ...result,
            ...styleFromTo(t.to),
          };
        }, {})
    );
  } else {
    return styleFromTo(transition.to, index);
  }
}

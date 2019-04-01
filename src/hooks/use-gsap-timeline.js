import { useEffect, useRef, useState } from 'react';
import { TimelineMax, TweenMax } from 'gsap';
import warning from '../utils/warning';

function generateTimeline({ timelineTransitions, el, defaultDuration = 0 }) {
  let defaultDurationToUse =
    typeof defaultDuration === 'number' ? defaultDuration : 0;

  const childrenEls = [];
  for (let query in timelineTransitions) {
    const val = timelineTransitions[query] || {};

    const childrenEl = query === 'root' ? [el] : el.querySelectorAll(query);
    const childrenArray = Array.from(childrenEl);

    if (process.env.NODE_ENV !== 'production') {
      if (childrenEl.length === 0) {
        warning(
          `Warning: no DOM nodes were located for ${query} within the useGsapTimeline hook.`,
          'TIMELINE_NO_NODES_FOUND'
        );
      }
    }

    childrenEls.push({
      transition: val,
      query,
      nodes: childrenArray,
    });
  }

  const timeline = new TimelineMax({
    paused: true,
  });

  function addTween(childEl, transitionToUse) {
    const durationToUse =
      typeof transitionToUse.duration === 'undefined'
        ? defaultDurationToUse
        : transitionToUse.duration;
    const toDefinition =
      typeof transitionToUse.to === 'undefined' ? {} : transitionToUse.to;
    const startTimeToUse =
      typeof transitionToUse.startTime === 'undefined'
        ? 0
        : transitionToUse.startTime;

    // We must clone the toDefinition here because GSAP mutates the value
    const tween = TweenMax.to(childEl, durationToUse, { ...toDefinition });
    timeline.add(tween, startTimeToUse);
  }

  childrenEls.forEach(child => {
    child.nodes.forEach((childEl, index) => {
      let transitionToUse;
      if (typeof transition === 'function') {
        transitionToUse = child.transition(index);
      } else {
        transitionToUse = child.transition;
      }

      if (process.env.NODE_ENV !== 'production') {
        const validKeys = ['duration', 'to', 'startTime'];

        function validateTransition(transitionToValidate) {
          const computedKeys = Object.keys(transitionToValidate);

          computedKeys.forEach(key => {
            if (validKeys.indexOf(key) === -1) {
              warning(
                `An invalid key, ${key}, was returned from an elTransition. This key was returned for selector ${
                  child.query
                }. Valid keys are ${validKeys.join(', ')}.`,
                `INVALID_NODE_MODE_KEY_${key}`
              );
            }
          });

          if (
            typeof transitionToValidate.duration !== 'undefined' &&
            typeof transitionToValidate.duration !== 'number' &&
            typeof transitionToValidate.duration !== 'function'
          ) {
            warning(
              `An invalid duration was returned from an elTransition for selector ${
                child.query
              }. It must be a function or a number.`,
              `INVALID_NOD_MODE_DURATION`
            );
          }

          if (
            typeof transitionToValidate.startTime !== 'undefined' &&
            typeof transitionToValidate.startTime !== 'number' &&
            typeof transitionToValidate.startTime !== 'function'
          ) {
            warning(
              `An invalid startTime was returned from an elTransition for selector ${
                child.query
              }. It must be a function or a number.`,
              `INVALID_NOD_MODE_START_TIME`
            );
          }

          if (typeof transitionToValidate.to === 'undefined') {
            warning(
              `A "to" value must be returned from an elTransition for selector ${
                child.query
              }. Received undefined instead.`,
              `MISSING_NODE_MODE_TO`
            );
          } else if (
            typeof transitionToValidate.to !== 'object' &&
            typeof transitionToValidate.to !== 'function'
          ) {
            warning(
              `An invalid to was returned from an elTransition for selector ${
                child.query
              }. It must be an object or a number.`,
              `INVALID_NOD_MODE_TO`
            );
          }
        }

        if (Array.isArray(transitionToUse)) {
          transitionToUse.forEach(c => validateTransition(c));
        } else {
          validateTransition(transitionToUse);
        }
      }

      if (Array.isArray(transitionToUse)) {
        transitionToUse.forEach(t => addTween(childEl, t));
      } else {
        addTween(childEl, transitionToUse);
      }
    });
  });

  return timeline;
}

export default function useGsapTimeline({
  timelineTransitions = {},
  nodeRef,
  // NOTE: only used to ensure that the animation doesn't happen too frequently.
  // The values of `to` can be an Array, which change with every render. Derp.
  state = {},
  onComplete,
} = {}) {
  const prevTimeline = useRef();

  const [isMounted, setIsMounted] = useState(false);
  const isMountedRef = useRef(isMounted);

  useEffect(() => {
    if (!isMountedRef.current) {
      return;
    }

    if (prevTimeline.current && prevTimeline.current.isActive()) {
      prevTimeline.current.pause();
    }

    const timeline = new TimelineMax({
      onComplete() {
        onComplete(timelineTransitions);
      },
      paused: true,
    });

    // NOTE: this is not susceptible to stale vars GIVEN that `timelineTransitions` is directly
    // computed from state, and `ref` is, well, a ref.
    timeline.add(
      generateTimeline({
        timelineTransitions,
        el: nodeRef.current,
      }).play(),
      0
    );

    timeline.play();

    prevTimeline.current = timeline;
  }, Object.values(state));

  // It is important that this useEffect follows the primary one
  // to avoid that initial animation on render
  useEffect(() => {
    setIsMounted(true);
    isMountedRef.current = true;
  }, []);
}

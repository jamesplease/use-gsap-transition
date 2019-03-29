import { useState, useEffect, useRef } from 'react';
import useTimelineTransitions from './hooks/use-timeline-transitions';
import useGsapTimeline from './hooks/use-gsap-timeline';
import styleFromTo from './utils/style-from-to';

export default function useGsapTransition({
  // A reference to the parent node for all of the `elTransitions`
  nodeRef,
  // Transitions for elements within `nodeRef` (as well as `nodeRef` itself)
  elTransitions,
  // An initial state object that is used to compute the transitions from
  initialState,
}) {
  // Set up our visual state, and an associated ref for it
  const [state, setState] = useState(initialState);
  const stateRef = useRef();
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // This hook computes the actual transition values from the elTransitions (which are functions)
  const timelineTransitions = useTimelineTransitions(elTransitions, state);

  // This timeline's `to` object is used to compute the styles. It will
  // be out of date _during_ a transition, and then it will be updated.
  // This allows GSAP to control the elements' styles until the transition
  // completes, at which point control over the styles returns to React.
  const [prevTimelineTransitions, setPrevTimelineTransitions] = useState(
    timelineTransitions
  );
  const prevTimelineTransitionsRef = useRef();
  useEffect(() => {
    prevTimelineTransitionsRef.current = prevTimelineTransitions;
  }, [prevTimelineTransitions]);

  // This hook actually performs the transitions whenever the `timelineTransitions` changes.
  useGsapTimeline({
    timelineTransitions,
    state,
    nodeRef,
    onComplete(timelineTransitions) {
      setPrevTimelineTransitions(timelineTransitions);
    },
  });

  return {
    state,
    setState,

    // Heads up: `index` is optional. Valid signatures are:
    //
    // `getPropsForSelector(selector, otherProps);`
    // `getPropsForSelector(selector, index, otherProps)`
    //
    // You call this to get the props for React to render. What it does
    // is update the styles _after_ the transition ends. This is what "hands off"
    // control of the node's styles back to React.
    getPropsForSelector(selector, index, otherProps) {
      const indexIsNumber = typeof index === 'number';
      const indexToUse = indexIsNumber ? index : 0;

      let propsToUse;
      if (indexIsNumber) {
        propsToUse = otherProps;
      } else {
        propsToUse = index;
      }

      propsToUse = propsToUse || {};
      const { className = '', ...rest } = propsToUse;

      const elTransitions = prevTimelineTransitionsRef.current || {};
      const transition = elTransitions[selector] || {};

      let transitionToUse;
      if (typeof transition === 'function') {
        transitionToUse = transition(indexToUse);
      } else {
        transitionToUse = transition;
      }

      const style = styleFromTo(transitionToUse.to, indexToUse);

      let classNameToUse = '';
      if (selector !== 'root') {
        classNameToUse = selector.slice(1);
      }

      const cname = `${classNameToUse} ${className}`;

      return {
        className: cname,
        style,
        ...rest,
      };
    },
  };
}

import { useRef } from 'react';
import usePrevious from './use-previous';
import shallowEquals from '../utils/shallow-equals';

export default function useTimelineTransitions(elTransitions, state) {
  const resultRef = useRef();
  const prevState = usePrevious(state);

  // Consider moving this into useEffect.
  // Notes: this will cause it to be called after the initial render, which may
  // be undesirable.
  // If I want this to run something that might normally be done in a constructor,
  // then I'll need to use `useState`.
  if (!shallowEquals(state, prevState)) {
    const nodeIdentifers = Object.keys(elTransitions);

    const transitions = {};
    nodeIdentifers.forEach(nodeIdentifier => {
      const computed = elTransitions[nodeIdentifier](state, prevState);
      transitions[nodeIdentifier] = computed;
    });

    resultRef.current = transitions;
  }

  return resultRef.current;
}

import { useEffect, useRef, useState } from 'react';
import { TimelineMax } from 'gsap';
import generateTimeline from '../utils/generate-timeline';

export default function useGsapTimeline({
  timelineTransitions = {},
  nodeRef,
  // NOTE: only used to ensure that a timeline isn't created/played too frequently.
  // I could also write a shallow equals for timelineTransitions, but it would need to
  // compare be able to Arrays.
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

    // NOTE: this is _not_ susceptible to stale vars GIVEN that `timelineTransitions` is directly
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
  // to avoid an initial animation on render
  useEffect(() => {
    setIsMounted(true);
    isMountedRef.current = true;
  }, []);
}

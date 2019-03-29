# use-gsap-transition

Declarative React transitions using [GSAP](https://greensock.com/gsap).

✔ Declarative API  
✔ Smart interpolation of transitions  
✔ The performance you would expect from [GSAP](https://greensock.com/gsap)

## Motivation

Sometimes, user interfaces require transitions between different visual states. This can be
made more difficult when the user is able to continue interacting with the interface during
transitions: a transition may need to be canceled, reversed, or it may need to morph
into some other transition.

The level of control required to create this affect is outside of the scope of CSS Transitions
and CSS Animations. And it can be tedious to program this behavior imperatively using JavaScript.

Enter `useGsapTransition`. With this [hook](https://reactjs.org/docs/hooks-intro.html), you define
visual states for your Components _declaratively_, as well as transitions between those states. The
hook handles the rest, creating and managing the transitions between visual states for you.

### Caveats

- Physics-based transitions are not a priority of this library
- This was developed for use in prototypes, rather than production applications
- The documentation is a work in progress

## Installation

Install using [npm](https://www.npmjs.com):

```
npm install use-gsap-transition
```

or [yarn](https://yarnpkg.com/):

```
yarn add use-gsap-transition
```

## Concepts

Understanding these three concepts will help you to be more successful at using `useGsapTransition`.

### `state`

`state` is an object containing arbitrary data that you will use to derive visual properties for elements on your
page. For instance, you might have a `state` with the following structure:

```
{
  isVisible: true,
  focusedIndex: 2
}
```

Based on `isVisible`, you might toggle the `opacity` of some elements. And based on `focusedIndex`, you might render
some elements with a focus indicator (perhaps an `outline` or `border`).

You'll pass an initial `state` into `useGsapTransition`. The hook returns an updater function that allows you to modify
the `state` as the user interacts with the application.

### `elTransitions`

From your `state`, you need to define the visual properties for your elements. You do this using `elTransitions`.

> More coming soon.

## API

> Coming soon.

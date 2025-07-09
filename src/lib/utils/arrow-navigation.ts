import { isButtonDown, isButtonUp } from './buttons';

window.addEventListener('keydown', handleWindowKeydown);

enum Direction {
  Forward = 1,
  Backward = -1,
}

type LookupSelectors = {
  parentSelector: string | null;
  elementSelector: string;
};

const navigationLookup: LookupSelectors[] = [
  { parentSelector: null, elementSelector: '.treeview__folder__button' },
  {
    parentSelector: '#searchbar, .suggestion-item',
    elementSelector:
      '#searchbar__input, .item__link, #suggestions__show-all-link',
  },
];

function handleWindowKeydown(event: KeyboardEvent) {
  if (isButtonUp(event) || isButtonDown(event)) {
    event.stopPropagation();
    event.preventDefault();

    const target = event.target as HTMLElement | null;
    const direction = isButtonDown(event)
      ? Direction.Forward
      : Direction.Backward;

    handleNavigation(target, direction);
  }
}

function handleNavigation(target: HTMLElement | null, direction: Direction) {
  for (const lookup of navigationLookup) {
    const element = findNextNavigatableElement(target, lookup, direction);
    if (element) {
      element.focus();
      break;
    }
  }
}

function findNextNavigatableElement(
  target: HTMLElement | null,
  lookup: LookupSelectors,
  direction: Direction,
): HTMLElement | null {
  // get array of navigatable elements
  const navigatableElements = Array.from(
    document.querySelectorAll<HTMLElement>(lookup.elementSelector),
  );

  // no navigateble elements found
  if (navigatableElements.length === 0) {
    return null;
  }

  // unknown target -> return first navigateble element
  if (target === null || target === document.body) {
    return navigatableElements[0];
  }

  // target is navigatable item -> return next navigatable item from array
  if (target.matches(lookup.elementSelector)) {
    return getNextNavigatableElement(navigatableElements, target, direction);
  }

  // try to find navigatable child element within given parent
  if (lookup.parentSelector) {
    const parent = target.closest(lookup.parentSelector);
    const navigatableChild =
      parent?.querySelector<HTMLElement>(lookup.elementSelector) ?? null;

    if (navigatableChild !== null && direction == Direction.Forward) {
      // return next navigatable element if navigating forwards
      return getNextNavigatableElement(
        navigatableElements,
        navigatableChild,
        direction,
      );
    }

    if (navigatableChild !== null && direction == Direction.Backward) {
      // return child element if navigating backwards
      return navigatableChild;
    }
  }

  // Default: return first navigatable element if navigating forwards
  return direction === Direction.Forward ? navigatableElements[0] : null;
}

function getNextNavigatableElement(
  navigatableElements: HTMLElement[],
  currentElement: HTMLElement,
  direction: Direction,
): HTMLElement | null {
  const currentIndex = navigatableElements.indexOf(currentElement);
  const nextIndex = currentIndex + direction;

  return nextIndex >= 0 && nextIndex < navigatableElements.length
    ? navigatableElements[nextIndex]
    : null;
}

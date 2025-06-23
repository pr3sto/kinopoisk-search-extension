export function isButtonEnter(event: KeyboardEvent) {
  return (
    event.key === 'Enter' || event.code === 'Enter' || event.keyCode === 13
  );
}

export function isButtonEsc(event: KeyboardEvent) {
  return (
    event.key === 'Escape' ||
    event.key === 'Esc' ||
    event.code === 'Escape' ||
    event.code === 'Esc' ||
    event.keyCode === 27
  );
}

export function isButtonDown(event: KeyboardEvent) {
  return (
    event.key === 'ArrowDown' ||
    event.code === 'ArrowDown' ||
    event.keyCode === 40
  );
}

export function isButtonUp(event: KeyboardEvent) {
  return (
    event.key === 'ArrowUp' || event.code === 'ArrowUp' || event.keyCode === 38
  );
}

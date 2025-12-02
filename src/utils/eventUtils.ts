export const dispatchCustomEvent = (eventName: string, detail: any) => {
  if (window) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
};

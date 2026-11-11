export const INTRO_SEEN_KEY = "mahlgrad.intro";

/**
 * Runs in <head> before first paint: marks the intro as seen for this session
 * (or for reduced-motion users) so the overlay never flashes for returning visitors.
 */
export const introGateScript = `try{var r=matchMedia('(prefers-reduced-motion: reduce)').matches;if(r||sessionStorage.getItem('${INTRO_SEEN_KEY}'))document.documentElement.dataset.introSeen='1'}catch(e){}`;

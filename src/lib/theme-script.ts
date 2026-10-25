// Runs inline in <head>, before the first paint: the saved theme, else the
// device setting. Kept apart from lib/theme so the server layout can use it.
export const THEME_KEY = "popsule-theme";

export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}})()`;

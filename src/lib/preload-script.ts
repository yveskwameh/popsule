// Runs inline in <head>. The preloader shows once per visit: later loads in
// the same tab skip it before it can paint. While it shows, the hero intro
// waits (globals.css); a failsafe lets the page go if the app never starts.
export const PRELOADED_KEY = "popsule-loaded";

export const preloadScript = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem("${PRELOADED_KEY}")){d.setAttribute("data-preloaded","");return}}catch(e){}d.setAttribute("data-preload","");setTimeout(function(){d.removeAttribute("data-preload")},9000)})()`;

let windowObjectReference = null; // global variable
let previousURL; /* global variable that will store the url currently in the secondary window */

// basic map of target/screen
const screenMap = {
  secondaryWindow: 1,
};

// https://developer.chrome.com/articles/window-management/
// check for window-management (former window-placement) api
async function getWindowManagementPermissionState() {
  let state;
  // The new permission name.
  try {
    ({ state } = await navigator.permissions.query({
      name: "window-management",
    }));
  } catch (err) {
    if (err.name !== "TypeError") {
      return `${err.name}: ${err.message}`;
    }
    // The old permission name.
    try {
      ({ state } = await navigator.permissions.query({
        name: "window-placement",
      }));
    } catch (err) {
      if (err.name === "TypeError") {
        return "Window management not supported.";
      }
      return `${err.name}: ${err.message}`;
    }
  }
  console.log("checking permission state", state);
  return state;
}

async function openRequestedWindow(url, target) {
  const screenIndex = screenMap[target];
  const { screens } = await window.getScreenDetails();

  // fallback to default screen if screenIndex not discovered
  const screen =
    screens && screens.length >= screenIndex + 1
      ? screens[screenIndex]
      : screens[0];

  const screenPosition = `left=${screen.left},top=${screen.top}`;
  const windowFeatures = `status=no,menubar=no,toolbar=no,width=${screen.availWidth},height=${screen.availHeight},${screenPosition}`;

  if (windowObjectReference === null || windowObjectReference.closed) {
    windowObjectReference = window.open(url, target, windowFeatures);
  } else if (previousURL !== url) {
    windowObjectReference = window.open(url, target, windowFeatures);
    /* if the resource to load is different,
       then we load it in the already opened secondary window and then
       we bring such window back on top/in front of its parent window. */
    windowObjectReference.focus();
  } else {
    windowObjectReference.focus();
  }
  previousURL = url;
  /* explanation: we store the current url in order to compare url
     in the event of another call of this function. */
}

document.querySelector("button").addEventListener("click", async () => {
  console.log("click");
  const state = await getWindowManagementPermissionState();
  const isExtended = window.screen.isExtended;
  const screenDetails = await window.getScreenDetails();

  document.querySelector("#permission").textContent = state;
  document.querySelector(
    "#isExtended"
  ).textContent = `is extended: ${isExtended}`;

  console.log("Screen Details", screenDetails);
});

// discover specific links and enhance functionality
const secondaryLinks = document.querySelectorAll("a[target='secondaryWindow']");
const tertiaryLinks = document.querySelectorAll("a[target='tertiaryWindow']");
const links = [...secondaryLinks, ...tertiaryLinks];

for (const link of links) {
  // enable to open all links on load
  // openRequestedWindow(link.href, link.getAttribute("target"));
  link.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      openRequestedWindow(link.href, link.getAttribute("target"));
    },
    false
  );
}

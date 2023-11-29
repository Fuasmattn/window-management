let windowObjectReference = null; // global variable
let previousURL; /* global variable that will store the url currently in the secondary window */
let cachedScreensLength;

// basic map of target/screen
const screenMap = {
  primaryWindow: 0,
  secondaryWindow: 1,
  tertiaryWindow: 2,
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

function registerScreenChangeListeners(screenDetails) {
  screenDetails.addEventListener("screenschange", (event) => {
    if (screenDetails.screens.length !== cachedScreensLength) {
      console.info(
        `The screen count changed from ${cachedScreensLength} to ${screenDetails.screens.length}`
      );
      cachedScreensLength = screenDetails.screens.length;
    }
  });

  screenDetails.addEventListener("currentscreenchange", async (event) => {
    const details = screenDetails.currentScreen;
    console.info("The current screen has changed.", event, details);
  });
}

async function openRequestedWindow(url, target) {
  const screenIndex = screenMap[target];
  const screenDetails = await window.getScreenDetails();

  registerScreenChangeListeners(screenDetails);

  const { screens } = screenDetails;
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

document
  .querySelector("#fullscreen-btn")
  .addEventListener("click", async () => {
    try {
      const primaryScreen = (await getScreenDetails()).screens.filter(
        (screen) => screen.isPrimary
      )[0];
      await document.body.requestFullscreen({ screen: primaryScreen });
    } catch (err) {
      console.error(err.name, err.message);
    }
  });

document
  .querySelector("#permission-btn")
  .addEventListener("click", async () => {
    const state = await getWindowManagementPermissionState();
    const screenDetails = await window.getScreenDetails();
    const isExtended = window.screen.isExtended;

    document.querySelector(
      "#permission"
    ).textContent = `window-management/placement permission state: ${state}`;
    document.querySelector(
      "#isExtended"
    ).textContent = `Monitor is extended: ${isExtended}`;

    document.querySelector("#screenDetails").textContent = JSON.stringify(
      screenDetails,
      undefined,
      1
    );

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

# Browser-Window-Management

Prototype for autodiscovery of screens and support browser window management for HTML anchor tags.

## Demo
Checkout the code and run with a webserver or see [Live Demo](https://fuasmattn.github.io/window-management/). Open Developer Console for Info Logs and connect additional monitors.

## Compatibility (Experimental)

Builds upon the ScreenDetails API - check the [compatibility table](https://developer.mozilla.org/en-US/docs/Web/API/ScreenDetails#browser_compatibility) or [caniuse.com](https://caniuse.com/mdn-api_screendetails).


### Apple Sidecar

Using an iPad as additional display should work with chrome. However, the `ScreenDetails` change events do not fire when connecting or disconnecting the sidecar.

### Permissions

Requires the user to accept the `window-management` (or former `window-placement`) permission.

# House Party - Utilities Documentation

Go back to the main [README](../../../README.md)

## Contents

- [House Party - Utilities Documentation](#house-party---utilities-documentation)
  - [Contents](#contents)
  - [clickToCopy](#clicktocopy)
  - [clickToShare](#clicktoshare)
  - [cookies](#cookies)
  - [modalHandler](#modalhandler)
  - [qrCode](#qrcode)

<hr>

## clickToCopy

This is used to make it so the user can copy something to the clipboard. The event for the button is handled automatically

```html
  <!-- Copy data stored in the attributes of the button -->
  <button class="btn btn-primary click-to-copy" id="copy-party-url" type="button" copy-data="url">Copy URL</button>

  <!-- Copy the text contents of a specified target -->
  <p id="url">url</p>
  <button class="btn btn-primary click-to-copy-target" copy-target="url" type="button">Copy URL</button>
```

<hr>

## clickToShare

This is used to make it so the user if available can share something using the native share functionality of device. The event for the button is handled automatically

```html
  <button class="click-to-share" id="share-party-url" type="button" data-party-url="url">Share URL</button>
```

<hr>

## cookies

This is used to set, get, delete and extended the life of cookies on the website

```javascript
  // Set cookie
  setCookie(name, value, sameSite = "Strict" | "Lax" | "None", expires = 1, httpOnly = false);
  // Get cookie
  getCookie(name);
  // Delete cookie
  deleteCookie(name);
  // Extend cookie life
  extendCookie(name, days, sameSite = "Strict" | "Lax" | "None", httpOnly = false);
```

<hr>

## modalHandler

This is used to open and close modals on the website

The way the modalHandler works means you do not need to write JS to you can use just HTML and the modalHandler will handle the rest for you. But if you want to open or close a modal using JS you can do so by dispatching an event this way also offers the option to add a callback function.

```html
<div id="myModal" class="modal-background">
  <div class="modal-body">
    <span class="modal-close modal-closer">&times;</span>
    <p>Some text in the Modal..</p>
  </div>
</div>

<button class="modal-opener" modal-target="myModal" type="button">End party</button>
```

```javascript
  // Open modal
  document.dispatchEvent(new CustomEvent('openModal', {
      detail: {
        target: 'myModal',
        callback: () => {
          console.log('Modal opened');
        }
      }
  }));
  // Close modal
  document.dispatchEvent(new Event('closeCurrentModal', {
      detail: {
        callback: () => {
          console.log('Modal closed');
        }
      }
  }));
```

<hr>

## qrCode

This is used to generate a QR code for the user to scan to join the party this library can be found [here](https://davidshimjs.github.io/qrcodejs/)

```html
<div id="qrcode"></div>
<script type="text/javascript">
  new QRCode(document.getElementById("qrcode"), "http://jindo.dev.naver.com/collie");
</script>
```
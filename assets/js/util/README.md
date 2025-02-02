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

<hr>

## clickToShare

<hr>

## cookies

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
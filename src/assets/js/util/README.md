# House Party - Utilities Documentation

Go back to the main [README](../../../../README.md)

## Contents

- [House Party - Utilities Documentation](#house-party---utilities-documentation)
  - [Contents](#contents)
  - [clickToCopy](#clicktocopy)
  - [clickToShare](#clicktoshare)
  - [modalHandler](#modalhandler)
  - [qr-creator](#qr-creator)
  - [collapsibleHandler](#collapsiblehandler)

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
  <button class="click-to-share" id="share-party-url" type="button" share-title="Website name" share-text="Check out this website!" share-url="url">Share URL</button>
```

<hr>

## modalHandler

This is used to open and close modals on the website

The way the modalHandler works means you do not need to write JS to you can use just HTML and the modalHandler will handle the rest for you. But if you want to open or close a modal using JS you can do so by dispatching an event this way also offers the option to add a callback function.

```html
<div id="myModal" class="modal-background">
  <div class="modal-body">
    <span class="modal-closer">&times;</span>
    <p>Some text in the Modal..</p>
  </div>
</div>

<button class="modal-opener" modal-target="myModal" type="button">Open Modal</button>
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

## qr-creator

This is used to generate a QR code for the user to scan to join the party this library can be found [here](https://github.com/nimiq/qr-creator)

<hr>

## collapsibleHandler

This is used to make it so the user can open and close a collapsible section. The events for the collapsible items is handled automatically

```html
<div class="collapsible-container">

    <div class="collapsible-item">
      <span class="collapsible-icon"></span>
      <span class="collapsible-title">Title 1</span>
      <div class="collapsible-content collapsed-content">
          <p>content 1</p>
      </div>
    </div>

    <div class="collapsible-item">
      <span class="collapsible-icon"></span>
      <span class="collapsible-title">Title 2</span>
      <div class="collapsible-content collapsed-content">
          <p>content 2</p>
      </div>
    </div>

</div>
```
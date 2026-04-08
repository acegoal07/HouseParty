# House Party - Utilities Documentation
Go back to the main [README](../../../../README.md)

Go back to JS documentation [here](../README.md)

## Contents
- [House Party - Utilities Documentation](#house-party---utilities-documentation)
  - [Contents](#contents)
  - [clickToCopy](#clicktocopy)
  - [clickToPaste](#clicktopaste)
  - [clickToShare](#clicktoshare)
  - [collapsibleHandler](#collapsiblehandler)
  - [modalHandler](#modalhandler)

---
## clickToCopy
This util is used to make it so the user can copy something to the clipboard. The event for the button is handled automatically. The click to copy util supports two methods of copying data, either copying data stored in the attributes of the button or copying the text contents of a specified target.

```html
<!-- Copy data stored in the attributes of the button -->
<button class="click-to-copy" id="copy-party-url" type="button" data-copy-text="url">Copy URL</button>

<!-- Copy the text contents of a specified target -->
<p id="url">url</p>
<button class="click-to-copy" data-copy-target="url" type="button">Copy URL</button>
```

---
## clickToPaste
This util is used to make it so the user can paste something from the clipboard. The event for the button is handled automatically. The pasted data will be inserted into the text content of a specified target.

```html
<!-- Paste the clipboard contents into the specified target -->
<input type="text" id="paste-target" />

<button class="click-to-paste" data-paste-target="paste-target" type="button">Paste into input</button>
```

---
## clickToShare
This is used to make it so the user if available can share something using the native share functionality of device. The event for the button is handled automatically.

```html
<button class="click-to-share" id="share-party-url" type="button" data-share-title="Website name" data-share-text="Check out this website!" data-share-url="url">Share URL</button>
```

---
## collapsibleHandler
This is used to make collapsible elements that the user can open and close by clicking on them. The events for the collapsible element is handled automatically. You can have as many collapsible items in a group as you want the JS will handle any interrupts triggered when opening a new collapsible automatically closing the already open one.

```html
<div class="collapsible-group">

  <details class="collapsible-item">
    <summary>Example 1</summary>
    <div class="collapsible-content">
        <p>This is the content for example 1</p>
    </div>
  </details>

  <details class="collapsible-item">
    <summary>Example 2</summary>
    <div class="collapsible-content">
        <p>This is the content for example 3</p>
    </div>
  </details>

</div>
```

---
## modalHandler
This is used to open and close modals on the website. The events for opening and closing the modals are handled automatically. If you want to open or close the modals for specific reason which can't be handled by the automatic events you can do so by dispatching an event this way also offers the option to add a callback function.

```html
<!-- Example button which opens the specified modal -->
<button class="modal-opener" data-modal-target="example-modal" type="button" aria-label="open modal">Open modal</button>

<!-- Example modal -->
<dialog class="modal-background" id="example-modal" aria-labelledby="example-title" aria-describedby="example-description">
  <div class="modal-body">
    <h1 id="example-title">End party</h1>
    <p id="example-description">Are you sure you want to end the party?</p>
    <!-- Example of button which can close the modal once its open -->
    <button class="modal-closer" type="button" aria-label="close modal">close modal</button>
  </div>
</dialog>
```

```javascript
// Open modal
document.dispatchEvent(new CustomEvent('openModal', {
  detail: {
      target: 'example-modal',
      callback: () => {
        console.log('Modal opened');
      }
  }
}));

// Close modal (new Event can be used if you don't need a callback function)
document.dispatchEvent(new CustomEvent('closeCurrentModal', {
  detail: {
      callback: () => {
        console.log('Modal closed');
      }
  }
}));
```
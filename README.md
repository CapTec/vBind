# vBind
[![Build Status](https://travis-ci.org/CapTec/vBind.svg?branch=master)](https://travis-ci.org/CapTec/vBind)

vBind allows two way data binding between javascript objects and HTML markup using standardised variable interpolation syntax as found in ES6 template strings.

Usage:
First, create a data object to bind.

```javascript
var boundObject = {
    "greeting": "Hello World! I'm bound!",
    "message": "how are you today?",
    "activated": false,
    "selected": "Item 1",
    "number":1234,
    "template2Label": "Ooogabugga!!"
  };
```

Next, in your main page create a container to inject your HTML template into.
```html
<div id="container1"></div>
```

Create a new template file, e.g. /templates/template1.html which looks like this:
```html
<span>Hello World</span>
<select value="${selected}">
  <option>Item 1</option>
  <option>Item 2</option>
</select>
<input value="${greeting}" type="text" />
<input value="${message}" type="text" />
<input checked="${activated}" type="checkbox" />
<input value="${number}" type="number" />
<label>${template2Label}</label>
```

And finally create a new Template instance, passing in the path to a template, the container we wish to use, the data to bind against and a model name.
```javascript
var temp1 = new Template({
    path: './templates/template1.html',
    container: '#container1',
    data: boundObject,
    model: "boundObject"
  });
```

Markup that uses variable interpolation must be formatted similarly to as if it was a standard ES6 template string, where variables are stored within "${variable}".

vBind reflects changes made to bound object properties in real time. It wraps the getter and setter functions for bound properties and publishes change events to an eventing system when changes are made. This means that changing a property on the underlying bound object using javascript will immediately be reflected on the UI with no need for any manual intervention.

# Proof of concept - seats.io in React Native

This repo contains a proof-of-concept, that shows how you can render seats.io floor plans in a react-native environment. It uses [React Native Webview](https://github.com/react-native-webview/react-native-webview) as an embedded browser.  

Feel free to copy & paste [this class](./SeatsioSeatingChart.js) into your project, and adapt as you see fit. 

To use this component, simply do:

```html
<SeatsioSeatingChart
        workspaceKey="publicDemoKey"
        event="smallTheatreEvent2"
        <!-- any other renderer config parameters you might need -->
/>
```

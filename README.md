# seatsio-react-native

This is very much work in progress, and by no means ready to be used.


# Run the examples

```shell
cd example/
npm install

# iOS
npx pod-install
npx react-native run-ios

```

# Clean run when developing the component 

```shell
rm -rf ./node_modules
rm -rf ./example/node_modules
rm -rf ./example/ios/Pods

npm install
cd example
npm install
npx pod-install
npx react-native run-ios
```

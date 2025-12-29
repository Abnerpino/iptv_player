# About the app
Android IPTV mobile app built with JSX in React Native. Local storage is handled by Realm, and cloud storage by FireStore.

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting app

Link => Coming soon

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 0: Install all dependencies

Run the following command in the console, make sure you are in the project root directory.

```bash
# using npm
npm install

# OR using Yarn
yarn install
```

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio.

### IMPORTANT NOTE

You must create your project in Firebase (and your database in Firestore) and link it to this project for it to work:

=> Database: 'default'

=> Collections: 'clients', 'notifications', 'resellers' and 'keys'.

=> Fields: The 'clients' fields are specified in the 'handleRegisterDevice' function of 'screen_activation.jsx' (the 'force_update' field triggers a 'silent notification' that forces the update of client information). The 'notifications' fields are two: 'clients_id' (to store the IDs of the clients to whom you want to show the notification), of type Array of Strings, and 'message' (to store the notification message), of type String. The 'resellers' fields are six: 'bank', 'country_code', 'email', 'name', 'number_card' and 'whatsapp', all of type String. The 'keys' fields are two: 'key' and 'type' ('TMDB' for example), both of type String.

You must download the 'google-services.json' file generated with your FireStore configurations and add it to the 'android/app/' folder of your project.

Cloud Run Functions (2nd Generation) must also be implemented, which can be found in the following project:

Link => [Firebase-Functions](https://github.com/Abnerpino/firebase-functions)

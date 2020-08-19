# Mosaico V2 Firebase functions

To work with firebase cloud functions locally, you will need to install the Firebase CLI:

    npm install -g firebase-tools

This installs the globally available firebase command. To update to the latest version of firebase-tools, rerun the same command.

## Login with Firebase

From the command line, type `firebase login` and follow the prompts.

To read more about Firebase Cloud Functions, see the [getting started](https://firebase.google.com/docs/functions/get-started) guide.

## Environment variables

To pull firebase environment variables into your local environment for testing:

    firebase functions:config:get > .runtimeconfig.json
    # If using Windows PowerShell, replace the above with:
    # firebase functions:config:get | ac .runtimeconfig.json
    firebase functions:shell

### Instagram credentials

To set instagram credentials for use in firebase functions, run the following with the proper Client ID and Secret:

    firebase functions:config:set instagram.client_id="__client-id__" instagram.client_secret="__client-secret__" --project mosaico-v2

## 🚀 Deploy cloud functions

If you would like to run an emulator locally to test your cloud functions, run the following:

    firebase emulators:start --only functions

When ready to deploy, issue the following:

    firebase deploy --only functions

const functions = require('firebase-functions');
const url = require('url');
const admin = require('firebase-admin');
const axios = require('axios');
const FormData = require('form-data');

admin.initializeApp(functions.config().firebase);

exports.authLinkRedirect = functions.https.onRequest((request, response) => {
  const { query } = url.parse(request.url, true);
  const { redirectUrl, ...rest } = query;

  if (redirectUrl) {
    const Location = url.format({ pathname: redirectUrl, query: rest });
    response.writeHead(302, { Location });
    response.end(`Redirecting to ${Location}`);
  } else {
    response.writeHead(400);
    response.end('You must provide a `redirectUrl` in the query');
  }
});

// On sign up.
exports.processSignUp = functions.auth.user().onCreate((user) => {
  console.log(user);
  // Check if user meets role criteria:
  // Your custom logic here: to decide what roles and other `x-hasura-*` should the user get
  const customClaims = {
    'https://hasura.io/jwt/claims': {
      'x-hasura-default-role': 'user',
      'x-hasura-allowed-roles': ['user'],
      'x-hasura-user-id': user.uid,
    },
  };

  // Set custom user claims on this newly created user.
  return admin
    .auth()
    .setCustomUserClaims(user.uid, customClaims)
    .then(() => {
      // Update real-time database to notify client to force refresh.
      // const metadataRef = admin.database().ref('metadata/' + user.uid);
      // Set the refresh time to the current UTC timestamp.
      // This will be captured on the client to force a token refresh.
      return metadataRef.set({ refreshTime: new Date().getTime() });
    })
    .catch((error) => {
      console.log(error);
    });
});

/**
 * Exchanges a given Instagram auth code passed in the 'code' URL query
 * parameter for a short-lived access token. The access token is then used
 * to request a long-lived token.
 */
exports.instagramToken = functions.https.onRequest(async (req, res) => {
  const secret = functions.config().instagram.client_secret;

  try {
    const shortTokenForm = new FormData();
    shortTokenForm.append('client_id', functions.config().instagram.client_id);
    shortTokenForm.append('client_secret', secret);
    shortTokenForm.append('code', req.query.code);
    shortTokenForm.append('grant_type', 'authorization_code');
    shortTokenForm.append('redirect_uri', req.query.redirect_uri);

    const shortTokenResult = await axios({
      method: 'post',
      url: 'https://api.instagram.com/oauth/access_token',
      data: shortTokenForm.getBuffer(),
      headers: shortTokenForm.getHeaders(),
    });

    const longTokenResult = await axios({
      method: 'get',
      url: 'https://graph.instagram.com/access_token',
      params: {
        client_secret: secret,
        access_token: shortTokenResult.data.access_token,
        grant_type: 'ig_exchange_token',
      },
    });

    return res.status(200).type('application/json').send(longTokenResult.data);
  } catch (error) {
    return res.type('application/json').send(error.response.data);
  }
});

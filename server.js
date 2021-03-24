const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const auth = {
    clientID: 'NsZvhkQvZOWwXT2rcA1RWGgA7YxxhsJZ',
    clientSecret: '6TX3k_qmCyFH_CiI72QwZlKpk8fqE5GfZjGLYhxsXLxc0b3dQslTG-kY6x5tV6Tg',
    redirectUri: 'http://localhost:3000/auth',
    domain: 'blox-infra.eu.auth0.com',
    scope: 'openid profile email offline_access'
}

const loadAuthToken = async (code) => {
    const { clientID, clientSecret, redirectUri, domain, scope } = auth;

    const exchangeOptions = {
        grant_type: 'authorization_code',
        client_id: clientID,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        scope
    };

    try {
        const response = await axios({
            url: `https://${domain}/oauth/token`,
            method: 'post',
            data: exchangeOptions,
            responseType: 'json',
        });
        return response.data;
    } catch (error) {
        return Error(error);
    }
};

app.get('/api/token', async (req, res) => {
    res.send(await loadAuthToken(req.query.code));
});

if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/build')));

    // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}
app.listen(port, () => console.log(`Listening on port ${port}`));

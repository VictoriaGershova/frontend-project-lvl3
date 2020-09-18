import axios from 'axios';

const corsAPIHost = 'cors-anywhere.herokuapp.com';
const corsAPIUrl = `https://${corsAPIHost}/`;

const getRSS = (link) => {
  const url = `${corsAPIUrl}${link}`;
  return axios
    .get(url, { timeout: 10000 })
    .catch((err) => {
      err.name = 'NetworkError';
      throw err;
    });
};

export default getRSS;

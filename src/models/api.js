import axios from 'axios';

const corsAPIHost = 'cors-anywhere.herokuapp.com';
const corsAPIUrl = `https://${corsAPIHost}/`;

const getRSSData = (link) => {
  const url = `${corsAPIUrl}${link}`;
  return axios.get(url, { timeout: 10000 })
    .catch((err) => {
      err.name = 'NetworkError';
      if (err.response) {
        err.message = `network_${err.response.status}`;
      }
      throw err;
    })
    .then((res) => {
      const { data } = res;
      return data
    });
};

export default getRSSData;

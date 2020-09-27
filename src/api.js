import axios from 'axios';

const corsAPIHost = 'hidden-lake-93699.herokuapp.com';
const corsAPIUrl = `https://${corsAPIHost}/`;

const getRSSData = (link) => {
  const url = `${corsAPIUrl}${link}`;
  return axios.get(url, { timeout: 10000 })
    .then((res) => {
      const { data } = res;
      return data
    }).catch((err) => {
      err.name = 'NetworkError';
      if (err.response) {
        err.message = `network_${err.response.status}`;
      }
      throw err;
    });
};

export default getRSSData;

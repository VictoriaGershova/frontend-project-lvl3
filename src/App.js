import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';

const schema = yup.object().shape({
  rSSLink: yup.string().required()
    .url()
    .when('$channels', (channels, schema) => {
      if (channels.length === 0) {
        return schema;
      }
      const existedURLs = channels.map(({ link }) => link);
      return schema.notOneOf(existedURLs, 'The RSS link is already in your channel list.')
    }),
});

const validate = (fields, channels) => schema
  .validate(fields, { abortEarly: false, context: { channels } })
  .catch((err) => {
    throw err;
  });

const getRSSChannel = (url) => axios.get(url)
  .catch((err) => {
    err.name = 'NetworkError';
    throw err;
  });

const parse = (data) => {
  const xmlData = new DOMParser().parseFromString(data, 'text/xml');
  const parsererror = xmlData.querySelector('parsererror');
  if (parsererror !== null) {
    const err = new Error('Parser error')
    err.name = 'ParserError';
    throw err;
  }

  const channelTag = xmlData.querySelector('channel');
  const channelTitle = channelTag.querySelector('title').textContent;
  const channelDescription = channelTag.querySelector('description').textContent;

  const items = xmlData.querySelectorAll('item');
  if (!items) {
    return { channelTitle, channelDescription };
  }
  const posts = [...items].map((item) => {
    const link = item.querySelector('link').textContent;
    const title = item.querySelector('title').textContent;
    return { link, title };
  });
  const channel = { channelTitle, channelDescription, posts };
  return channel;
};

const App = () => {
  const state = {
    form: {
      processState: 'filling',
      isValid: true,
      validationErrors: [],
      fields: {
        rSSLink: '',
      },
    },
    errorMessage: null,
    channels: [],
    posts: [],
  };

  const handleErrors = (err) => {
    const { name } = err;
    switch (name) {
      case 'ValidationError':
        const { errors } = err;
        state.form.processState = 'filling';
        state.form.isValid = false;
        state.form.validationErrors = [...errors];
        break;
      case 'NetworkError':
        state.form.processState = 'filling';
        state.errorMessage = 'The network problem was occurred. Try again.';
        break;  
      case 'ParserError':
        state.form.processState = 'filling';
        state.errorMessage = 'The problem parsing the server response was occurred. Try again or enter an another RSS link.';
        break;
      default:
        throw err;
    }
  };

  const handleSubmit = () => {
    const { channels, form: { fields } } = state;
    state.form.processState = 'validation';
    validate(fields, channels)
      .then(() => {
        state.form.isValid = true;
        state.form.processState = 'processing';
        state.form.validationErrors = [];
        return getRSSChannel(fields.rSSLink);
      })
      .then((res) => {
        const { data } = res;
        return parse(data);
      })
      .then((channel) => {
        const { form: { fields: { rSSLink: link } } } = state;
        const { channelTitle, channelDescription, posts } = channel;
        const channelId = _.uniqueId();
        const newChannel = { id: channelId, link, channelTitle, channelDescription };
        const newPosts = posts.map((post) => ({ id: _.uniqueId(), channelId, ...post }));
        state.channels.push(newChannel);
        state.posts.push(...newPosts);
      })
      .then(() => {
        state.form.processState = 'filling';
        state.errorMessages = [];
        state.form.fields.rSSLink = '';
      })
      .catch((err) => handleErrors(err));
  };

  const newRSSLinkForm = document.querySelector('.rss-form');
  const rSSLinkInput = document.getElementById('rSSLink');

  rSSLinkInput.addEventListener('input', (e) => {
    const { target: { value } } = e;
    state.form.fields.rSSLink = value;
  })

  newRSSLinkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit();
  });

};

export default App;

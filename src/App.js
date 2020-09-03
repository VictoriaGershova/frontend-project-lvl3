import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import render from './view/index';
import onChange from 'on-change';

const schema = yup.object().shape({
  newLink: yup.string().required()
    .url()
    .when('$channels', (channels, schema) => {
      if (channels.length === 0) {
        return schema;
      }
      const existedChannelLinks = channels.map(({ link }) => link);
      return schema.notOneOf(existedChannelLinks)
    }),
});

const validate = ({ newLink }, channels) => schema
  .validate({ newLink }, { abortEarly: false, context: { channels } })
  .catch((err) => {
    err.message = 'this must be a valid URL';
    throw err;
  });

const getFeeds = (url) => axios.get(url, { timeout: 10000 })
  .catch((err) => {
    err.name = 'NetworkError';
    throw err;
  });

const parse = (data) => {
  const xmlData = new DOMParser().parseFromString(data, 'text/xml');
  const parsererror = xmlData.querySelector('parsererror');
  if (parsererror !== null) {
    const err = new Error('Parser error');
    err.name = 'ParserError';
    err.message = 'The problem parsing the server response: try again or enter an another URL';
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
    const postlink = item.querySelector('link').textContent;
    const postTitle = item.querySelector('title').textContent;
    const newPost = {
      link: postlink,
      title: postTitle,
    };
    return newPost;
  });

  const newChannel = {
    title: channelTitle,
    description: channelDescription,
    posts,
  };
  
  return newChannel;
};

const App = () => {
  const state = {
    appState: 'filling',
    newLink: '',
    errorMessage: null,
    feeds: {
      channels: [],
      posts: [],
    },
  };

  const elements = {
    newChannelForm: document.querySelector('.rss-form'),
    newLinkInput: document.getElementById('newLinkInput'),
    submitBtn: document.getElementById('submit'),
    feedbackContainer: document.querySelector('div.feedback'),
    feedsContainer: document.querySelector('div.feeds'),
  };

  const watchedState = onChange(state, (path) => {
    if (path === 'appState') {
      render(state, elements);
    }
  });

  const handleErrors = (err) => {
    const { name, message } = err;
    if (['ValidationError', 'NetworkError','ParserError'].includes(name)) {
      watchedState.errorMessage = message;
      watchedState.appState = 'failed';
      return;
    }
    throw err;
  };

  const handleSubmit = () => {
    const { feeds: { channels }, newLink } = watchedState;
    watchedState.appState = 'processing';
    watchedState.errorMessage = null;
    validate({ newLink }, channels)
      .then(() => getFeeds(newLink))
      .then((res) => {
        const { data } = res;
        return parse(data);
      })
      .then((channel) => {
        const { title, description, posts } = channel;
        const channelId = _.uniqueId();
        const newChannel = { id: channelId, link: newLink, title, description };
        const newPosts = posts.map((post) => ({ id: _.uniqueId(), channelId, ...post }));
        watchedState.feeds.channels.push(newChannel);
        watchedState.feeds.posts.push(...newPosts);
      })
      .then(() => {
        watchedState.newLink = '';
        watchedState.appState = 'processed';
      })
      .catch((err) => handleErrors(err));
  };

  const handleInput = (e) => {
    const { target: { value } } = e;
    const { appState } = watchedState;
    if (appState !== 'filling') {
      watchedState.appState = 'filling';
    }
    watchedState.newLink = value;
  };

  elements.newLinkInput.addEventListener('input', (e) => handleInput(e));
  elements.newChannelForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit();
  });
};

export default App;

import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import render from './view';
import onChange from 'on-change';

const schema = yup.object().shape({
  newLink: yup.string().required().url()
    .when('$channels', (channels, schema) => {
      if (channels.length === 0) {
        return schema;
      }
      const existedLinks = channels.map(({ link }) => link);
      return schema.notOneOf(existedLinks)
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
  const newChannel = {
    title: '',
    description: '',
    posts: [],
  };

  const channelTag = xmlData.querySelector('channel');
  if (channelTag !== null) {
    const titleTag = channelTag.querySelector('title');
    const descriptionTag = channelTag.querySelector('description');
    newChannel.title = !titleTag ? '' : titleTag.textContent;
    newChannel.description = !descriptionTag ? '' : descriptionTag.textContent;
  }

  const items = xmlData.querySelectorAll('item');
  if (!items) {
    return newChannel;
  }

  const posts = [...items].map((item) => {
    const postlinkTag = item.querySelector('link');
    const postTitleTag = item.querySelector('title');
    const newPost = {
      link: !postlinkTag ? '' : postlinkTag.textContent,
      title: !postTitleTag ? '' : postTitleTag.textContent,
    };
    return newPost;
  });

  return { ...newChannel, posts };
};

const initApp = () => {
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

    watchedState.errorMessage = null;
    watchedState.appState = 'processing';
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
        const newPosts = posts.map((post) => ({ ...post, id: _.uniqueId(), channelId }));
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

export default initApp;

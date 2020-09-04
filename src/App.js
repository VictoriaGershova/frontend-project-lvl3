import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import render from './view';
import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales';

i18next.init({
  lng: 'en',
  debug: true,
  resources,
}).then((t) => {
  document.querySelector('.rss-title').textContent = i18next.t('rssTitle');
  document.querySelector('.rss-sign').textContent = i18next.t('rssSign');
  document.getElementById('example').textContent = i18next.t('example');
  document.getElementById('newLinkInput').setAttribute('placeholder', i18next.t('rssLinkPlaceholder'));
});

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
    err.message = i18next.t('errorsMessages.validationError');
    throw err;
  });

const corsAPIHost = 'cors-anywhere.herokuapp.com';

const corsAPIUrl = `https://${corsAPIHost}/`;

const getFeeds = (link) => {
  const url = `${corsAPIUrl}${link}`;
  return axios.get(url, { timeout: 10000 })
  .catch((err) => {
    err.name = 'NetworkError';
    throw err;
  });
};

const parse = (data) => {
  const xmlData = new DOMParser().parseFromString(data, 'text/xml');

  const parsererrorTag = xmlData.querySelector('parsererror');
  if (parsererrorTag !== null) {
    const err = new Error();
    err.name = 'ParserError';
    err.message = i18next.t('errorsMessages.parserError');
    throw err;
  }

  const channel = {
    title: '',
    description: '',
    items: [],
  };

  const channelTag = xmlData.querySelector('channel');
  if (channelTag !== null) {
    const titleTag = channelTag.querySelector('title');
    const descriptionTag = channelTag.querySelector('description');
    channel.title = !titleTag ? '' : titleTag.textContent;
    channel.description = !descriptionTag ? '' : descriptionTag.textContent;
  }

  const itemTags = xmlData.querySelectorAll('item');
  if (!itemTags) {
    return channel;
  }

  const items = [...itemTags].map((itemTag) => {
    const itemLinkTag = itemTag.querySelector('link');
    const itemTitleTag = itemTag.querySelector('title');
    const item = {
      link: !itemLinkTag ? '' : itemLinkTag.textContent,
      title: !itemTitleTag ? '' : itemTitleTag.textContent,
    };
    return item;
  });

  return { ...channel, items };
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

  const addNewChannel = ({ link, title, description }) => {
    const id = _.uniqueId();
    const newChannel = { id, link, title, description };
    watchedState.feeds.channels.push(newChannel);
    return id;
  };

  const addNewPosts = (channelId, items) => {
    const { feeds: { posts } } = state;
    const channelPosts = posts.filter((post) => post.channelId === channelId);
    const newItems = _.differenceBy(items, channelPosts, ({ title, link }) => ({ title, link }));
    if (newItems.length === 0) {
      return;
    }
    const newPosts = newItems.map((item) => ({ ...item, id: _.uniqueId(), channelId }));
    watchedState.feeds.posts.push(...newPosts);
  };

  const handleRequest = () => {
    const { feeds: { channels } } = state;
    channels.forEach((channel) => {
      const { id: channelId, link } = channel;
      getFeeds(link)
        .then((res) => {
          const { data } = res;
          return parse(data);
        })
        .then(({ items }) => addNewPosts(channelId, items))
        .then(() => setTimeout(() => handleRequest(), 1000))
        .catch((err) => console.log(err));
    });
  };

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
        const { title, description, items } = channel;
        const channelId = addNewChannel({ link: newLink, title, description });
        addNewPosts(channelId, items);
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
  handleRequest();
};

export default initApp;

import 'bootstrap/dist/css/bootstrap.min.css';
import i18n from 'i18next';
import { getNewFeed, getFeedsUpdate } from './rss';
import onChange from 'on-change';
import resources from './locales';
import { renderForm, renderFeeds } from './view';
import validate from './models/validation';

const runApp = () => {
  const appState = {
    processes: {
      creating: {
        state: 'filling',
        validState: 'valid',
        form: { link: '' },
        error: null,
      },
      update: { state: 'waiting' },
    },
    data: {
      feeds: {
        channels: [],
        posts: [],
      },
    },
  };

  const elements = {
    rssTitle: document.querySelector('.rss-title'),
    rssSign: document.querySelector('.rss-sign'),
    rssForm: document.querySelector('.rss-form'),
    linkInput: document.getElementById('link'),
    linkExample: document.getElementById('example'),
    submitBtn: document.getElementById('submit'),
    feedsContainer: document.querySelector('.feeds'),
    feedbackContainer: document.querySelector('.feedback'),
  };

  const watchedCreating = onChange(appState.processes.creating, (path, value) => {
    if (path === 'state') {
      renderForm(appState.processes.creating, elements);
      if (value === 'processed') {
        renderFeeds(appState.data.feeds, elements.feedsContainer);
      }
    }
  });

  const watchedUpdate = onChange(appState.processes.update, (path, value) => {
    if (path === 'state' && value === 'processed') {
      renderFeeds(appState.data.feeds, elements.feedsContainer);
    }
  });

  const handleError = (err) => {
    const { name, message } = err;
    switch (name) {
      case 'NetworkError':
      case 'ParserError':
        watchedCreating.error = message;
        break;
      case 'ValidationError':
        watchedCreating.validState = 'invalid';
        watchedCreating.error = message;
        break;
      default:
        console.log(err);
    };
  };

  const handleSubmit = () => {
    const {
      processes: {
        creating: {
          form: { link },
        },
      },
      data: { feeds },
    } = appState;
    watchedCreating.state = 'validation';
    return validate({ link }, feeds.channels)
      .then(() => {
        watchedCreating.validState = 'valid';
        watchedCreating.error = null;
        watchedCreating.state = 'processing';
      })
      .then(() => getNewFeed(link))
      .then((feed) => {
        const { channel, channelPosts } = feed;
        appState.data.feeds.channels.push(channel);
        appState.data.feeds.posts.push(...channelPosts);
        watchedCreating.state = 'processed';
      })
      .catch((err) => {
        handleError(err);
        watchedCreating.state = 'failed';
      })
      .then(() => watchedCreating.state = 'filling');
  };

  const handleLinkInput = (e) => {
    const { target: { value } } = e;
    watchedCreating.form.link = value;
  };

  const runUpdateFeeds = () => {
    watchedUpdate.state = 'processing';
    const { data: { feeds } } = appState;
    getFeedsUpdate(feeds)
      .then((newPosts) => {
        appState.data.feeds.posts.push(...newPosts);
        watchedUpdate.state = 'processed';
      })
      .catch(() => watchedUpdate.state = 'failed')
      .then(() => {
        setTimeout(() => runUpdateFeeds(), 5000);
        watchedUpdate.state = 'waiting';
      });
  };

  i18n.init({
    lng: 'en',
    debug: true,
    resources,
  }).then(() => {
    elements.rssTitle.textContent = i18n.t('title');
    elements.rssSign.textContent = i18n.t('sign');
    elements.linkInput.setAttribute('placeholder', i18n.t('link.placeholder'));
    elements.linkExample.textContent = i18n.t('link.example');
    elements.rssForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSubmit();
    });
    elements.linkInput.addEventListener('input', (e) => handleLinkInput(e));
    runUpdateFeeds();
  });
};

runApp();

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
      channels: [],
      posts: [],
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

  const handleCreatingState = () => {
    const { processes: { creating: processState }, data } = appState;
    renderForm(processState, elements);
    renderFeeds(processState, data, elements.feedsContainer);
  };

  const handleUpdateState = () => {
    const { processes: { update: processState }, data } = appState;
    renderFeeds(processState, data, elements.feedsContainer);
  };

  const watchedState = onChange(appState.processes, (path) => {
    switch (path) {
      case 'creating.state':
        handleCreatingState();
        break;
      case 'update.state':
        handleUpdateState();
        break;
    }
  });

  const handleError = (err) => {
    const { name, message } = err;
    switch (name) {
      case 'NetworkError':
      case 'ParserError':
        watchedState.creating.error = message;
        break;
      case 'ValidationError':
        watchedState.creating.validState = 'invalid';
        watchedState.creating.error = message;
        break;
      default:
        throw err;
    };
  };

  const handleSubmit = () => {
    const {
      processes: {
        creating: {
          form: { link },
        },
      },
      data: { channels },
    } = appState;
    watchedState.creating.state = 'validation';
    return validate({ link }, channels)
      .then(() => {
        watchedState.creating.validState = 'valid';
        watchedState.creating.error = null;
        watchedState.creating.state = 'processing';
      })
      .then(() => getNewFeed(link))
      .then(({ channel, channelPosts }) => {
        appState.data.channels.unshift(channel);
        appState.data.posts.unshift(...channelPosts);
        watchedState.creating.state = 'processed';
      })
      .catch((err) => {
        handleError(err);
        watchedState.creating.state = 'failed';
      })
      .then(() => watchedState.creating.state = 'filling');
  };

  const handleLinkInput = (e) => {
    const { target: { value } } = e;
    watchedState.creating.form.link = value;
  };

  const runUpdateFeeds = () => {
    watchedState.update.state = 'processing';
    const { data } = appState;
    getFeedsUpdate(data)
      .then((newPosts) => {
        appState.data.posts.unshift(...newPosts);
        watchedState.update.state = 'processed';
      })
      .catch(() => watchedState.update.state = 'failed')
      .then(() => {
        setTimeout(runUpdateFeeds, 5000);
        watchedState.update.state = 'waiting';
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

import i18n from 'i18next';
import onChange from 'on-change';
import render from './render';
import validate from './validation';

export default ({ createFeed, getFeeds }) => {
  const state = {
    processState: 'initialization',
    validState: 'valid',
    link: '',
    feedbackMessage: '',
    feeds: null,
  };

  const watchedState = onChange(state, (path) => {
    if (path === 'processState') {
      alert(getFeeds().channels);
      render(state);
    }
  });

  const handleError = (err) => {
    const { name } = err;
    switch (name) {
      case 'ValidationError':
        const { errors } = err;
        const [currentError] = errors;
        watchedState.feedbackMessage = i18n.t([`error.${currentError}`, 'unspecific']);
        watchedState.validState = 'invalid';
      case 'ParserError':
        watchedState.feedbackMessage = i18n.t('error.parser');
      case 'NetworkError':
        const { message } = err;
        watchedState.feedbackMessage = message;
      default:
        throw err;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { link } = state;
    const { channels } = getFeeds();
    watchedState.processState = 'validation';
    return validate({ link }, channels)
      .then(() => {
        watchedState.validState = 'valid';
        watchedState.feedbackMessage = '';
        watchedState.processState = 'processing';
        createFeed(link);
      })
      .then(() => {
        watchedState.feeds = getFeeds();
        watchedState.processState = 'processed';
      })
      .catch((err) => {
        handleError(err);
        watchedState.processState = 'failed';
      });
  };

  const handleLinkInput = (e) => {
    const { target: { value } } = e;
    const { processState } = state;
    if (processState !== 'filling') {
      watchedState.processState = 'filling';
    }
    watchedState.link = value;
  };

  render(state, handleLinkInput, handleSubmit);
};

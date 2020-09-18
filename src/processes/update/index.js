import onChange from 'on-change';
import { renderFeeds } from '../../views';

export default ({ updateFeeds, getFeeds }) => {
  const state = {
    processState: 'waiting',
    feedbackMessage: '',
  };

  const watchedState = onChange(state, (path) => {
    if (path === 'processState') {
      const feeds = getFeeds();
      renderFeeds(feeds);
    }
  });

  const processUpdateFeeds = () => {
    watchedState.state = 'processing';
    updateFeeds()
      .then(() => watchedState.state = 'processed')
      .catch(() => watchedState.state = 'failed')
      .then(() => {
        setTimeout(() => processUpdateFeeds());
        watchedState.state = 'waiting';
      });
  };
};

import {
  renderNewFeedForm,
  renderFeeds,
  getFeedbackElement,
 } from '../../views';

export default (state, onLinkInput, onSubmit) => {
  const {
    processState,
    feedbackMessage,
    feeds,
  } = state;
  
  const feedback = getFeedbackElement();

  switch (processState) {
    case 'initialization':
      renderNewFeedForm(state, onLinkInput, onSubmit);
      break;

    case 'filling':
    case 'validation':
      renderNewFeedForm(state);
      break;

    case 'processing':
      renderNewFeedForm(state);
      feedback.clean();
      break;

    case 'processed':
      renderNewFeedForm(state);
      feedback.success(feedbackMessage);
      renderFeeds(feeds);
      break;

    case 'failed':
      renderNewFeedForm(state);
      feedback.fail(feedbackMessage);
      break;
    
    default:
      throw new Error(`Unknown NewFeedForm state: "${processState}"`);
  }
};

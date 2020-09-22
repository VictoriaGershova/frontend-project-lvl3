import i18n from 'i18next';

const renderFeedback = (container, type = 'empty', message = '') => {
  container.classList.toggle('text-danger', type === 'fail');
  container.classList.toggle('text-success', type === 'success');
  container.textContent = message;
};

const renderPostItem = ({ link, title }, container) => {
  const linkEl = document.createElement('A');
  linkEl.setAttribute('href', link);
  linkEl.setAttribute('target', '_blank');
  linkEl.classList.add('list-group-item', 'list-group-item-action', 'bg-light');
  linkEl.textContent = title;
  container.appendChild(linkEl);
};

const renderFeedItem = ({ title }, posts, container) => {
  const feedEl = document.createElement('DIV');
  feedEl.classList.add('card', 'bg-light', 'mb-3');
  const feedBodyEl = document.createElement('DIV');
  feedBodyEl.classList.add('card-body');

  const titleEl = document.createElement('H2');
  titleEl.classList.add('card-title');
  titleEl.textContent = title;
  feedBodyEl.appendChild(titleEl);

  const postsContainer = document.createElement('DIV')
  postsContainer.classList.add('list-group', 'list-group-flush');
  feedBodyEl.appendChild(postsContainer);

  feedEl.appendChild(feedBodyEl);
  container.appendChild(feedEl);
  posts.forEach((post) => renderPostItem(post, postsContainer));
};

export const renderFeeds = (processState, { channels, posts }, container) => {
  const { state } = processState;
  if (state !== 'processed') {
    return;
  }
  container.textContent = '';
  channels.forEach((channel) => {
    const { id } = channel;
    const channelPosts = posts.filter(({ channelId }) => channelId === id);
    renderFeedItem(channel, channelPosts, container);
  });
};

export const renderForm = (processState, elements) => {
  const {
    state,
    validState,
    error,
  } = processState;

  const {
    rssForm,
    linkInput,
    submitBtn,
    feedbackContainer,
  } = elements;

  switch (state) {
    case 'filling':
      linkInput.removeAttribute('readonly');
      submitBtn.removeAttribute('disabled');
      break;

    case 'validation':
      linkInput.setAttribute('readonly', '');
      submitBtn.setAttribute('disabled', '');
      break;

    case 'processing':
      linkInput.classList.remove('is-invalid');
      renderFeedback(feedbackContainer, 'empty');
      break;

    case 'processed':
      rssForm.reset();
      renderFeedback(feedbackContainer, 'success', i18n.t('success'));
      break;

    case 'failed':
      const isInvalid = validState === 'invalid';
      linkInput.classList.toggle('is-invalid', isInvalid);
      renderFeedback(feedbackContainer, 'fail', i18n.t([`error.${error}`, 'error.unspecific']));
      break;
    
    default:
      throw new Error(`Unknown "Creation" process state: "${state}"`);
  }
};

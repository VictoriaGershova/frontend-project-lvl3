import i18next from 'i18next';
import resources from './locales';
import { makeChannelRepository, makePostRepository } from './data/repositories';
import { makeChannel, makePost } from './data/entities';
import { getRSSService } from './services'
import { initUpdate, initCreating } from './processes';

const init = () => {
  const elements = {
    rssTitle: document.querySelector('.rss-title'),
    rssSign: document.querySelector('.rss-sign'),
  };

  const app = {
    repositories: {
      channels: makeChannelRepository(),
      posts: makePostRepository(),
    },
    entities: {
      makeChannel,
      makePost,
    },
  };

  const rss = getRSSService(app);

  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  }).then(() => {
    elements.rssTitle.textContent = i18next.t('title');
    elements.rssSign.textContent = i18next.t('sign');
    initCreating(rss);
    initUpdate(rss);
  });


};

export default init;

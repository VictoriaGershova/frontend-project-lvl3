import _ from 'lodash';
import make from '../AppService';
import getRSS from '../../models/api';
import parseRSS from '../../models/parsers';

const getRSSData = (link) => getRSS(link)
  .then((res) => {
    const { data } = res;
    return parseRSS(data)
  });

export default ({ repositories, entities }) => {
  const {
    repositories: {
      channels,
      posts,
    },
    entities: {
      makeChannel,
      makePost,
    },
  } = make({ repositories, entities });

  const addChannelPosts = (channel, items) => {
    const newPosts = items.map((item) => makePost({ ...item, channel }));
    posts.saveAll(...newPosts);
  };

  const createFeed = (link) => getRSSData(link)
    .then((data) => {
      const { channel: { title, description, items } } = data;
      const newChannel = makeChannel({ link, title, description });
      channels.save(newChannel);
      addChannelPosts(newChannel, items);
    });

  const updateFeeds = () => {
    const promises = channels.all().map((channel) => {
      const { link } = channel;
      const existedPosts = posts.findAllBy({ channel });
      const promise = getRSSData(link)
        .then((data) => {
          const { items } = data.channel;
          const newItems = _.differenceBy(items, existedPosts, { title, link, pubDate });
          addChannelPosts(channel, newItems);
        });
      return promise;
    });
    return Promise.all(promises);
  };

  const getFeeds = () => {
    const channels = channels.all();
    const posts = posts.all();
    alert(channels);
    return {
      channels,
      posts,
    };
  };

  return {
    createFeed,
    updateFeeds,
    getFeeds,
  };
};

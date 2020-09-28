import _ from 'lodash';
import getRSSData from './api';
import parse from './parser';

const getData = (link) => getRSSData(link).then((data) => parse(data));

const makeChannel = ({ link, title, description }) => {
  const id = _.uniqueId();
  return {
    id,
    link,
    title,
    description,
  };
};

const makePosts = (channelId, items) => items.map(
  ({ link, title }) => {
    const id = _.uniqueId();
    return {
      id,
      channelId,
      link,
      title,
    };
  },
);

export const getNewFeed = (link) => getData(link)
  .then((data) => {
    const { channel: { title, description, items } } = data;
    const channel = makeChannel({ link, title, description });
    const { id: channelId } = channel;
    const channelPosts = makePosts(channelId, items);
    return { channel, channelPosts };
  });

const isMatched = (item, { link, title }) => _.isEqual(item, { link, title });

export const getFeedsUpdate = ({ channels, posts }) => {
  const promises = channels.map(
    ({ id, link }) => getData(link)
      .then((data) => {
        const { channel: { items } } = data;
        const existedPosts = posts.filter((post) => post.channelId === id);
        const newItems = _.differenceWith(items, existedPosts, isMatched);
        return makePosts(id, newItems);
      }),
  );

  return Promise.all(promises).then((allNewPosts) => _.flatten(allNewPosts));
};

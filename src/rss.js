import _ from 'lodash';
import getRSSData from './models/api';
import parse from './models/parser';

const getData = (link) => getRSSData(link)
  .then((data) => parse(data));

const makeChannel = ({ link, title, description }) => {
  const id = _.uniqueId();
  return { id, link, title, description };
};

const makePosts = (channelId, items) => {
  const posts = items.map(({ link, title }) => {
    const id = _.uniqueId();
    return { id, channelId, link, title };
  });
  return posts;
};

export const getNewFeed = (link) => getData(link)
  .then((data) => {
    const { channel: { title, description, items } } = data;
    const channel = makeChannel({ link, title, description });
    const { id: channelId } = channel;
    const channelPosts = makePosts(channelId, items);
    return { channel, channelPosts };
  });

export const getFeedsUpdate = ({ channels, posts }) => {
  const promises = channels.map(
    ({ id, link }) => getData(link)
      .then((data) => {
        const { channel: { items } } = data;
        const existedPosts = posts.filter((post) => post.channelId === id);
        const newItems = _.differenceBy(items, existedPosts, { title, link });
        const newPosts = makePosts(id, newItems);
        return newPosts;
      }));
  return Promise.all(promises).then((channelsPosts) => {
    const allNewPosts = _.flatten(channelsPosts)
    return allNewPosts
  });
};

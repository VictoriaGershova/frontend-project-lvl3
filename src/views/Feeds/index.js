const buildPostItem = ({ link, title }, container) => {
  const linkElement = document.createElement('A');
  linkElement.setAttribute('href', link);
  linkElement.setAttribute('target', '_blank')
  linkElement.textContent = title;
  container.append(linkElement);
};

const buildFeedItem = ({ title }, posts, container) => {
  const titleElement = document.createElement('H2');
  titleElement.textContent = title;
  container.append(titleElement);
  posts.forEach((post) => buildPostItem(post, container));
};

export default (feeds) => {
  const container = document.querySelector('.feeds');
  const { channels, posts } = feeds;
  container.textContent = '';
  channels.forEach((channel) => {
    const { id } = channel;
    const channelPosts = posts.filter(({ channelId }) => channelId === id);
    buildFeedItem(channel, channelPosts, container);
  });
};

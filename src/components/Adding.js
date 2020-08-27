export default (container) => {
  const jumbotronDiv = document.createElement('DIV');
  jumbotronDiv.classList.add('jumbotron');

  const header = document.createElement('H1');
  header.classList.add('display-4');
  header.innerText = 'RSS Reader';

  const description = document.createElement('P');
  description.classList.add('lead');
  description.innerText = 'Start reading RSS today! It is easy, it is nicely.';
  
  jumbotronDiv.append(header, description);
  container.append(jumbotronDiv);
};

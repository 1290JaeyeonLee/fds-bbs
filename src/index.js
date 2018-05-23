import axios from 'axios';

axios.get('http://localhost:3000/posts').then(res => {
  res.data.forEach(post => {
    //임시로 보관하는 통
    const fragment = document.importNode(document.querySelector('#post-item').content, true);
    // const pEl = document.createElement('p');
    const pEl = fragment.querySelector('.post-item__title');
    pEl.textContent = post.title;
    // document.querySelector('.post-list').appendChild(pEl);
    document.querySelector('.post-list').appendChild(fragment);
  })
})
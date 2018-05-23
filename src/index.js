import axios from 'axios';
const rootEl = document.querySelector('.root');
const templates = {
  postList: document.querySelector('#post-list').content,
  postItem: document.querySelector('#post-item').content
}

async function indexPage() {
  const res = await axios.get('http://localhost:3000/posts');
   //importnode는 템플릿안에 있는 것들을 복사하여 fragment라는 임시저장소에 복사를 한다. 그 복사본에 내용을 채워넣는 것이다.
   const listFragment = document.importNode(templates.postList, true)
   res.data.forEach(post => {
     //임시로 보관하는 통
     const fragment = document.importNode(templates.postItem, true);
     // const pEl = document.createElement('p');
     const pEl = fragment.querySelector('.post-item__title');
     pEl.textContent = post.title;
     // document.querySelector('.post-list').appendChild(pEl);
     listFragment.querySelector('.post-list').appendChild(fragment);
   })
   rootEl.appendChild(listFragment);
}

indexPage();
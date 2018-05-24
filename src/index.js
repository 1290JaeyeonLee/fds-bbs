import axios from 'axios';

const postAPI = axios.create({
  baseURL : process.env.API_URL
});
//axios를 모두 postAPI로 변경

const rootEl = document.querySelector('.root');

function login(token) {
  localStorage.setItem('token', token);
  //alert(res.data.token);
  //alert(JSON.stringify(payload))
  postAPI.defaults.headers['Authorization'] = `Bearer ${token}`;
  //defaults라는 객체(설정객체의 기본값)에 header설정
  //객체의 표기법 중 대괄호 표기법으로 나타냄, - 은 점표기법으로 쓸 수 없다.
  rootEl.classList.add('root--authed');
}
function logout() {
  localStorage.removeItem('token');
  delete postAPI.defaults.headers['Authorization'];
  rootEl.classList.remove('root--authed');
}
const templates = {
  postList: document.querySelector('#post-list').content,
  postItem: document.querySelector('#post-item').content,
  postContent: document.querySelector('#post-content').content,
  login: document.querySelector('#login').content,
  postForm: document.querySelector('#post-form').content,
  comments: document.querySelector('#comments').content,
  commentItem: document.querySelector('#comment-item').content,
}

function render(fragment){
  rootEl.textContent = '';
  rootEl.appendChild(fragment);
}

async function indexPage() {
  rootEl.classList.add('root--loading');
  //await는 promise를 기다린다.
  const res = await postAPI.get('/posts?_expand=user');
   //importNode는 템플릿안에 있는 것들을 복사하여 fragment라는 임시저장소에 복사를 한다. 그 복사본에 내용을 채워넣는 것이다.
  rootEl.classList.remove('root--loading');
  const listFragment = document.importNode(templates.postList, true)

  listFragment.querySelector('.post-list__login-btn').addEventListener('click', e => {
    loginPage();
  })
  listFragment.querySelector('.post-list__logout-btn').addEventListener('click', e => {
    logout();
    indexPage();
  })
  listFragment.querySelector('.post-list__new-post-btn').addEventListener('click', e => {
    postFormPage();
  })
  res.data.forEach(post => {
     //임시로 보관하는 통
     const fragment = document.importNode(templates.postItem, true);
     fragment.querySelector('.post-item__author').textContent = post.user.username;
     // const pEl = document.createElement('p');
     const pEl = fragment.querySelector('.post-item__title');
     pEl.textContent = post.title;
     // document.querySelector('.post-list').appendChild(pEl);
     pEl.addEventListener('click', e => {
       postContentPage(post.id)
     });
     listFragment.querySelector('.post-list').appendChild(fragment);
   });
   render(listFragment);
}

async function postContentPage(postId){
  const res = await postAPI.get(`/posts/${postId}`);
  const fragment = document.importNode(templates.postContent, true);
  fragment.querySelector('.post-content__title').textContent = res.data.title;
  fragment.querySelector('.post-content__body').textContent = res.data.body;
  fragment.querySelector('.post-content__back-btn').addEventListener('click', e => {
    indexPage();
  })
  // 실제로 html에 코드를 변경하는 방식 (css로 숨기는 방법)이 아닌 js로 숨기는 방식
  // 로그인했을때만 댓글 보이게 하기
  if (localStorage.getItem('token')) {
    const commentsFragment = document.importNode(templates.comments, true);

    const commentsRes = await postAPI.get(`/posts/${postId}/comments`);

    commentsRes.data.forEach(comment => {
      const itemFragment = document.importNode(templates.commentItem, true);
      itemFragment.querySelector('.comment-item__body').textContent = comment.body;
      commentsFragment.querySelector('.comments__list').appendChild(itemFragment);
    })
    const formEl = commentsFragment.querySelector('.comments__form');
    formEl.addEventListener('submit', async e => {
      e.preventDefault();
      const payload = {
        body: e.target.elements.body.value
      };
      rootEl.classList.add('root--loading');
      const res = await postAPI.post(`/posts/${postId}/comments`, payload);
      rootEl.classList.remove('root--loading');
      postContentPage(postId);
      // 사용자가 정보를 추가하거나 갱신할 때 최신 데이터를 반영한다, 변경된 사항이 없는 경우엔 불필요한 전송 
    });
    fragment.appendChild(commentsFragment);
  } 
  render(fragment);
}

async function loginPage() {
  const fragment = document.importNode(templates.login, true);
  const formEl = fragment.querySelector('.login__form');
  formEl.addEventListener('submit', async e => {
    // await는 바로 위에 async 가 있어야 한다.
    // payload : 통신에 실어나르는 정보
    const payload = {
      //e.target엔 formEl이 들어있다.
      //element -> 폼 안에 들어있는 엘리멘트객체들을 가져올 수 있다.(input)
      //username이라는 name을 가지고 있는 element 객체
      //e.target.elements.username.value === fragment.querySlector('[name=username]')
      username: e.target.elements.username.value,
      password: e.target.elements.password.value
    };
    e.preventDefault(); // 폼의 내장기능
    
    const res = await postAPI.post('/users/login', payload);
    login(res.data.token);
    indexPage();
  })
  render(fragment);
}
async function postFormPage(){
  const fragment = document.importNode(templates.postForm, true);
  fragment.querySelector('.post-form__back-btn').addEventListener('click', e => {
    e.preventDefault();
    indexPage();
  })
  fragment.querySelector('.post-form').addEventListener('submit', async e => {
    e.preventDefault(); // 새로고침을 막는다.
    const payload = {
      title: e.target.elements.title.value,
      body: e.target.elements.body.value
    }
    rootEl.classList.add('root--loading');
    const res = await postAPI.post('/posts', payload);
    rootEl.classList.remove('root--loading');
    console.log(res);
    postContentPage(res.data.id);
  })

  render(fragment);
}



if(localStorage.getItem('token')){
  login(localStorage.getItem('token'));
}

indexPage();
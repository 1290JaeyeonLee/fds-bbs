import axios from 'axios';

const postAPI = axios.create({});
const rootEl = document.querySelector('.root');

//axios를 모두 postAPI로 변경


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
}

function render(fragment){
  rootEl.textContent = '';
  rootEl.appendChild(fragment);
}

async function indexPage() {
  const res = await postAPI.get('http://localhost:3000/posts');
   //importNode는 템플릿안에 있는 것들을 복사하여 fragment라는 임시저장소에 복사를 한다. 그 복사본에 내용을 채워넣는 것이다.
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
  const res = await postAPI.get(`http://localhost:3000/posts/${postId}`);
  const fragment = document.importNode(templates.postContent, true);
  fragment.querySelector('.post-content__title').textContent = res.data.title;
  fragment.querySelector('.post-content__body').textContent = res.data.body;
  fragment.querySelector('.post-content__back-btn').addEventListener('click', e => {
    indexPage();
  })
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
    
    const res = await postAPI.post('http://localhost:3000/users/login', payload);
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
    const res = await postAPI.post('http://localhost:3000/posts', payload);
    console.log(res);
    postContentPage(res.data.id);
  })

  render(fragment);
}

if(localStorage.getItem('token')){
  login(localStorage.getItem('token'));
}

indexPage();
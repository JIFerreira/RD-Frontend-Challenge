(() => {
    const selector = selector => document.querySelector(selector)
    const create = element => document.createElement(element)

    const app = selector('#app');

    const Login = create('div');

    Login.classList.add('login');

    const Logo = create('img');
    Logo.src = './assets/images/logo.svg';
    Logo.classList.add('logo');

    const Form = create('form');

    Form.onsubmit = async e => {
        e.preventDefault();

        const [email, password] = e.target.children;

        const { url } = await fakeAuthenticate(email.value, password.value);

        window.location.href = '#users';

        const users = await getDevelopersList(url);
        renderPageUsers(users);
    };

    Form.oninput = e => {
        const [email, password, button] = e.target.parentElement.children;
        (!email.validity.valid || !email.value || password.value.length <= 5)
            ? button.setAttribute('disabled', 'disabled')
            : (button.removeAttribute('disabled'), button.classList.remove('login--button_disabled'));
    };

    Form.innerHTML = `
        <input class="login--input" type="email" placeholder="Entre com seu email" required/>
        <input class="login--input" type="password" placeholder="Sua senha supersecreta" required/>
        <button class="login--button login--button_disabled">Entrar</button>
    `;

    app.appendChild(Logo);
    Login.appendChild(Form);

    async function fakeAuthenticate(email, password) {

        return await fetch('http://www.mocky.io/v2/5dba690e3000008c00028eb6').then(response => (
            response.json().then(data => {
                const fakeJwtToken = `${btoa(email + password)}.${btoa(data.url)}.${(new Date()).getTime() + 300000}`;
                localStorage.setItem('token', fakeJwtToken)
                return data;
            })
        ))

    }

    async function getDevelopersList(url) {
        return await fetch(url).then(response => response.json().then(data => data));
    }

    function renderPageUsers(users) {
        app.classList.add('logged');
        Form.style.display = false;

        const Ul = create('ul');
        Ul.classList.add('container')

        users.map(item => {
            const LI = create('li');
            LI.innerHTML = `
            <img src="${item.avatar_url}"/>
            <span>${item.login}</span>
            <span class="li--disabled"></span>
            `
            Ul.appendChild(LI);
        });


        app.appendChild(Ul)
    }

    // init
    (async function () {
        const rawToken = localStorage.getItem('token') || null;
        const token = rawToken ? rawToken.split('.') : null
        if (!token || token[2] < (new Date()).getTime()) {
            localStorage.removeItem('token');
            location.href = '#login';
            app.appendChild(Login);
        } else {
            location.href = '#users';
            const users = await getDevelopersList(atob(token[1]));
            renderPageUsers(users);
        }
    })()
})()

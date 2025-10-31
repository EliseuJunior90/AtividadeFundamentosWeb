(function(){

  const routes = {
    '': 'index.html',
    '#/': 'index.html',
    '#/projeto': 'projeto.html',
    '#/cadastro': 'cadastro.html'
  };

  function renderTemplate(tpl, data={}){
    return tpl.replace(/{{\s*(\w+)\s*}}/g, (_,key)=> (data[key] !== undefined ? data[key] : ''));
  }

  async function loadRoute(hash){
    const file = routes[hash] || routes[''];
    try{
      const res = await fetch(file, {cache: 'no-store'});
      if(!res.ok) throw new Error('failed to load');
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const newMain = doc.querySelector('main');
      const main = document.querySelector('main');
      if(newMain && main){
   
        const html = renderTemplate(newMain.innerHTML, {});
        main.innerHTML = html;
    
        const newTitle = doc.querySelector('title');
        if(newTitle) document.title = newTitle.textContent;
 
        enhanceUI();
      }
    }catch(err){
      console.error('Route load error', err);
    }
  }

  function routeChanged(){
    const hash = location.hash || '#/';
    loadRoute(hash);
  }

  function attachNavInterception(){
    document.addEventListener('click', (e)=>{
      const a = e.target.closest('a');
      if(!a) return;
      const href = a.getAttribute('href');
      if(!href) return;

      if(href.endsWith('.html')){
        e.preventDefault();
        let targetHash = '#/';
        if(href.includes('projeto')) targetHash = '#/projeto';
        if(href.includes('cadastro')) targetHash = '#/cadastro';
        if(href.includes('index')) targetHash = '#/';
        history.pushState(null,'', targetHash);
        routeChanged();
      }
    });
  }


  function showToast(message, opts={timeout:3500}){
    let container = document.querySelector('.toast-container');
    if(!container){
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    container.appendChild(t);
    setTimeout(()=>{ t.style.opacity = '0'; setTimeout(()=> t.remove(), 300); }, opts.timeout);
  }


  function setFieldError(input, message){
    const group = input.closest('.form-group') || input.parentElement;
    if(!group) return;
    group.classList.add('has-error');
    input.classList.add('invalid');
    let err = group.querySelector('.field-error');
    if(!err){
      err = document.createElement('div');
      err.className = 'field-error';
      group.appendChild(err);
    }
    err.textContent = message;
  }
  function clearFieldError(input){
    const group = input.closest('.form-group') || input.parentElement;
    if(!group) return;
    group.classList.remove('has-error');
    input.classList.remove('invalid');
    const err = group.querySelector('.field-error');
    if(err) err.remove();
  }

  function validateEmail(v){
    return /\S+@\S+\.\S+/.test(v);
  }
  function onlyDigits(v){ return v.replace(/\D/g,''); }

  function validateVolunteerForm(form){
    const errors = [];
    const data = {};
    const nome = form.querySelector('#nome');
    const email = form.querySelector('#email');
    const cpf = form.querySelector('#cpf');
    const telefone = form.querySelector('#telefone');
    const nascimento = form.querySelector('#nascimento');
    const endereco = form.querySelector('#endereco');
    const cep = form.querySelector('#cep');
    const cidade = form.querySelector('#cidade');
    const estado = form.querySelector('#estado');

  
    [nome,email,cpf,telefone,nascimento,endereco,cep,cidade,estado].forEach(i=>{ if(i) clearFieldError(i); });

    if(!nome || !nome.value.trim()) errors.push({field:nome,msg:'Nome é obrigatório'});
    if(!email || !validateEmail(email.value)) errors.push({field:email,msg:'E-mail inválido'});
    if(!cpf || onlyDigits(cpf.value).length < 11) errors.push({field:cpf,msg:'CPF inválido (11 números)'});
    if(!telefone || onlyDigits(telefone.value).length < 10) errors.push({field:telefone,msg:'Telefone inválido'});
    if(!nascimento || !nascimento.value) {
      errors.push({field:nascimento,msg:'Data de nascimento obrigatória'});
    } else {
     
      const dob = new Date(nascimento.value);
      if(!isNaN(dob.getTime())){
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
     
        if(age < 18 || age > 90){
          errors.push({field:nascimento,msg:'Você deve ter entre 18 e 90 anos para se cadastrar'});
        }
      } else {
        errors.push({field:nascimento,msg:'Data de nascimento inválida'});
      }
    }
    if(!endereco || !endereco.value.trim()) errors.push({field:endereco,msg:'Endereço obrigatório'});
    if(!cep || onlyDigits(cep.value).length < 8) errors.push({field:cep,msg:'CEP inválido'});
    if(!cidade || !cidade.value.trim()) errors.push({field:cidade,msg:'Cidade obrigatória'});
    if(!estado || onlyDigits(estado.value).length === 0 || estado.value.trim().length !==2) errors.push({field:estado,msg:'Informe UF (2 letras)'});


    errors.forEach(e=>{ if(e.field) setFieldError(e.field, e.msg); });

    const valid = errors.length === 0;
    if(valid){
 
      const formData = new FormData(form);
      for(let [k,v] of formData.entries()) data[k]=v;
    }
    return {valid,data,errors};
  }

  function enhanceUI(){
   
    const volunteerForm = document.querySelector('#volunteerform');
    if(volunteerForm){
    
      volunteerForm.addEventListener('submit', function(evt){
     
      });
   
      volunteerForm.querySelectorAll('input,textarea,select').forEach(input=>{
        input.addEventListener('input', ()=> clearFieldError(input));
      });
    }

 
    const navToggle = document.querySelector('#nav-toggle');
    const hamburger = document.querySelector('.hamburger');
    if(hamburger && navToggle){
      hamburger.addEventListener('click', ()=>{
        navToggle.checked = !navToggle.checked;
        const mobile = document.querySelector('.mobile-nav');
        if(mobile) mobile.style.display = navToggle.checked ? 'block' : 'none';
        hamburger.setAttribute('aria-expanded', String(navToggle.checked));
      });
    }
  }


  window.app = window.app || {};
  window.app.handleSubmit = function(event){
    event.preventDefault();
    const form = event.target.closest('form') || document.querySelector('#volunteerform');
    if(!form) return;
    const result = validateVolunteerForm(form);
    if(result.valid){
    
      const successEl = document.querySelector('#sucessmessage');
      if(successEl){ successEl.style.display = 'block'; setTimeout(()=> successEl.style.display = 'none', 3500); }
      showToast('Cadastro realizado com sucesso!', {timeout:3000});
      form.reset();
    }else{
      showToast('Existem erros no formulário. Verifique os campos marcados.', {timeout:3000});
    
      const firstErr = result.errors[0] && result.errors[0].field;
      if(firstErr) firstErr.scrollIntoView({behavior:'smooth',block:'center'});
    }
  };

 
  function boot(){
    attachNavInterception();
   
    if(location.hash){
      routeChanged();
    } else {
    
      enhanceUI();
  
      history.replaceState(null, '', '#/');
    }
    window.addEventListener('hashchange', routeChanged);
  }


  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else boot();

})();

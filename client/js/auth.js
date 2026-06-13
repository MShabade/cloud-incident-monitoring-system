import { authApi } from './api.js';
import { toast } from './utils.js';

export function initAuth(onSuccess) {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const rememberMe = document.getElementById('rememberMe');
  const submitBtn = document.getElementById('loginSubmit');
  const forgotLink = document.getElementById('forgotPassword');

  const saved = localStorage.getItem('rememberedEmail');
  if (saved) {
    emailInput.value = saved;
    rememberMe.checked = true;
  }

  forgotLink?.addEventListener('click', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!email || !email.includes('@')) {
      showFieldError('loginEmail', 'Enter your work email to reset password');
      return;
    }
    toast('If an account exists, a reset link has been sent to your email.');
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let valid = true;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError('loginEmail', 'Enter a valid work email address');
      valid = false;
    }
    if (!password) {
      showFieldError('loginPassword', 'Password is required');
      valid = false;
    }
    if (!valid) return;

    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (rememberMe.checked) localStorage.setItem('rememberedEmail', email);
      else localStorage.removeItem('rememberedEmail');
      onSuccess(data.user);
    } catch (err) {
      showFormError(err.message || 'Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  });
}

function setLoading(loading) {
  const btn = document.getElementById('loginSubmit');
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? '<span class="btn-spinner"></span> Signing in...'
    : 'Sign in';
}

function showFieldError(id, msg) {
  const input = document.getElementById(id);
  input?.classList.add('error');
  const err = document.getElementById(`${id}Error`);
  if (err) { err.textContent = msg; err.classList.remove('hidden'); }
}

function showFormError(msg) {
  const el = document.getElementById('loginFormError');
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}

function clearErrors() {
  document.querySelectorAll('.form-input.error').forEach((el) => el.classList.remove('error'));
  document.querySelectorAll('.form-error').forEach((el) => { el.textContent = ''; el.classList.add('hidden'); });
  document.getElementById('loginFormError')?.classList.add('hidden');
}

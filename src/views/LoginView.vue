<template>
  <main class="container login">
    <section class="login__card">
      <h1>{{ isRegister ? 'Criar conta' : 'Entrar' }}</h1>
      <p class="login__subtitle">
        {{ isRegister
          ? 'Crie sua conta para começar a planejar suas viagens.'
          : 'Acesse o painel para planejar e acompanhar suas viagens.' }}
      </p>

      <form @submit.prevent="handleSubmit">
        <div v-if="isRegister" class="field">
          <label for="name">Nome</label>
          <input
            id="name"
            v-model="name"
            type="text"
            autocomplete="name"
          />
        </div>

        <div class="field">
          <label for="email">E-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
          />
        </div>

        <div class="field">
          <label for="password">Senha</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>

        <button class="btn" type="submit" :disabled="loading">
          <span v-if="!loading">
            {{ isRegister ? 'Criar conta' : 'Entrar' }}
          </span>
          <span v-else>
            {{ isRegister ? 'Criando conta...' : 'Entrando...' }}
          </span>
        </button>

        <p v-if="error" class="login__error">
          {{ error }}
        </p>
      </form>

      <p class="login__helper">
        <button
          type="button"
          class="login__switch"
          @click="toggleMode"
        >
          <span v-if="isRegister">Já tem conta? Entrar</span>
          <span v-else>Não tem conta? Criar conta</span>
        </button>
      </p>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login, register } from '../services/authService'

const email = ref('')
const password = ref('')
const name = ref('')
const loading = ref(false)
const error = ref('')
const isRegister = ref(false)

const router = useRouter()
const route = useRoute()

function toggleMode() {
  isRegister.value = !isRegister.value
  error.value = ''
}

async function handleSubmit() {
  if (isRegister.value) {
    await doRegister()
    return
  }
  await doLogin()
}

async function doLogin() {
  if (!email.value || !password.value) {
    error.value = 'Informe e-mail e senha'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const payload = { email: email.value, password: password.value }
    const data = await login(payload)
    localStorage.setItem('portulano_token', data.token)
    const redirect = route.query.redirect
    router.push(redirect || '/')
  } catch (err) {
    const status = err?.response?.status
    error.value = status === 401
      ? 'E-mail ou senha inválidos'
      : 'Não foi possível entrar agora'
  } finally {
    loading.value = false
  }
}

async function doRegister() {
  if (!email.value || !password.value) {
    error.value = 'Informe e-mail e senha'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const payload = {
      email: email.value,
      password: password.value,
      name: name.value || undefined,
    }
    const data = await register(payload)
    localStorage.setItem('portulano_token', data.token)
    router.push('/')
  } catch (err) {
    const status = err?.response?.status
    if (status === 409) {
      error.value = 'E-mail já está em uso'
    } else {
      error.value = 'Não foi possível criar a conta agora'
    }
  } finally {
    loading.value = false
  }
}
</script>

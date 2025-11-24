<template>
  <main class="container stack">
    <header class="stack stack--row stack--between">
      <h2>Painel do Usuário</h2>
      <button type="button" class="btn--ghost" @click="handleLogout">Sair</button>
    </header>

    <section v-if="user" class="card stack">
      <p><strong>Nome:</strong> {{ user.name || '—' }}</p>
      <p><strong>E-mail:</strong> {{ user.email }}</p>
      <p v-if="user.createdAt">
        <strong>Conta criada em:</strong> {{ createdAtLabel }}
      </p>
    </section>

    <p v-else class="text-muted">
      Carregando dados do usuário...
    </p>
  </main>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { logout } from '../services/authService'

const auth = useAuthStore()
const router = useRouter()


onMounted(() => {
  if (!auth.user && !auth.loading) {
    auth.fetchMe().catch(() => {})
  }
})

const user = computed(() => auth.user)
const createdAtLabel = computed(() => {
  if (!user.value?.createdAt) return ''
  return new Date(user.value.createdAt).toLocaleDateString('pt-BR')
})

function handleLogout() {
  logout()
  router.push({ name: 'login' })
}

</script>

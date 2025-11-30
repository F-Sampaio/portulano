<template>
  <main class="container stack">
    <header class="stack stack--row stack--between">
      <h2>Painel do Usuário</h2>
      <button type="button" class="btn--ghost" @click="handleLogout">Sair</button>
    </header>

    <template v-if="user">
      <!-- Dados atuais -->
      <section class="card stack">
        <p><strong>Nome:</strong> {{ user.name || '—' }}</p>
        <p><strong>E-mail:</strong> {{ user.email }}</p>
        <p v-if="user.createdAt">
          <strong>Conta criada em:</strong> {{ createdAtLabel }}
        </p>
      </section>

      <!-- Atualizar nome e e-mail -->
      <section class="card stack">
        <h3>Atualizar dados</h3>

        <form class="stack" @submit.prevent="handleUpdateName">
          <div class="field">
            <label for="name">Nome</label>
            <input
              id="name"
              v-model="nameInput"
              type="text"
              autocomplete="name"
            />
          </div>
          <button type="submit" class="btn" :disabled="savingName">
            {{ savingName ? 'Salvando...' : 'Salvar nome' }}
          </button>
        </form>

        <form class="stack" @submit.prevent="handleUpdateEmail">
          <div class="field">
            <label for="email">E-mail</label>
            <input
              id="email"
              v-model="emailInput"
              type="email"
              autocomplete="email"
            />
          </div>
          <button type="submit" class="btn" :disabled="savingEmail">
            {{ savingEmail ? 'Salvando...' : 'Salvar e-mail' }}
          </button>
        </form>
      </section>

      <!-- Trocar senha -->
      <section class="card stack">
        <h3>Trocar senha</h3>

        <form class="stack" @submit.prevent="handleChangePassword">
          <div class="field">
            <label for="currentPassword">Senha atual</label>
            <input
              id="currentPassword"
              v-model="currentPassword"
              type="password"
              autocomplete="current-password"
            />
          </div>

          <div class="field">
            <label for="newPassword">Nova senha</label>
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              autocomplete="new-password"
            />
          </div>

          <button type="submit" class="btn" :disabled="savingPassword">
            {{ savingPassword ? 'Salvando...' : 'Atualizar senha' }}
          </button>
        </form>
      </section>

      <!-- Mensagens -->
      <p v-if="errorMessage" class="login__error">
        {{ errorMessage }}
      </p>
      <p v-if="successMessage" class="login__helper">
        {{ successMessage }}
      </p>
    </template>

    <p v-else class="text-muted">
      Carregando dados do usuário...
    </p>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { logout } from '../services/authService'
import { updateName, updateEmail, updatePassword } from '../services/userService'

const auth = useAuthStore()
const router = useRouter()

const nameInput = ref('')
const emailInput = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const savingName = ref(false)
const savingEmail = ref(false)
const savingPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const user = computed(() => auth.user)
const createdAtLabel = computed(() => {
  if (!user.value?.createdAt) return ''
  return new Date(user.value.createdAt).toLocaleDateString('pt-BR')
})

watch(
  () => auth.user,
  (val) => {
    if (val) {
      nameInput.value = val.name || ''
      emailInput.value = val.email
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (!auth.user && !auth.loading) {
    auth.fetchMe().catch(() => {})
  }
})

async function handleUpdateName() {
  if (!nameInput.value.trim()) return
  savingName.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const data = await updateName({ name: nameInput.value })
    auth.setUser(data)
    successMessage.value = 'Nome atualizado com sucesso.'
  } catch (err) {
    errorMessage.value = 'Não foi possível atualizar o nome.'
  } finally {
    savingName.value = false
  }
}

async function handleUpdateEmail() {
  if (!emailInput.value.trim()) return
  savingEmail.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const data = await updateEmail({ email: emailInput.value })
    auth.setUser(data)
    successMessage.value = 'E-mail atualizado com sucesso.'
  } catch (err) {
    const status = err?.response?.status
    if (status === 409) {
      errorMessage.value = 'E-mail já está em uso.'
    } else {
      errorMessage.value = 'Não foi possível atualizar o e-mail.'
    }
  } finally {
    savingEmail.value = false
  }
}

async function handleChangePassword() {
  if (!currentPassword.value || !newPassword.value) return
  savingPassword.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await updatePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    })
    successMessage.value = 'Senha atualizada com sucesso.'
    currentPassword.value = ''
    newPassword.value = ''
  } catch (err) {
    errorMessage.value = 'Não foi possível atualizar a senha.'
  } finally {
    savingPassword.value = false
  }
}

function handleLogout() {
  logout()
  router.push({ name: 'login' })
}
</script>

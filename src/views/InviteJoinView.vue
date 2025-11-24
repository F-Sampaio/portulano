<template>
  <main class="container stack">
    <h1>Entrar na viagem</h1>
    <p v-if="loading">Processando convite...</p>
    <p v-else-if="error" class="error">{{ error }}</p>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { joinTripByCode } from '../services/api'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const code = route.params.code
  try {
    const trip = await joinTripByCode(code)
    router.replace({ name: 'trip', params: { id: trip.id } })
  } catch (e) {
    error.value = 'Convite inválido ou expirado.'
  } finally {
    loading.value = false
  }
})
</script>

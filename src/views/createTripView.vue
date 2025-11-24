<template>
  <form @submit.prevent="submit">
    <input v-model="name" placeholder="Nome da viagem" required />
    <input v-model="origin" placeholder="Origem" required />
    <input v-model="destination" placeholder="Destino" required />
    <input type="date" v-model="startDate" required />
    <input type="date" v-model="endDate" required />

    <button type="submit" :disabled="saving">
      {{ saving ? 'Salvando...' : 'Criar viagem' }}
    </button>

    <p v-if="error">{{ error }}</p>
    <p v-if="success">Viagem criada com sucesso.</p>
  </form>
</template>
<script setup>
import { ref } from 'vue'
import { createTrip } from '../services/tripService'

const name = ref('')
const origin = ref('')
const destination = ref('')
const startDate = ref('')
const endDate = ref('')
const saving = ref(false)
const error = ref(null)
const success = ref(false)

async function submit() {
  error.value = null
  success.value = false
  saving.value = true

  try {
    await createTrip({
      name: name.value,
      origin: origin.value,
      destination: destination.value,
      startDate: startDate.value,
      endDate: endDate.value,
    })
    success.value = true
  } catch (err) {
    console.error(err)
    error.value = 'Erro ao criar viagem'
  } finally {
    saving.value = false
  }
}
</script>
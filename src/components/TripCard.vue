<template>
  <article class="trip-card">
    <div>
      <div class="trip-card__title">{{ trip.title }}</div>
      <div class="trip-card__meta">
        Início: {{ formatDate(trip.startDate) }}
      </div>
      <span class="badge" :class="badgeClass(trip.status)">{{ label(trip.status) }}</span>
    </div>

    <div class="trip-card__actions">
      <button class="btn btn--neutral" @click="$emit('open', trip.id)">Abrir</button>
      <button class="btn btn--danger"  @click="$emit('delete', trip.id)" :disabled="!auth.isAdmin" >Excluir</button>
    </div>
  </article>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const props = defineProps({ trip: Object })

function badgeClass(s) {
  return {
    'badge--ideia': s === 'ideia',
    'badge--planejada': s === 'planejada',
    'badge--em-andamento': s === 'em_andamento',
    'badge--concluida': s === 'concluida',
  }
}

function label(s) {
  return {
    ideia: 'Ideia',
    planejada: 'Planejada',
    em_andamento: 'Em andamento',
    concluida: 'Concluída',
  }[s] || s
}

function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return '—'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}
</script>


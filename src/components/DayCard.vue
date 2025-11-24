    <template>
  <article class="card">
    <header class="card__header">
      <h3 class="card__title">{{ day.title || 'Dia' }}</h3>
    </header>
    <p class="card__meta" v-if="day.from || day.to"><strong>De:</strong> {{ day.from || '—' }} · <strong>Para:</strong> {{ day.to || '—' }}</p>
    <p class="card__meta"><strong>Distância:</strong> {{ day.distanceKm || '0' }} km · <strong>ETA:</strong> {{ day.eta || '—' }}</p>
    <p class="card__meta" v-if="day.notes">{{ day.notes }}</p>
  </article>
</template>

<script setup>
defineProps({ day: { type: Object, required: true } })
</script>

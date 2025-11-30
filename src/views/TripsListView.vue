<template>
  <section class="trip-list container stack">
    <header class="stack stack--row stack--between">
      <h2 class="trip-title">Painel de Viagens</h2>
      <form class="stack stack--row" @submit.prevent="create">
        <input v-model="newName" type="text" placeholder="Nome da viagem" required />
        <input v-model="newDate" type="date" placeholder="dd/mm/aaaa" inputmode="numeric" required/>
        <select v-model="newStatus" required>
          <option value="planejada">Planejada</option>
          <option value="ideia">Ideia</option>
          <option value="em_andamento">Em andamento</option>
          <option value="concluida">Concluída</option>
        </select>
        <button type="submit" class="btn" :disabled="!auth.isAdmin">Criar</button>
      </form>
      <form class="stack stack--row" @submit.prevent="joinByCode">
        <input v-model="joinCode" type="text" placeholder="Código ou link de convite"/>
        <button type="submit" class="btn">Entrar na viagem</button>
      </form>
    </header>

    <div class="toolbar stack stack--row">
      <input v-model.trim="store.q" @input="onSearch" type="search" placeholder="Buscar por nome…" />
      <select v-model="store.status" @change="onFilter">
        <!-- <option value="">Status (todos)</option> -->
        <option value="ideia">Ideia</option>
        <option value="planejada">Planejada</option>
        <option value="em_andamento">Em andamento</option>
        <option value="concluida">Concluída</option>
      </select>
    </div>

    <div v-if="store.loading">
      <div class="skeleton" style="height:96px; margin-bottom:12px;"></div>
      <div class="skeleton" style="height:96px;"></div>
    </div>

    <!-- ERRO -->
    <div v-else-if="store.error" class="error">{{ store.error }}</div>

    <!-- VAZIO -->
    <div v-else-if="!store.items.length" class="empty">
      Nenhuma viagem ainda. Crie a primeira acima.
    </div>

    <!-- LISTA -->
    <div v-else class="grid">
      <TripCard v-for="t in store.items" :key="t.id" :trip="t" @open="openTrip" @delete="remove" />
    </div>

    <footer class="pagination" v-if="store.pageCount > 1">
      <button class="btn" :disabled="store.page === 1" @click="go(store.page - 1)">Anterior</button>
      <span>Página {{ store.page }} / {{ store.pageCount }}</span>
      <button class="btn" :disabled="store.page === store.pageCount" @click="go(store.page + 1)">Próxima</button>
    </footer>
  </section>
  <div v-if="showDeleteModal" class="modal-backdrop">
    <div class="modal">
      <header class="modal__header">
        <h3>Excluir viagem</h3>
      </header>

      <section class="modal__body">
        <p>Tem certeza de que deseja excluir esta viagem? Essa ação não pode ser desfeita.</p>
      </section>

      <footer class="modal__footer">
        <button
          type="button"
          class="btn btn--ghost"
          @click="cancelDelete"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn"
          @click="confirmDelete"
        >
          Excluir
        </button>
      </footer>
    </div>
    </div>

</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useTripsStore } from '../stores/trips'
import TripCard from '../components/TripCard.vue'
import { useRouter } from 'vue-router'
import { listTrips } from '../services/tripService'
import { useAuthStore } from '../stores/auth'
import { joinTripByCode } from '../services/tripService'




const router = useRouter()
const store = useTripsStore()
const auth = useAuthStore()


const trips = ref([])
const loading = ref(false)
const error = ref(null)

const showDeleteModal = ref(false)
const tripIdToDelete = ref(null)


const newName = ref('')
const newDate = ref('')
const newStatus = ref('planejada')

const joinCode = ref('')

onMounted(() => store.load())

// onMounted(async () => {
//   loading.value = true
//   try {
//     trips.value = await listTrips()
//   } catch (err) {
//     error.value = 'Erro ao carregar viagens'
//     console.error(err)
//   } finally {
//     loading.value = false
//   }
// })
function onSearch() { store.load() }
function onFilter() { store.load() }

async function create() {
  if (!auth.isAdmin) return

  const raw = (newDate.value || '').trim()
  if (!raw) {
    alert('Informe a data de início')
    return
  }

  let year = ''
  let month = ''
  let day = ''

  if (raw.includes('/')) {
    const parts = raw.split('/').map((p) => p.trim())
    if (parts.length !== 3) {
      alert('Data inválida')
      return
    }

    const [p1, p2, p3] = parts
    if (!p1 || !p2 || !p3) {
      alert('Data inválida')
      return
    }

    if (Number(p1) > 12) {
      day = p1
      month = p2
      year = p3
    } else {
      month = p1
      day = p2
      year = p3
    }
  } else if (raw.includes('-')) {
    const parts = raw.split('-').map((p) => p.trim())
    if (parts.length !== 3) {
      alert('Data inválida')
      return
    }
    ;[year, month, day] = parts
  }

  if (!year || !month || !day) {
    alert('Data inválida. Use o calendário ou digite uma data válida.')
    return
  }

  const startDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

  await store.addTrip({
    name: newName.value,
    startDate,
    status: newStatus.value,
  })

  newName.value = ''
  newDate.value = ''
  newStatus.value = 'planejada'
}


function go(p) {
  store.setPage(p)
  store.load()
}

function openTrip(id) {
  router.push({ name: 'trip', params: { id } })
}

function remove(id) {
  tripIdToDelete.value = id
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  tripIdToDelete.value = null
}

async function confirmDelete() {
  if (!tripIdToDelete.value) return
  await store.removeTrip(tripIdToDelete.value)
  showDeleteModal.value = false
  tripIdToDelete.value = null
}


async function joinByCode() {
  const code = joinCode.value.trim()
  if (!code) return

  try {
    const data = await joinTripByCode(code)
    joinCode.value = ''
    if (data.tripId) {
      router.push({ name: 'trip', params: { id: data.tripId } })
    } else {
      await store.load()
    }
  } catch (err) {
    alert('Convite inválido ou expirado.')
    console.error(err)
  }
}


function handleLogout() {
  logout()
  router.push({ name: 'login' })
}
</script>

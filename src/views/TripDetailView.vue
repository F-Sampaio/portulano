<template>
  <!-- só renderiza o detalhe quando a trip já foi carregada -->
  <section v-if="trip" class="stack container">
    <header class="stack">
      <small><RouterLink to="/">← Voltar</RouterLink></small>
      <h2>{{ trip.title || 'Viagem' }}</h2>
      <p class="card__meta">
        <strong>Início:</strong> {{ start }} ·
        <strong>Status:</strong>
        <span v-if="!canEdit">
          {{ labelStatus }}
        </span>
        <select
          v-else
          v-model="statusDraft"
          @change="changeStatus"
          class="input input--sm"
        >
          <option value="ideia">Ideia</option>
          <option value="planejada">Planejada</option>
          <option value="em_andamento">Em andamento</option>
          <option value="concluida">Concluída</option>
        </select>
        ·
      </p>

      <div>
        <button type="button" class="btn btn--ghost btn--sm" @click="exportPdf">Exportar PDF</button>
  </div>
    </header>

    <!-- Descrição -->
    <section class="block">
      <h2>Descrição</h2>

      <div class="desc">
        <button
          v-if="canEdit && !isEditingDesc"
          class="icon-btn"
          @click="startEditDesc"
          aria-label="Editar descrição"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path
              d="M14.06 4.94l3.75 3.75L19.5 7.0a1.5 1.5 0 0 0 0-2.12l-1.38-1.38a1.5 1.5 0 0 0-2.12 0l-1.94 1.44z"
              fill="currentColor"
            />
          </svg>
        </button>

        <!-- Modo leitura -->
        <div v-if="!isEditingDesc" class="desc__display" @click="canEdit && startEditDesc()">
          <p v-if="trip.description && trip.description.trim()">
            {{ trip.description }}
          </p>
          <p v-else class="meta">Toque para adicionar uma descrição…</p>
        </div>

        <!-- Modo edição -->
        <div v-else>
          <textarea
            v-model="draftDesc"
            placeholder="Escreva a descrição da viagem..."
          ></textarea>
          <div class="actions">
            <button class="btn" @click="saveDesc">Salvar</button>
            <button class="btn btn--neutral" @click="cancelDesc">Cancelar</button>
          </div>
        </div>
      </div>
    <!-- Convites -->
    </section>
        <section class="block">
      <h2>Convites</h2>
      <div v-if="canEdit" class="stack">
        <div class="stack stack--row">
          <select v-model="inviteRole">
            <option value="viewer">Somente leitura</option>
            <option value="admin">Administrador</option>
          </select>
          <select v-model="inviteType">
            <option value="link">Qualquer pessoa com o link</option>
            <option value="single">Apenas um usuário</option>
          </select>
          <button type="button" class="btn" @click="generateInvite">
            Gerar link
          </button>
        </div>
        <div v-if="inviteLink" class="invite-result">
          <p>Compartilhe este link:</p>
          <code>{{ inviteLink }}</code>
          <button type="button" class="btn btn--ghost" @click="inviteLink = ''">Ocultar</button>
        </div>
      </div>
      <p v-else class="meta">
        Você está acessando como convidado ({{ trip.currentRole || 'viewer' }}).
      </p>
    </section>

    <!-- Checklist da viagem -->
    <section class="stack">
      <h3>Checklist</h3>
      <form class="stack stack--row" @submit.prevent="addItem" v-if="canEdit">
        <input v-model.trim="newItem" type="text" placeholder="Adicionar item (ex.: Seguro Carta Verde)"/>
        <button class="btn" :disabled="!newItem">Adicionar</button>
      </form>

      <div v-if="trip.checklist?.length" class="stack">
        <ChecklistItem v-for="i in trip.checklist" :key="i.id" v-model="i.done" @update:modelValue="toggle(i)">
          <span v-if="editingChecklistId !== i.id">
            {{ i.label }}
          </span>
          <input v-else v-model.trim="editingChecklistLabel" type="text" class="input input--sm" />
          <button v-if="canEdit && editingChecklistId !== i.id" type="button" class="btn btn--ghost btn--sm" @click.stop="startEditChecklist(i)">Editar</button>
          <button v-if="canEdit && editingChecklistId === i.id" type="button" class="btn btn--ghost btn--sm" @click.stop="cancelEditChecklist">Cancelar</button>
          <button v-if="canEdit && editingChecklistId === i.id" type="button" class="btn btn--sm" @click.stop="saveEditChecklist(i)">Salvar</button>
          <button v-if="canEdit" type="button" class="btn btn--ghost btn--sm" @click.stop="removeChecklist(i)">Remover</button>
        </ChecklistItem>
      </div>
      <p v-else class="card__meta">Nenhum item ainda.</p>
    </section>


    <!-- Dias / Roteiro -->
    <section class="stack">
      <h3>Dias da viagem</h3>

      <form class="stack stack--row" @submit.prevent="addDayForm"  v-if="canEdit">
        <input v-model.trim="dayTitle" type="text" placeholder="Título do dia" />
        <input v-model.trim="dayFrom" type="text" placeholder="De" />
        <input v-model.trim="dayTo" type="text" placeholder="Para" />
        <input
          v-model="dayDistance"
          type="text"
          inputmode="numeric"
          placeholder="Distância (km)"
        />
        <input v-model.trim="dayEta" type="text" placeholder="ETA" />
        <button class="btn" v-if="auth.isAdmin">Adicionar dia</button>
      </form>

      <div v-if="trip.days?.length" class="grid">
        <article v-for="day in trip.days" :key="day.id" class="day-card">
          <header class="day-card__header">
            <h3>{{ day.title }}</h3>
            <button
              v-if="canEdit"
              type="button"
              class="btn btn--ghost btn--sm"
              @click="openDayModal(day)"
              
            >
              Editar
            </button>
          </header>

          <p>
            <strong>De:</strong> {{ day.from }} ·
            <strong>Para:</strong> {{ day.to }}
          </p>
          <p>
            <strong>Distância:</strong> {{ day.distanceKm }} km ·
            <strong>ETA:</strong> {{ day.eta }}
          </p>
          <p v-if="day.notes" class="day-card__notes">
            {{ parseDayNotes(day.notes).description }}
          </p>
        </article>
      </div>

      <p v-else class="card__meta">Nenhum dia adicionado.</p>
    </section>

    <!-- Modal de edição do dia -->
    <div v-if="editingDay" class="modal-backdrop">
      <div class="modal">
        <header class="modal__header">
          <h3>Editar dia {{ editingDay.title }}</h3>
          <button
            type="button"
            class="btn btn--ghost btn--sm"
            @click="closeDayModal"
            v-if="auth.isAdmin"
          >
            Fechar
          </button>
        </header>

        <section class="modal__body">
          <div class="field">
            <label for="day-description">Descrição do dia</label>
            <textarea
              id="day-description"
              v-model="dayDescription"
              rows="3"
            ></textarea>
          </div>

          <div class="field">
            <label>Checklist do dia</label>

            <div class="day-checklist">
              <div
                v-for="item in dayChecklist"
                :key="item.id"
                class="day-checklist__item"
              >
                <label>
                  <input
                    type="checkbox"
                    :checked="item.done"
                    @change="toggleDayChecklistItem(item.id)"
                  />
                  <span :class="{ 'day-checklist__item--done': item.done }">
                    {{ item.label }}
                  </span>
                </label>

                <button
                  type="button"
                  class="btn btn--ghost btn--sm"
                  @click="removeDayChecklistItem(item.id)"
                >
                  Remover
                </button>
              </div>

              <div class="day-checklist__new">
                <input
                  v-model="newDayItem"
                  type="text"
                  placeholder="Novo item do checklist"
                  @keyup.enter="addDayChecklistItem"
                  :disabled="!auth.isAdmin"
                />
                <button
                  type="button"
                  class="btn btn--outline btn--sm"
                  @click="addDayChecklistItem"
                  :disabled="!auth.isAdmin"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer class="modal__footer">
          <button
            v-if="auth.isAdmin"
            type="button"
            class="btn btn--ghost"
            @click="deleteCurrentDay"
          >
            Excluir dia
          </button>

          <button
            type="button"
            class="btn btn--ghost"
            @click="closeDayModal"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="btn"
            @click="saveDayModal"
          >
            Salvar
          </button>
        </footer>

      </div>
    </div>
  </section>

  <!-- estado de carregamento inicial -->
  <section v-else class="stack container">
    <p class="card__meta">Carregando viagem…</p>
  </section>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  getTrip,
  addChecklistItem,
  toggleCheckItem,
  updateCheckItem,
  deleteCheckItem,
  addDay,
  updateTrip,
  updateDay,
  deleteDay,
  createInvite,
  downloadTripPdf,
} from '../services/api'

import { fmt } from '../utils/date'
import ChecklistItem from '../components/ChecklistItem.vue'
import { useAuthStore } from '../stores/auth'


const trip = ref(null)
const route = useRoute()
const auth = useAuthStore()
const statusDraft = ref('')


// checklist
const newItem = ref('')

// descrição
const isEditingDesc = ref(false)
const draftDesc = ref('')

// dias
const dayTitle = ref('')
const dayFrom = ref('')
const dayTo = ref('')
const dayDistance = ref('')
const dayEta = ref('')
const editingDay = ref(null)
const dayDescription = ref('')
const dayChecklist = ref([])
const newDayItem = ref('')
const inviteRole = ref('viewer')
const inviteType = ref('link')
const inviteLink = ref('')
const editingChecklistId = ref(null)
const editingChecklistLabel = ref('')


const start = computed(() => {
  if (!trip.value?.startDate) return '—'
  return fmt(trip.value.startDate)
})

const labelStatus = computed(() => {
  const s = trip.value?.status
  const map = {
    ideia: 'Ideia',
    planejada: 'Planejada',
    em_andamento: 'Em andamento',
    concluida: 'Concluída',
  }
  return map[s] ?? s ?? '—'
})

const canEdit = computed(() => !!trip.value?.canEdit)

watch(
  () => trip.value?.status,
  (s) => {
    statusDraft.value = s || 'ideia'
  },
  { immediate: true },
)

onMounted(async () => {
  trip.value = await getTrip(route.params.id)
  draftDesc.value = trip.value?.description ?? ''
})

async function addItem() {
  if (!newItem.value || !trip.value) return
  await addChecklistItem(trip.value.id, newItem.value)
  newItem.value = ''
  trip.value = await getTrip(route.params.id)
}

async function generateInvite() {
  if (!trip.value) return
  const payload = {
    role: inviteRole.value,
    type: inviteType.value,
  }
  const data = await createInvite(trip.value.id, payload)
  const base = window.location.origin
  // inviteLink.value = `${base}/convite/${data.code}`
  inviteLink.value = `${data.code}`

}


function startEditDesc() {
  isEditingDesc.value = true
  draftDesc.value = trip.value?.description ?? ''
}

function cancelDesc() {
  isEditingDesc.value = false
  draftDesc.value = trip.value?.description ?? ''
}

async function saveDesc() {
  if (!trip.value) return
  const updated = await updateTrip(trip.value.id, {
    description: draftDesc.value,
  })
  trip.value = updated
  isEditingDesc.value = false
}

async function changeStatus() {
  if (!trip.value) return
  const updated = await updateTrip(trip.value.id, {
    status: statusDraft.value,
  })
  trip.value = updated
}

async function toggle(i) {
  if (!trip.value) return
  await toggleChecklistItem(trip.value.id, i.id)
  trip.value = await getTrip(route.params.id)
}

async function addDayForm() {
  if (!trip.value) return
  const distNum = Number(dayDistance.value)
  const cleanDistance = Number.isFinite(distNum) && distNum >= 0 ? distNum : 0

  await addDay(trip.value.id, {
    title: dayTitle.value,
    from: dayFrom.value,
    to: dayTo.value,
    distanceKm: cleanDistance,
    eta: dayEta.value,
    notes: '',
  })

  dayTitle.value = ''
  dayFrom.value = ''
  dayTo.value = ''
  dayEta.value = ''
  dayDistance.value = ''

  trip.value = await getTrip(route.params.id)
}

function parseDayNotes(notes) {
  if (!notes) {
    return { description: '', checklist: [] }
  }

  try {
    const parsed = JSON.parse(notes)
    return {
      description: parsed.description || '',
      checklist: Array.isArray(parsed.checklist) ? parsed.checklist : [],
    }
  } catch (e) {
    return { description: notes, checklist: [] }
  }
}

function serializeDayNotes(description, checklist) {
  return JSON.stringify({
    description: description || '',
    checklist: checklist || [],
  })
}

function openDayModal(day) {
  editingDay.value = day
  const parsed = parseDayNotes(day.notes)
  dayDescription.value = parsed.description
  dayChecklist.value = parsed.checklist.slice()
  newDayItem.value = ''
}

function closeDayModal() {
  editingDay.value = null
  dayDescription.value = ''
  dayChecklist.value = []
  newDayItem.value = ''
}

function addDayChecklistItem() {
  const label = newDayItem.value.trim()
  if (!label) return

  dayChecklist.value.push({
    id: Date.now().toString(),
    label,
    done: false,
  })
  newDayItem.value = ''
}

function toggleDayChecklistItem(id) {
  dayChecklist.value = dayChecklist.value.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item
  )
}

function removeDayChecklistItem(id) {
  dayChecklist.value = dayChecklist.value.filter((item) => item.id !== id)
}

async function saveDayModal() {
  if (!editingDay.value || !trip.value) return

  const notes = serializeDayNotes(
    dayDescription.value,
    dayChecklist.value,
  )

  await updateDay(trip.value.id, editingDay.value.id, { notes })

  trip.value = await getTrip(route.params.id)
  closeDayModal()
}

async function exportPdf() {
  if (!trip.value) return
  await downloadTripPdf(trip.value.id)
}


async function deleteCurrentDay() {
  if (!trip.value || !editingDay.value) return

  await deleteDay(trip.value.id, editingDay.value.id)
  trip.value = await getTrip(route.params.id)
  closeDayModal()
}


function startEditChecklist(item) {
  if (!canEdit.value) return
  editingChecklistId.value = item.id
  editingChecklistLabel.value = item.label
}

function cancelEditChecklist() {
  editingChecklistId.value = null
  editingChecklistLabel.value = ''
}

async function saveEditChecklist(item) {
  if (!trip.value || !editingChecklistId.value) return
  const label = editingChecklistLabel.value.trim()
  if (!label) return

  await updateChecklistItem(trip.value.id, item.id, label)
  trip.value = await getTrip(route.params.id)

  editingChecklistId.value = null
  editingChecklistLabel.value = ''
}

async function removeChecklist(item) {
  if (!trip.value) return
  await deleteChecklistItem(trip.value.id, item.id)
  trip.value = await getTrip(route.params.id)

  if (editingChecklistId.value === item.id) {
    editingChecklistId.value = null
    editingChecklistLabel.value = ''
  }
}

</script>

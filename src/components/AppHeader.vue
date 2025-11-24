<template>
  <header class="site-header">
    <div class="site-header__bar">
      <div class="brand">Portulano</div>

      <!-- Navegação desktop -->
      <nav class="nav sm:hide">
        <RouterLink to="/">Painel</RouterLink>
        <RouterLink to="/usuario">Usuário</RouterLink>
      </nav>

      <div class="right-links sm:hide" v-if="userLabel">
        <span class="header-user">Olá, {{ userLabel }}</span>
      </div>

      <!-- Hambúrguer (mobile) -->
      <details class="menu sm:show">
        <summary aria-label="Menu">☰</summary>
        <nav class="menu__panel">
          <RouterLink to="/">Painel</RouterLink>
          <RouterLink to="/usuario">Usuário</RouterLink>

          <p v-if="userLabel" class="menu__user">
            {{ userLabel }}
          </p>
        </nav>
      </details>

    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const userLabel = computed(() => {
  if (!auth.user) return ''
  return auth.user.name || auth.user.email
})
</script>

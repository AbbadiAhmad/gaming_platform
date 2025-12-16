import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    component: () => import('@/views/DashboardView.vue')
  },
  {
    path: '/results',
    component: () => import('@/views/ResultsView.vue')
  },
  {
    path: '/login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/setup',
    component: () => import('@/views/SetupView.vue')
  },
  {
    path: '/admin',
    component: () => import('@/views/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/groups'
      },
      {
        path: 'groups',
        component: () => import('@/views/admin/GroupsView.vue')
      },
      {
        path: 'teams',
        component: () => import('@/views/admin/TeamsView.vue')
      },
      {
        path: 'games',
        component: () => import('@/views/admin/GamesView.vue')
      },
      {
        path: 'place-scores',
        component: () => import('@/views/admin/PlaceScoresView.vue')
      },
      {
        path: 'users',
        component: () => import('@/views/admin/UsersView.vue')
      }
    ]
  },
  {
    path: '/evaluate',
    component: () => import('@/views/EvaluateView.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;

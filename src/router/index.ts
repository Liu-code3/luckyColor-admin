import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import systemRouter from './systemRouter'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/index',
    },
    {
        path: '/index',
        name: 'index',
        redirect: '/index/login',
        component: () => import('../layout/index.vue'),
        meta: {
            keepAlive: true, // 设置需要缓存的组件
        },
        children:[
            {
                path: 'login',
                name: 'login',
                children:[
                    {
                        path: 'content',
                        name: 'content',
                        component: () => import('../views/content.vue'),
                    },
                ]
            },
            {
                path: 'bbb',
                name: 'bbb',
                component: () => import('../views/bbb.vue'),
            },
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router

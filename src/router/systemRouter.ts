const routes = [
            {
                path: 'login',
                name: 'login',
                component: () => import('../views/content.vue'),

             
            },
            {
                path: 'bbb',
                name: 'bbb',
                component: () => import('../views/bbb.vue'),
            },
        ]

export default routes
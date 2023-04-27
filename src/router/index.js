import { createRouter, createWebHashHistory } from 'vue-router';
import HomePage from '../view/home_page.vue';
import CardView from '../view/card.vue'

const routes = [
    {
        path: '/',
        name: 'HomePage',
        component: HomePage,
    },
    {
        path: '/card/:id',
        name: 'CardView',
        component: CardView,
        props: true,

    },


    // 其他路由...
];


const router = createRouter({
    history: createWebHashHistory(),
    routes,
});



export default router;

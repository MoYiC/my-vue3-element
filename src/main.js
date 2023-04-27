import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'
import App from './App.vue';
import router from './router';
import store from './store';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'


const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(ElementPlus);
app.use(store);
app.use(router);

app.mount('#app');

router.beforeEach((to, from, next) => {
    if (to.meta.requiresPassword) {
        const password = localStorage.getItem('password');
        if (!password) {
            next({ name: 'Home' });
        } else {
            next();
        }
    } else {
        next();
    }
});

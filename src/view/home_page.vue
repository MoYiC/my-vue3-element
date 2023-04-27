<template>
    <div class="home_page">

        <!-- 添加搜索框 -->
        <el-input ref="searchInput" v-model="searchQuery" placeholder="搜索" clearable suffix-icon="el-icon-search"
            @click="search">
            <template #prepend>
                <el-icon :size="20">
                    <search />
                </el-icon>
            </template>
        </el-input>

        <!-- 添加选择器 -->
        <div class="selectors-container">
            <el-select v-model="selectedOptions" multiple placeholder="类型">
                <el-option v-for="option in types" :key="option" :label="option" :value="option" />
            </el-select>
            <el-select v-model="selectedOptions1" multiple placeholder="城市">
                <el-option v-for="option in locations" :key="option" :label="option" :value="option" />
            </el-select>
            <el-select v-model="selectedOptions2" multiple placeholder="时间">
                <el-option v-for="option in times" :key="option" :label="option" :value="option" />
            </el-select>
            <el-select v-model="selectedOptions3" multiple placeholder="推荐">
                <el-option v-for="option in recommends" :key="option" :label="option" :value="option" />
            </el-select>


        </div>

        <!-- 添加卡片 -->
        <div class="cards-container">
            <el-card class="card" v-for="card in filteredAndSelectedCards" :key="card.id">
                <div @click="toCardView(card)">
                    <img :src="card.image_url" :alt="card.title" style="object-fit: cover; width: 100%; height: 100%;" />
                    <div class="text-content">
                        <h3>{{ card.title }}</h3>
                        <p>{{ card.description }}</p>
                    </div>
                </div>
            </el-card>
        </div>


        <!-- 在这里添加您需要的内容和组件 -->
    </div>
</template>
  
  
  
  
  
<script>
import axios from 'axios';
export default {
    name: 'home_page',
    data() {
        return {
            searchQuery: '',
            selectedOptions: [],
            selectedOptions1: [],
            selectedOptions2: [],
            cards: [],
            filteredCards: [],
            types: [],
            locations: [],
            times: [],
            recommends: [],
        };
    },
    async mounted() {
        try {
            const response = await axios.get('http://localhost:3001/api/cards');
            console.log('Cards data:', response.data);
            this.cards = response.data;
            this.filteredCards = response.data;
            // 获取类型选项
            this.types = [...new Set(this.cards.map(card => card.type))];
            // 获取城市选项
            this.locations = [...new Set(this.cards.map(card => card.location))];
            // 获取时间选项
            this.times = [...new Set(this.cards.map(card => card.time))];
            // 获取推荐选项
            this.recommends = [...new Set(this.cards.map(card => card.recommend))];
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    },

    computed: {
        needPassword() {
            return localStorage.getItem(`password-${this.$route.params.id}`) !== this.correctPassword;
        },
        filteredAndSelectedCards() {
            const selectedOptions = this.selectedOptions;
            const selectedOptions1 = this.selectedOptions1;
            const selectedOptions2 = this.selectedOptions2;
            const selectedOptions3 = this.selectedOptions3;
            const searchQuery = this.searchQuery.toLowerCase();
            return this.filteredCards.filter(card => {
                // 检查是否同时满足选择条件和搜索条件
                return selectedOptions.every(option => card.type.includes(option)) &&
                    selectedOptions1.every(option => card.location.includes(option)) &&
                    selectedOptions2.every(option => card.time.includes(option)) &&
                    selectedOptions3.every(option => card.recommend.includes(option)) &&
                    (card.title.toLowerCase().includes(searchQuery) || card.description.toLowerCase().includes(searchQuery));
            });
        },

    },
    methods: {
        search() {
            console.log('Searching for:', this.searchQuery);
            const searchQuery = this.searchQuery.toLowerCase();
            this.filteredCards = this.cards.filter(card => {
                // 检查是否满足搜索条件
                return card.title.toLowerCase().includes(searchQuery) || card.description.toLowerCase().includes(searchQuery);
            });
        },
        async toCardView(card) {
            const cardId = card.id;
            const correctPassword = await this.getPassword(cardId);
            const savedPassword = localStorage.getItem(`password-${cardId}`);
            if (correctPassword && savedPassword === correctPassword) {
                this.$router.push({ name: 'CardView', params: { id: cardId } });
            } else {
                this.$router.push({ name: 'CardView', params: { id: cardId } });
            }
        },
        async getPassword(id) {
            try {
                const response = await axios.get(`http://localhost:3001/api/password/${id}`);
                return response.data;
            } catch (error) {
                console.error('Error fetching password:', error);
            }
        },
    },

};
</script>


  
<style scoped>
.home {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.selectors-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 800px;
    /* 根据需要调整最大宽度 */
    margin: 0 auto;
    /* 居中选择器 */
    margin-top: 0px;
    /* 添加顶部间距 */
}

.cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-gap: 20px;
    margin-top: 20px;
}



.text-content {
    padding: 20px;
    /* 添加内边距 */
}

/* 添加媒体查询，限制对话框在小屏幕上的最大宽度 */
@media (max-width: 767px) {
    .el-dialog__wrapper .el-dialog {
        max-width: 90%;
    }
}
</style>
  
<template>
    <div class="card-page">

        <el-header class="nav-header">
            <el-page-header @back="goBack" :content="title" :title="cardData.title">
                <template #extra>
                    <div class="flex items-center">
                        <el-button type="primary" icon="el-icon-qrcode" @click="showQrCode">生成二维码</el-button>
                    </div>
                </template>

            </el-page-header>
        </el-header>

        <div :class="{ blur: needPassword }">
            <video controls v-if="cardData.video_url" :src="cardData.video_url" class="card-video"></video>
            <div v-else>Video not available</div>

            <el-descriptions class="card-video" title="详细信息" :column="1" :border=true>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            <el-icon :style="iconStyle">
                                <Location />
                            </el-icon>
                            位置
                        </div>
                    </template>
                    {{ cardData.location }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            <el-icon :style="iconStyle">
                                <Suitcase />
                            </el-icon>

                            类型
                        </div>
                    </template>
                    <el-tag>{{ cardData.type }}</el-tag>

                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            <el-icon :style="iconStyle">
                                <InfoFilled />
                            </el-icon>
                            状态
                        </div>
                    </template>
                    {{ cardData.status }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            <el-icon :style="iconStyle">
                                <Timer />
                            </el-icon>
                            时间
                        </div>
                    </template>
                    {{ cardData.time }}
                </el-descriptions-item>
            </el-descriptions>



            <div class="card-images">
                <el-row v-if="cardData.images && cardData.images.length > 0">
                    <el-col v-for="(url, index) in cardData.images" :key="'image-' + index" :span="8">
                        <el-image :src="url" class="card-image" fit="fill" :preview-src-list="cardData.images" />
                    </el-col>
                </el-row>
                <el-empty v-else description="空空如也" />
            </div>


            <div v-if="showQrCodeDialog">
                <el-dialog title="当前页面二维码" :visible="showQrCodeDialog" @update:visible="showQrCodeDialog = arguments[0]"
                    width="300px">
                    <div class="qrcode-container">
                        <qrcode :value="location.href" :size="200" level="H" />
                    </div>
                </el-dialog>
            </div>

        </div>
    </div>
</template>
  

<script>
import axios from 'axios';
import Qrcode from 'qrcode.vue';
export default {
    name: 'CardView',
    components: {
        Qrcode,
    },

    data() {
        return {
            form: {
                password: '',
            },
            rules: {
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                ],
            },
            cardData: {},
            blur: false, // 是否需要进行背景模糊的效果
            showQrCodeDialog: false, // 控制二维码对话框是否显示 
        };
    },

    async mounted() {
        document.addEventListener('keydown', this.handleKeyDown);
        const id = this.$route.params.id;
        try {
            const response = await axios.get(`http://localhost:3001/api/cards/${id}`);
            console.log('Card data:', response.data);
            this.cardData = response.data;

            const savedPassword = localStorage.getItem(`password-${id}`);
            const response2 = await axios.get(`http://localhost:3001/api/password/${id}`);
            const correctPassword = response2.data;
            if (correctPassword && savedPassword !== correctPassword) {
                this.showPasswordDialog();
                this.blur = true;
            }
        } catch (error) {
            console.error('Error fetching card:', error);
        }
    },

    computed: {
        needPassword() {
            const id = this.$route.params.id;
            return localStorage.getItem(`password-${id}`) !== this.cardData.password;
        },
    },

    methods: {
        goBack() {
            this.$router.go(-1);
        },

        showQrCode() {
            this.showQrCodeDialog = true;
            console.log('showQrCodeDialog:', this.showQrCodeDialog);
        },

        async showPasswordDialog() {
            // 创建遮罩层
            const mask = document.createElement('div');
            mask.style.position = 'fixed';
            mask.style.top = 0;
            mask.style.left = 0;
            mask.style.width = '100%';
            mask.style.height = '100%';
            mask.style.zIndex = 9999;
            mask.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            mask.style.pointerEvents = 'none'; // 添加这一行
            document.body.appendChild(mask);

            try {
                const id = this.$route.params.id;
                const correctPassword = await this.getPassword(id);

                const response = await this.$prompt('请输入密码', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputType: 'password',
                    inputPattern: /.+/,
                    inputErrorMessage: '请输入密码'
                });

                if (response.value === correctPassword) {
                    console.log('密码正确！');
                    localStorage.setItem(`password-${id}`, correctPassword);
                } else {
                    this.$message.error('密码错误，请重新输入！');
                    this.showPasswordDialog();
                }
            } catch (error) {
                console.error('Error showing password dialog:', error);
            } finally {
                // 删除遮罩层
                document.body.removeChild(mask);
            }
        },

        async getPassword(id) {
            try {
                const response = await axios.get(`http://localhost:3001/api/password/${id}`);
                return response.data;
            } catch (error) {
                console.error('Error fetching password:', error);
            }
        }
    }

};
</script>

<style lang="less" scoped>
.qrcode-container {
    display: flex;
    justify-content: center;
}

.cell-item {
    display: flex;
    align-items: center;
}

.nav-header {
    display: flex;

    align-items: center;

    font-size: 20px;
}

.card-video {
    width: 100%;
    height: auto;
    margin-top: 10px;
}



.password-form {
    margin-top: 20px;
    width: 300px;
}

.password-dialog-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9998;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);
}

.card-images {
    display: flex;
    flex-wrap: wrap;
    margin-top: 20px;
}

.card-images img {
    width: 120px;
    height: 120px;
    object-fit: cover;
    margin-right: 10px;
    margin-bottom: 10px;
}

.card-images .enlarge-image {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
}

.card-images .enlarge-image img {
    max-width: 80%;
    max-height: 80%;
    object-fit: contain;
    cursor: zoom-out;
}
</style>
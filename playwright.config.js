
const { defineConfig } = require('@playwright/test');
const path = require('node:path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = defineConfig({
    testDir: './tests',

    // Mỗi test có thể chạy độc lập
    fullyParallel: false,

    // Số lần thử lại nếu lỗi
    retries: 0,

    // Báo cáo kết quả
    reporter: [
        ['list'],
        ['html', {
            outputFolder: 'playwright-report',
            open: 'never'
        }]
    ],

    use: {
        baseURL: process.env.BASE_URL,

        // Sử dụng phiên đăng nhập đã lưu
        storageState: path.resolve(
            __dirname,
            process.env.PLAYWRIGHT_STORAGE_STATE || 'playwright/.auth/user.json'
        ),

        browserName: 'chromium',
        headless: false,

        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        video: 'retain-on-failure'
    }
});

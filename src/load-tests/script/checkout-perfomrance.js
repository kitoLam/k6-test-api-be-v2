import { check, sleep } from 'k6';
import http from 'k6/http';

// 1. Cấu hình k6
// Option là biến đặc biệt, k6 sẽ tự động tìm và đọc biến này ngay khi script bắt đầu chạy để thiết lập cấu hình cho toàn bộ bài test
const totalConcurrentUsers = 30;
export const options = {
    scenarios: {
        burst_checkout: {
            executor: 'per-vu-iterations', // Mỗi VU thực hiện số lần lặp cố định
            vus: totalConcurrentUsers,     // Giả lập
            iterations: 1,                 // Mỗi người chỉ làm đúng 1 lần
            maxDuration: '1m',             // Thời gian tối đa chờ 200 người này xong
        },
    },
    thresholds: {
        'http_req_failed': ['rate<1'], // Tham số này đo tỉ lệ request bị lỗi (lỗi network, timeout,...) Tỷ lệ lỗi phải dưới 1%.
        'http_req_duration': ['p(90)<5000'], // Tham số này đo độ trễ: 90% số request phải có thời gian phản hồi nhanh hơn 1000ms (1 giây).
    },
};

export default function () {
    // 2. Chuẩn bị mock data, header, payload nếu có

    // domain chưa fix
    const base_url = 'https://k6-test-api-be.vercel.app';

    // domain fix rồi
    // const base_url = 'http://localhost:5000';

    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTdiMTI4MjE2MjhmM2FmMDU5OTUzNTgiLCJyb2xlIjoiU0FMRV9TVEFGRiIsInR5cGUiOiJBQ0NFU1MiLCJpYXQiOjE3Njk5MTY3NzksImV4cCI6MTc3MjUwODc3OX0.INwAeHy_eQyK50J7rpmNpDzU7PzIqsIIHXXHD-YsZEs';
    const payload = JSON.stringify({
        products: [
            {
                product: {
                    product_id: '6965c4bc979f1a2fb5e32827',
                    sku: 'FRAME-003-01',
                },
                quantity: 1
            }
        ],
        paymentMethod: 'COD',
        fullName: `Testing User ${Math.floor(Math.random() * 1000)}`,
        phone: '0987654321',
        address: {
            street: '123 Test St',
            ward: 'Ward 1',
            city: 'HCM'
        },
        note: 'K6 performance test'
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };

    // 3. Thực thi request 
    const res = http.post(`${base_url}/api/v1/invoices`, payload, params);

    // 4. Kiểm tra
    check(res, {
        'Request thành công (2xx)': (r) => (r.status >= 200 && r.status <= 299),
        'Lỗi do Server (5xx)': (r) => !(r.status >= 500 && r.status <= 599),
        'Lỗi do Client (4xx)': (r) => !(r.status >= 400 && r.status <= 499),
    });
    // Mỗi VU sau 1s nếu chạy hết iteration thì chạy tiếp
    sleep(1); 
}
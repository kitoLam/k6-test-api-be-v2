import { check, sleep } from 'k6';
import http from 'k6/http';
// 1. Cấu hình 50 Users đồng thời
const totalConcurrentUsers = 50;
// Option là biến đặc biệt, k6 sẽ tự động tìm và đọc biến này ngay khi script bắt đầu chạy để thiết lập cấu hình cho toàn bộ bài test
export const options = {
    scenarios: {
        get_product_detail: {
            executor: 'per-vu-iterations', // Mỗi VU (Virtual User) sẽ chạy đúng N lần (iterations), rồi dừng.
            vus: totalConcurrentUsers,     // tổng Virtual User
            iterations: 1,                 // Mỗi VU chỉ làm đúng 1 lần
            maxDuration: '1m',             // Thời gian tối đa chờ 50 người này xong
        },
    },
    thresholds: {
        'http_req_failed': ['rate<0.01'], // Tham số này đo tỉ lệ request bị lỗi (lỗi network, timeout,...) Tỷ lệ lỗi phải dưới 1%.
        'http_req_duration': [
          'p(90)<1000',
          'p(90)<2000'
        ], // Tham số này đo độ trễ: 90% số request phải có thời gian phản hồi nhanh hơn 1000ms (1 giây).
    },
};

export default function () {

    // 2.Chuẩn bị data header, payload nếu có

    // Domain Free của vercel
    // const api = 'https://k6-test-api-be.vercel.app';

    // Domain Cloud
    // const api = 'http://34.92.192.47:5000';

    const base_url = 'http://localhost:5000';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTdiMTI4MjE2MjhmM2FmMDU5OTUzNTgiLCJyb2xlIjoiU0FMRV9TVEFGRiIsInR5cGUiOiJBQ0NFU1MiLCJpYXQiOjE3Njk5MTY3NzksImV4cCI6MTc3MjUwODc3OX0.INwAeHy_eQyK50J7rpmNpDzU7PzIqsIIHXXHD-YsZEs';
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };

    // 3. Thực thi request trực tiếp bằng http 
    const res = http.get(`${base_url}/api/v1/products/6965c4bc979f1a2fb5e3280d`, params);

    // 4. Hàm giúp kiểm tra thống kê các request đã gọi
    check(res, {
        'Request thành công (2xx)': (r) => (r.status >= 200 && r.status <= 299),
        'Lỗi do Server (5xx)': (r) => !(r.status >= 500 && r.status <= 599),
        'Lỗi do Client (4xx)': (r) => !(r.status >= 400 && r.status <= 499),
    });
    
    // Mỗi VU sau 1s nếu chạy hết iteration thì chạy tiếp
    sleep(1);
}